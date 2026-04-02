import mongoose from 'mongoose';

export type ReferralSettings = {
  _id?: string;
  enabled: boolean;
  rewardType: 'fixed' | 'percent';
  rewardValue: number; // e.g. $10 or 10%
  minOrderValue?: number;
  maxReward?: number;
  referralLimit?: number; // max referrals per user
  allowSelfReferral?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const ReferralSettingsSchema = new mongoose.Schema<ReferralSettings>({
  enabled: { type: Boolean, default: true },
  rewardType: { type: String, enum: ['fixed', 'percent'], required: true },
  rewardValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxReward: { type: Number },
  referralLimit: { type: Number },
  allowSelfReferral: { type: Boolean, default: false },
}, { timestamps: true });

const ReferralSettingsModel = mongoose.models.ReferralSettings || mongoose.model('ReferralSettings', ReferralSettingsSchema);

export default ReferralSettingsModel;
