import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';
import { emitAdminEvent } from '@/lib/eventBus';

export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const items = await TestimonialModel.find().sort({ order: 1, createdAt: -1 });
  return Response.json(items);
}) as any;

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const t = new TestimonialModel({
    name: 'New Reviewer',
    quote: 'Your review goes here…',
    rating: 5,
    role: 'Verified Buyer',
    city: 'New Delhi',
    published: true,
    order: 0,
  });
  try {
    await t.save();
    
    // Emit real-time event
    emitAdminEvent({
      type: 'testimonial.created',
      testimonialId: t._id,
      name: t.name
    });
    
    return Response.json({ message: 'Created', testimonial: t }, { status: 201 });
  } catch (err: any) {
    return Response.json({ message: err.message || 'Failed to create' }, { status: 500 });
  }
}) as any;
