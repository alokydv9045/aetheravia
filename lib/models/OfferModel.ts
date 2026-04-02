import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description?: string;
  type: 'popup' | 'banner' | 'flashSale';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products?: mongoose.Types.ObjectId[]; // For flash sales
  imageUrl?: string;
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
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
