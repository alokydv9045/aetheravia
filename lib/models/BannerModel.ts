import mongoose from 'mongoose';

export type Banner = {
  _id?: string;
  image: string;
  title?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
};

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String },
    link: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BannerModel = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default BannerModel;
