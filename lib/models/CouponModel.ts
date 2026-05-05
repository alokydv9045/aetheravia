import mongoose from 'mongoose';

// Coupon Types
export const COUPON_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_SHIPPING: 'free_shipping',
} as const;

export type CouponType = typeof COUPON_TYPE[keyof typeof COUPON_TYPE];

// Coupon Status
export const COUPON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
} as const;

export type CouponStatus = typeof COUPON_STATUS[keyof typeof COUPON_STATUS];

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: Object.values(COUPON_TYPE),
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: 1,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  usagePerUser: {
    type: Number,
    default: 1,
    min: 1,
  },
  status: {
    type: String,
    enum: Object.values(COUPON_STATUS),
    default: COUPON_STATUS.ACTIVE,
  },
  // Conditions
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [String],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  // User restrictions
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  excludedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // First-time users only
  firstTimeUsersOnly: {
    type: Boolean,
    default: false,
  },
  // Tracking
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    orderValue: Number,
    discountApplied: Number,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
try {
  // Note: code field already has unique index from schema definition
  couponSchema.index({ status: 1, expiryDate: 1 });
  couponSchema.index({ startDate: 1, expiryDate: 1 });
  couponSchema.index({ createdAt: -1 });
} catch (error) {
  // Ignore index creation errors during development
  console.warn('Index creation warning:', error);
}

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual to check if coupon is active
couponSchema.virtual('isActive').get(function() {
  return this.status === COUPON_STATUS.ACTIVE && 
         new Date() >= this.startDate && 
         new Date() <= this.expiryDate &&
         (this.usageLimit == null || (this.usageCount ?? 0) < this.usageLimit);
});

// Virtual to get remaining usage
couponSchema.virtual('remainingUsage').get(function() {
  if (this.usageLimit == null) return 'Unlimited';
  return Math.max(0, this.usageLimit - (this.usageCount ?? 0));
});

// Method to check if coupon is valid for a user
couponSchema.methods.isValidForUser = function(
  userId: string | null | undefined, 
  orderValue: number, 
  userOrderHistory: any[] = [],
  items: any[] = []
) {
  try {
    // Check if coupon is active
    if (!this.isActive) {
      return { valid: false, reason: 'Coupon is not active or has expired' };
    }

    // Check minimum order amount
    if (orderValue < this.minimumOrderAmount) {
      return { 
        valid: false, 
        reason: `Minimum order amount is ₹${this.minimumOrderAmount}` 
      };
    }

    // Check product/category restrictions
    const hasProductRestrictions = this.applicableProducts && this.applicableProducts.length > 0;
    const hasCategoryRestrictions = this.applicableCategories && this.applicableCategories.length > 0;
    const hasExclusions = this.excludedProducts && this.excludedProducts.length > 0;

    if (hasProductRestrictions || hasCategoryRestrictions || hasExclusions) {
      if (!items || items.length === 0) {
        return { valid: false, reason: 'No items to validate against coupon restrictions' };
      }

      const applicableItems = items.filter(item => {
        // Check if explicitly excluded
        if (hasExclusions && this.excludedProducts.some((id: any) => id.toString() === (item.productId || item._id)?.toString())) {
          return false;
        }

        // Check if matches product restriction
        const matchesProduct = hasProductRestrictions && this.applicableProducts.some((id: any) => id.toString() === (item.productId || item._id)?.toString());
        
        // Check if matches category restriction
        const matchesCategory = hasCategoryRestrictions && this.applicableCategories.includes(item.category);

        // If both restrictions exist, an item must match at least one (OR logic)
        if (hasProductRestrictions && hasCategoryRestrictions) {
          return matchesProduct || matchesCategory;
        }
        
        // If only one exists, it must match that one
        if (hasProductRestrictions) return matchesProduct;
        if (hasCategoryRestrictions) return matchesCategory;

        // If no positive restrictions (only exclusions), it's applicable
        return true;
      });

      if (applicableItems.length === 0) {
        return { 
          valid: false, 
          reason: 'This coupon is not applicable to the items in your bag' 
        };
      }
    }

    // If no userId provided, only global/item checks apply
    if (!userId) {
      if (this.allowedUsers && this.allowedUsers.length > 0) {
        return { valid: false, reason: 'Please sign in to use this restricted coupon' };
      }
      if (this.firstTimeUsersOnly) {
        return { valid: false, reason: 'Please sign in to verify first-time user status' };
      }
      return { valid: true, reason: null };
    }

    // Check if user is allowed (if allowedUsers is specified)
    if (this.allowedUsers && this.allowedUsers.length > 0) {
      const isAllowed = this.allowedUsers.some((u: any) => u.toString() === userId.toString());
      if (!isAllowed) {
        return { valid: false, reason: 'Coupon not available for this user' };
      }
    }

    // Check if user is excluded
    if (this.excludedUsers && this.excludedUsers.length > 0) {
      const isExcluded = this.excludedUsers.some((u: any) => u.toString() === userId.toString());
      if (isExcluded) {
        return { valid: false, reason: 'Coupon not available for this user' };
      }
    }

    // Check first-time users only
    if (this.firstTimeUsersOnly && userOrderHistory && userOrderHistory.length > 0) {
      return { valid: false, reason: 'Coupon is only for first-time users' };
    }

    // Check usage per user
    const userUsageCount = this.usedBy ? this.usedBy.filter((usage: any) => 
      usage.user && usage.user.toString() === userId.toString()
    ).length : 0;
    
    if (userUsageCount >= (this.usagePerUser || 1)) {
      return { 
        valid: false, 
        reason: `You have already used this coupon ${this.usagePerUser || 1} time(s)` 
      };
    }

    return { valid: true, reason: null };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, reason: 'Error validating coupon' };
  }
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderValue: number, shippingCost: number = 0, items: any[] = []) {
  let discount = 0;
  
  // Calculate the total value of items that the coupon applies to
  let applicableValue = orderValue;
  
  const hasProductRestrictions = this.applicableProducts && this.applicableProducts.length > 0;
  const hasCategoryRestrictions = this.applicableCategories && this.applicableCategories.length > 0;
  const hasExclusions = this.excludedProducts && this.excludedProducts.length > 0;

  if ((hasProductRestrictions || hasCategoryRestrictions || hasExclusions) && items.length > 0) {
    applicableValue = items.reduce((sum, item) => {
      // Check exclusion
      if (hasExclusions && this.excludedProducts.some((id: any) => id.toString() === (item.productId || item._id)?.toString())) {
        return sum;
      }

      // Check product restriction
      const matchesProduct = hasProductRestrictions && this.applicableProducts.some((id: any) => id.toString() === (item.productId || item._id)?.toString());
      
      // Check category restriction
      const matchesCategory = hasCategoryRestrictions && this.applicableCategories.includes(item.category);

      let isApplicable = true;
      if (hasProductRestrictions && hasCategoryRestrictions) {
        isApplicable = matchesProduct || matchesCategory;
      } else if (hasProductRestrictions) {
        isApplicable = matchesProduct;
      } else if (hasCategoryRestrictions) {
        isApplicable = matchesCategory;
      }

      return isApplicable ? sum + (item.price * item.qty) : sum;
    }, 0);
  }

  switch (this.type) {
    case COUPON_TYPE.PERCENTAGE:
      discount = (applicableValue * this.value) / 100;
      if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
        discount = this.maximumDiscountAmount;
      }
      break;
    
    case COUPON_TYPE.FIXED_AMOUNT:
      discount = Math.min(this.value, applicableValue);
      break;
    
    case COUPON_TYPE.FREE_SHIPPING:
      discount = shippingCost;
      break;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon usage
couponSchema.methods.applyCoupon = async function(userId: string, orderValue: number, discountApplied: number) {
  this.usageCount += 1;
  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
    orderValue,
    discountApplied,
  });
  
  return await this.save();
};

// Pre-save middleware to update status
couponSchema.pre('save', function(next) {
  // Auto-expire coupons
  if (new Date() > this.expiryDate && this.status === COUPON_STATUS.ACTIVE) {
    this.status = COUPON_STATUS.EXPIRED;
  }
  
  // Auto-deactivate if usage limit reached
  if (this.usageLimit && this.usageCount >= this.usageLimit && this.status === COUPON_STATUS.ACTIVE) {
    this.status = COUPON_STATUS.INACTIVE;
  }
  
  next();
});

// Create model with better error handling
const CouponModel = mongoose.models?.Coupon || mongoose.model('Coupon', couponSchema);

export default CouponModel;

// TypeScript interfaces
export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  startDate: Date;
  expiryDate: Date;
  usageLimit?: number;
  usageCount: number;
  usagePerUser: number;
  status: CouponStatus;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  allowedUsers: string[];
  excludedUsers: string[];
  firstTimeUsersOnly: boolean;
  usedBy: Array<{
    user: string;
    usedAt: Date;
    orderValue: number;
    discountApplied: number;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isExpired: boolean;
  isActive: boolean;
  remainingUsage: string | number;
  
  // Methods
  isValidForUser: (userId: string, orderValue: number, userOrderHistory: any[]) => { valid: boolean; reason: string | null };
  calculateDiscount: (orderValue: number, shippingCost?: number) => number;
  applyCoupon: (userId: string, orderValue: number, discountApplied: number) => Promise<any>;
}