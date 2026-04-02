import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PopupBanner from '@/lib/models/PopupBannerModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: Get a single popup/banner by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  await requireAdminSession();
  const item = await PopupBanner.findById(params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// PUT: Update a popup/banner by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  await requireAdminSession();
  const data = await req.json();
  const item = await PopupBanner.findByIdAndUpdate(params.id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// DELETE: Delete a popup/banner by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  await requireAdminSession();
  const item = await PopupBanner.findByIdAndDelete(params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
