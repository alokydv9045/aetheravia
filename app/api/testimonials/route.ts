import { NextRequest } from 'next/server';

import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';

type TItem = {
  id: string;
  name: string;
  role?: string;
  rating?: number;
  quote: string;
  city?: string;
};

const INDIA_TESTIMONIALS: TItem[] = [
  {
    id: 'in-1',
    name: 'Aarav Sharma',
    role: 'Verified Buyer',
    city: 'New Delhi',
    rating: 5,
    quote:
      'Impressive quality and premium finish. Delivery was quick and packaging felt luxurious. Value for money!'
  },
  {
    id: 'in-2',
    name: 'Ananya Iyer',
    role: 'Fashion Blogger',
    city: 'Bengaluru',
    rating: 5,
    quote:
      'The silhouettes and fabrics are stunning. Pairing was effortless — got compliments at a wedding!'
  },
  {
    id: 'in-3',
    name: 'Rohan Mehta',
    role: 'Verified Buyer',
    city: 'Mumbai',
    rating: 4,
    quote:
      'Fits true to size and feels premium. Exchange process was smooth — customer care was helpful.'
  },
  {
    id: 'in-4',
    name: 'Ishita Gupta',
    role: 'Stylist',
    city: 'Kolkata',
    rating: 5,
    quote:
      'Minimal, chic, and well-constructed. Great for festive layering and everyday elegance alike.'
  },
];

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const docs = await TestimonialModel.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(24)
      .lean();
    if (Array.isArray(docs) && docs.length) {
      const items: TItem[] = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        role: [d.role, d.city].filter(Boolean).join(' · ') || undefined,
        rating: d.rating,
        quote: d.quote,
        city: d.city,
      }));
      return Response.json({ items });
    }
  } catch (e) {
    // ignore and fallback
  }
  return Response.json({ items: INDIA_TESTIMONIALS });
}
