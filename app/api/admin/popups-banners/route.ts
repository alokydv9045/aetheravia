import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PopupBanner from '@/lib/models/PopupBannerModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: List all popups/banners
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const items = await PopupBanner.find({}).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

// POST: Create a new popup/banner
export async function POST(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const data = await req.json();
  const item = await PopupBanner.create(data);
  return NextResponse.json(item, { status: 201 });
}
