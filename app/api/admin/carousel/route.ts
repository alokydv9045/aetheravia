import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannerModel from '@/lib/models/BannerModel';
import { auth } from '@/lib/auth';

export const GET = auth(async (req, ctx) => {
  await dbConnect();
  const banners = await BannerModel.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(banners);
});

export const POST = auth(async (req, ctx) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();
  const banner = new BannerModel(body);
  await banner.save();
  return NextResponse.json({ message: 'Banner created', banner }, { status: 201 });
});
