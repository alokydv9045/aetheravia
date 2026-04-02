import mongoose from 'mongoose';

export type PopupBanner = {
  _id?: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'popup' | 'banner';
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  targetAudience?: string; // e.g. 'all', 'new-users', 'returning', etc.
  createdAt?: Date;
  updatedAt?: Date;
};

const PopupBannerSchema = new mongoose.Schema<PopupBanner>({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String },
  type: { type: String, enum: ['popup', 'banner'], required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  targetAudience: { type: String, default: 'all' },
}, { timestamps: true });

const PopupBannerModel = mongoose.models.PopupBanner || mongoose.model('PopupBanner', PopupBannerSchema);

export default PopupBannerModel;
