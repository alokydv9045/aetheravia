import mongoose from 'mongoose';

// Ensure mongoose is properly initialized
declare global {
  var mongoose: any;
}

// Order Status Enum
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Timeline Event Schema
const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    
    // Coupon Information
    coupon: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    
    // Enhanced order tracking fields
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      required: true,
    },
    timeline: [timelineEventSchema],
    
    
    notes: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
    
    // Delivery Partner Information
    deliveryPartner: {
      provider: String,
      trackingId: String,
      estimatedDelivery: Date,
      assignedAt: Date,
      courierName: String,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    
    // Compatibility field for orderStatus
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
    },
  },
  {
    timestamps: true,
  },
);

// Add index for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to automatically add timeline events
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add initial timeline event for new orders
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      description: 'Order placed successfully',
      location: this.shippingAddress?.city || '',
    });
  } else if (this.isModified('status')) {
    // Add timeline event when status changes
    const statusDescriptions = {
      [ORDER_STATUS.PENDING]: 'Order received and is being reviewed',
      [ORDER_STATUS.CONFIRMED]: 'Order confirmed and payment verified',
      [ORDER_STATUS.PROCESSING]: 'Order is being prepared for shipment',
      [ORDER_STATUS.SHIPPED]: 'Order has been shipped',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Order is out for delivery',
      [ORDER_STATUS.DELIVERED]: 'Order has been delivered successfully',
      [ORDER_STATUS.CANCELLED]: 'Order has been cancelled',
      [ORDER_STATUS.RETURNED]: 'Order has been returned',
    };

    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      description: statusDescriptions[this.status as OrderStatus] || `Order status updated to ${this.status}`,
      location: this.shippingAddress?.city || '',
    });

    // Update delivery date if delivered
    if (this.status === ORDER_STATUS.DELIVERED && !this.deliveredAt) {
      this.deliveredAt = new Date();
      this.isDelivered = true;
    }
    
    // Sync orderStatus with status
    this.orderStatus = this.status;
  }
  next();
});

// Instance method to add custom timeline events
orderSchema.methods.addTimelineEvent = function(status: OrderStatus, description: string, options: any = {}) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    description,
    location: options.location || this.shippingAddress?.city || '',
    updatedBy: options.updatedBy,
    metadata: options.metadata || {},
  });
  return this.save();
};

// Instance method to get current progress percentage
orderSchema.methods.getProgressPercentage = function() {
  const statusOrder = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ];
  
  const currentIndex = statusOrder.indexOf(this.status);
  if (currentIndex === -1) return 0;
  
  return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
};

// Instance method to get next expected status
orderSchema.methods.getNextStatus = function() {
  const statusFlow: Record<OrderStatus, OrderStatus> = {
    [ORDER_STATUS.PENDING]: ORDER_STATUS.CONFIRMED,
    [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PROCESSING,
    [ORDER_STATUS.PROCESSING]: ORDER_STATUS.SHIPPED,
    [ORDER_STATUS.SHIPPED]: ORDER_STATUS.OUT_FOR_DELIVERY,
    [ORDER_STATUS.OUT_FOR_DELIVERY]: ORDER_STATUS.DELIVERED,
    [ORDER_STATUS.DELIVERED]: ORDER_STATUS.DELIVERED, // No next status
    [ORDER_STATUS.CANCELLED]: ORDER_STATUS.CANCELLED, // No next status
    [ORDER_STATUS.RETURNED]: ORDER_STATUS.RETURNED, // No next status
  };
  
  return statusFlow[this.status as OrderStatus] || null;
};

// Create model with better error handling
let OrderModel: mongoose.Model<any>;

// Force re-registration in development to ensure schema changes are picked up
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.Order) {
  delete (mongoose.models as any).Order;
}

if (mongoose.models && mongoose.models.Order) {
  OrderModel = mongoose.models.Order;
} else {
  try {
    OrderModel = mongoose.model('Order', orderSchema);
  } catch (error) {
    // If model already exists, use it
    if (error instanceof Error && error.message.includes('Cannot overwrite')) {
      OrderModel = mongoose.model('Order');
    } else {
      throw error;
    }
  }
}

export default OrderModel;

export type TimelineEvent = {
  status: OrderStatus;
  timestamp: Date;
  description: string;
  location: string;
  updatedBy?: string;
  metadata?: Record<string, any>;
};

export type Order = {
  _id: string;
  user?: { name: string };
  items: [OrderItem];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: { id: string; status: string; email_address: string };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  
  // Coupon Information
  coupon?: {
    code: string;
    name: string;
    type: string;
    discountAmount: number;
    originalOrderValue: number;
  };
  
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  
  // Enhanced fields
  status: OrderStatus;
  orderStatus?: OrderStatus;
  timeline: TimelineEvent[];
  notes: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  pointsAwarded: boolean;
  
  deliveryPartner?: {
    provider: string;
    trackingId: string;
    estimatedDelivery: string | Date;
    assignedAt: string | Date;
    courierName: string;
    assignedBy?: string | { name: string; email: string };
  };
  
  // Virtual methods
  getProgressPercentage?: () => number;
  getNextStatus?: () => OrderStatus | null;
  addTimelineEvent?: (status: OrderStatus, description: string, options?: any) => Promise<any>;
};

export type OrderItem = {
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
  color: string;
  mlQuantity: string;
};

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
