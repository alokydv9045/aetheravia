import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryStats extends Document {
  _id: string;
  date: Date; // Date for which stats are calculated
  providerId: string; // Reference to shipping provider
  
  // Daily metrics
  totalShipments: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  cancelledShipments: number;
  
  // Performance metrics
  averageDeliveryTime: number; // in hours
  onTimeDeliveryRate: number; // percentage
  customerSatisfactionScore: number; // 1-5 scale
  
  // Financial metrics
  totalRevenue: number;
  totalCost: number;
  profit: number;
  
  // Volume metrics
  totalWeight: number; // in kg
  totalDistance: number; // in km
  
  // Regional breakdown
  regionBreakdown: {
    region: string;
    shipments: number;
    successRate: number;
    avgDeliveryTime: number;
  }[];
  
  // Service type breakdown
  serviceBreakdown: {
    serviceType: string; // 'standard', 'express', 'same-day', 'cod'
    count: number;
    successRate: number;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryStatsSchema = new Schema<IDeliveryStats>({
  date: {
    type: Date,
    required: true,
    index: true
  },
  providerId: {
    type: String,
    required: true,
    index: true
  },
  totalShipments: { type: Number, default: 0 },
  successfulDeliveries: { type: Number, default: 0 },
  failedDeliveries: { type: Number, default: 0 },
  pendingDeliveries: { type: Number, default: 0 },
  cancelledShipments: { type: Number, default: 0 },
  averageDeliveryTime: { type: Number, default: 0 },
  onTimeDeliveryRate: { type: Number, default: 0 },
  customerSatisfactionScore: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  totalWeight: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 },
  regionBreakdown: [{
    region: String,
    shipments: Number,
    successRate: Number,
    avgDeliveryTime: Number
  }],
  serviceBreakdown: [{
    serviceType: String,
    count: Number,
    successRate: Number
  }]
}, {
  timestamps: true
});

// Compound indexes for performance
DeliveryStatsSchema.index({ date: -1, providerId: 1 });
DeliveryStatsSchema.index({ providerId: 1, date: -1 });

export default mongoose.models.DeliveryStats || mongoose.model<IDeliveryStats>('DeliveryStats', DeliveryStatsSchema);