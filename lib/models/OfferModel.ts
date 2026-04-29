import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description?: string;
  type: 'popup' | 'banner' | 'flashSale';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products?: mongoose.Types.ObjectId[]; // Selected products for this offer
  discountPercentage?: number; // E.g. 30
  imageUrl?: string;
  linkUrl?: string;
  priority: number;
  content?: string;
  promoCode?: string;
  targetAudience?: 'all' | 'new' | 'vip';
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['popup', 'banner', 'flashSale'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    discountPercentage: { type: Number, default: 0 },
    imageUrl: { type: String },
    linkUrl: { type: String },
    priority: { type: Number, default: 1 },
    content: { type: String },
    promoCode: { type: String },
    targetAudience: { type: String, enum: ['all', 'new', 'vip'], default: 'all' },
  },
  { timestamps: true }
);

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
