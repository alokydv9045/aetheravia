// Database Models for 3PL Integration
import mongoose from 'mongoose';

// Shipment Schema
const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['DELIVERY_COM', 'E_CART', 'DELHIVERY', 'BLUEDART', 'SHIPPO', 'OTHER'],
    required: true,
  },
  shipmentId: {
    type: String,
    required: true,
  },
  courierName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'CREATED',           // Shipment created
      'PICKED_UP',         // Package picked up
      'IN_TRANSIT',        // In transit
      'OUT_FOR_DELIVERY',  // Out for delivery
      'DELIVERED',         // Successfully delivered
      'FAILED_DELIVERY',   // Delivery attempt failed
      'RETURNED',          // Returned to sender
      'CANCELLED',         // Shipment cancelled
      'LOST',              // Package lost
      'DAMAGED',           // Package damaged
    ],
    default: 'CREATED',
    index: true,
  },
  statusCode: {
    type: String,
  },
  currentLocation: {
    type: String,
  },
  estimatedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
  shippingCharges: {
    type: Number,
    required: true,
  },
  codAmount: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number, // in grams
    required: true,
  },
  dimensions: {
    length: { type: Number, default: 10 },
    width: { type: Number, default: 10 },
    height: { type: Number, default: 5 },
  },
  packageDetails: {
    type: String,
  },
  trackingHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: String,
    location: String,
    remarks: String,
    updatedBy: {
      type: String,
      enum: ['SYSTEM', 'WEBHOOK', 'MANUAL'],
      default: 'SYSTEM',
    },
  }],
  webhookData: [{
    timestamp: { type: Date, default: Date.now },
    provider: String,
    data: mongoose.Schema.Types.Mixed,
  }],
  deliveryAttempts: [{
    attemptDate: { type: Date, default: Date.now },
    status: String,
    reason: String,
    nextAttemptDate: Date,
  }],
  returnDetails: {
    isReturned: { type: Boolean, default: false },
    returnReason: String,
    returnDate: Date,
    returnTrackingId: String,
  },
  customerFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    deliveryExperience: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'],
    },
  },
  metadata: {
    createdBy: { type: String, default: 'SYSTEM' },
    updatedBy: String,
    notes: String,
    tags: [String],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
shipmentSchema.index({ orderId: 1, trackingId: 1 });
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ provider: 1, status: 1 });
shipmentSchema.index({ estimatedDelivery: 1 });
shipmentSchema.index({ 'trackingHistory.timestamp': -1 });

// Virtual for delivery time calculation
shipmentSchema.virtual('deliveryTime').get(function() {
  if (this.actualDelivery && this.createdAt) {
    return Math.ceil((this.actualDelivery.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to add tracking update
shipmentSchema.methods.addTrackingUpdate = function(status: string, location?: string, remarks?: string, updatedBy = 'SYSTEM') {
  this.trackingHistory.push({
    timestamp: new Date(),
    status,
    location,
    remarks,
    updatedBy,
  });
  
  this.status = status;
  if (location) this.currentLocation = location;
  
  return this.save();
};

// Method to update delivery attempt
shipmentSchema.methods.addDeliveryAttempt = function(status: string, reason?: string, nextAttemptDate?: Date) {
  this.deliveryAttempts.push({
    attemptDate: new Date(),
    status,
    reason,
    nextAttemptDate,
  });
  
  return this.save();
};

// Static method to get shipments by status
shipmentSchema.statics.getByStatus = function(status: string, limit = 50) {
  return this.find({ status })
    .populate('orderId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get delivery analytics
shipmentSchema.statics.getDeliveryAnalytics = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          provider: '$provider',
          status: '$status',
        },
        count: { $sum: 1 },
        totalCharges: { $sum: '$shippingCharges' },
        avgDeliveryTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'DELIVERED'] },
              {
                $divide: [
                  { $subtract: ['$actualDelivery', '$createdAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              },
              null
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.provider',
        statusBreakdown: {
          $push: {
            status: '$_id.status',
            count: '$count',
            totalCharges: '$totalCharges',
            avgDeliveryTime: '$avgDeliveryTime',
          }
        },
        totalShipments: { $sum: '$count' },
        totalRevenue: { $sum: '$totalCharges' },
      }
    }
  ]);
};

export const Shipment = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);

// Courier Configuration Schema
const courierConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['DELIVERY_COM', 'E_CART', 'DELHIVERY', 'BLUEDART', 'SHIPPO'],
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  config: {
    apiKey: { type: String, required: true },
    secretKey: String,
    baseUrl: { type: String, required: true },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    webhookUrl: String,
    webhookSecret: String,
  },
  serviceability: {
    supportedPincodes: [String],
    maxWeight: { type: Number, default: 50000 }, // in grams
    maxDimensions: {
      length: { type: Number, default: 100 },
      width: { type: Number, default: 100 },
      height: { type: Number, default: 100 },
    },
    codSupported: { type: Boolean, default: true },
    internationalShipping: { type: Boolean, default: false },
  },
  pricing: {
    baseFare: Number,
    perKgRate: Number,
    codCharges: Number,
    fuelSurcharge: Number,
    gstPercentage: { type: Number, default: 18 },
  },
  sla: {
    averageDeliveryDays: { type: Number, default: 3 },
    maxDeliveryDays: { type: Number, default: 7 },
    pickupTime: String, // e.g., "24 hours"
  },
  metadata: {
    lastSyncAt: Date,
    rateUpdatedAt: Date,
    notes: String,
  },
}, {
  timestamps: true,
});

export const CourierConfig = mongoose.models.CourierConfig || mongoose.model('CourierConfig', courierConfigSchema);