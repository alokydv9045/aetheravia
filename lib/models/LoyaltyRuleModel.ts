import mongoose from 'mongoose';

export type LoyaltyRule = {
  _id?: string;
  name: string;
  description?: string;
  earnType: 'order' | 'product' | 'category';
  earnValue: number; // e.g. 1 point per $X spent
  earnUnit: number; // e.g. $1, $10, etc.
  redeemValue: number; // e.g. $1 per 100 points
  minRedeemPoints?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const LoyaltyRuleSchema = new mongoose.Schema<LoyaltyRule>({
  name: { type: String, required: true },
  description: { type: String },
  earnType: { type: String, enum: ['order', 'product', 'category'], required: true },
  earnValue: { type: Number, required: true },
  earnUnit: { type: Number, required: true },
  redeemValue: { type: Number, required: true },
  minRedeemPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LoyaltyRuleModel = mongoose.models.LoyaltyRule || mongoose.model('LoyaltyRule', LoyaltyRuleSchema);

export default LoyaltyRuleModel;
