import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';
import { emitAdminEvent } from '@/lib/eventBus';

const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

export const GET = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  const item = await TestimonialModel.findById(id);
  if (!item) return Response.json({ message: 'not found' }, { status: 404 });
  return Response.json(item);
}) as any;

export const PUT = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  const body = await req.json();
  const item = await TestimonialModel.findById(id);
  if (!item) return Response.json({ message: 'not found' }, { status: 404 });
  if (typeof body.name === 'string') item.name = body.name.trim();
  if (typeof body.quote === 'string') item.quote = body.quote.trim();
  if (typeof body.role === 'string') item.role = body.role.trim();
  if (typeof body.city === 'string') item.city = body.city.trim();
  if (typeof body.rating === 'number') item.rating = Math.max(1, Math.min(5, Math.round(body.rating)));
  if (typeof body.published === 'boolean') item.published = body.published;
  if (typeof body.order === 'number') item.order = body.order;
  await item.save();
  
  // Emit real-time event
  emitAdminEvent({
    type: 'testimonial.updated',
    testimonialId: id,
    name: item.name
  });
  
  return Response.json({ message: 'updated' });
}) as any;

export const DELETE = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json({ message: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!isValidObjectIdString(id)) return Response.json({ message: 'invalid id' }, { status: 400 });
  await dbConnect();
  const item = await TestimonialModel.findById(id);
  await TestimonialModel.findByIdAndDelete(id);
  
  // Emit real-time event
  if (item) {
    emitAdminEvent({
      type: 'testimonial.deleted',
      testimonialId: id,
      name: item.name
    });
  }
  
  return Response.json({ message: 'deleted' });
}) as any;
