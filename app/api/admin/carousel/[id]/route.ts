
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannerModel from '@/lib/models/BannerModel';
import { auth } from '@/lib/auth';

// Get a single banner by id
export const GET = auth(async (req, ctx) => {
  await dbConnect();
  const { id } = (ctx as any).params;
  const banner = await BannerModel.findById(id);
  if (!banner) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json(banner);
});

// Update a banner
export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { id } = (ctx as any).params;
  const body = await req.json();
  const banner = await BannerModel.findByIdAndUpdate(id, body, { new: true });
  if (!banner) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Banner updated', banner });
});

// Delete a banner
export const DELETE = auth(async (req, ctx) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { id } = (ctx as any).params;
  const banner = await BannerModel.findByIdAndDelete(id);
  if (!banner) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Banner deleted' });
});
