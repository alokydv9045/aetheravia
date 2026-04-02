import mongoose from 'mongoose';

export type Testimonial = {
  _id?: string;
  name: string;
  quote: string;
  rating?: number; // 1..5
  role?: string;
  city?: string;
  published?: boolean;
  order?: number;
};

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    role: { type: String, trim: true },
    city: { type: String, trim: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

testimonialSchema.index({ published: 1, order: 1, createdAt: -1 });

const TestimonialModel =
  mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);

export default TestimonialModel;
