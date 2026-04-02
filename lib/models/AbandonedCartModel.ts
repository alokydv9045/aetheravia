import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAbandonedCart extends Document {
  userId: Types.ObjectId | null;
  items: Array<{
    product: Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

export default mongoose.models.AbandonedCart || mongoose.model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);
