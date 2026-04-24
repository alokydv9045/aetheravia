import mongoose from 'mongoose';

export type Product = {
  _id?: string;
  name: string;
  slug: string;
  image: string;
  images?: string[];
  banner?: string;
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  colors?: string[];
  sizes?: string[];
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    banner: String,
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ rating: -1 });
productSchema.index({ category: 1 });

const ProductModel =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default ProductModel;
