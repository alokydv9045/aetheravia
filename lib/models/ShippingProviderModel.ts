import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingProvider extends Document {
  _id: string;
  providerId: string; // unique identifier like 'shippo', 'delivery_com'
  name: string;
  type: 'shipping' | '3pl';
  status: 'active' | 'inactive' | 'testing';
  integration: string; // 'API', 'Webhook', 'API + Webhook'
  
  // Configuration
  config: {
    apiKey?: string;
    secretKey?: string;
    baseUrl?: string;
    environment?: 'production' | 'sandbox' | 'test';
    webhookUrl?: string;
    webhookSecret?: string;
  };
  
  // Features and capabilities
  features: string[];
  supportedServices: string[];
  coverageAreas: string[];
  
  // Performance metrics
  metrics: {
    totalOrders: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageDeliveryTime: number; // in hours
    lastSyncAt: Date;
    lastSuccessfulSync: Date;
    webhookUptime: number; // percentage
  };
  
  // Business details
  pricing: {
    baseCost: number;
    perKgCost: number;
    perKmCost: number;
    codCharges: number;
    insuranceRate: number;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes?: string;
}

const ShippingProviderSchema = new Schema<IShippingProvider>({
  providerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['shipping', '3pl'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'testing'],
    default: 'inactive'
  },
  integration: {
    type: String,
    required: true
  },
  config: {
    apiKey: String,
    secretKey: String,
    baseUrl: String,
    environment: {
      type: String,
      enum: ['production', 'sandbox', 'test'],
      default: 'sandbox'
    },
    webhookUrl: String,
    webhookSecret: String
  },
  features: [String],
  supportedServices: [String],
  coverageAreas: [String],
  metrics: {
    totalOrders: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 },
    lastSyncAt: { type: Date, default: Date.now },
    lastSuccessfulSync: { type: Date, default: Date.now },
    webhookUptime: { type: Number, default: 100 }
  },
  pricing: {
    baseCost: { type: Number, default: 0 },
    perKgCost: { type: Number, default: 0 },
    perKmCost: { type: Number, default: 0 },
    codCharges: { type: Number, default: 0 },
    insuranceRate: { type: Number, default: 0 }
  },
  createdBy: String,
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
ShippingProviderSchema.index({ status: 1 });
ShippingProviderSchema.index({ type: 1 });
ShippingProviderSchema.index({ 'metrics.lastSyncAt': -1 });

export default mongoose.models.ShippingProvider || mongoose.model<IShippingProvider>('ShippingProvider', ShippingProviderSchema);