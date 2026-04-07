import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PopupBanner from '@/lib/models/PopupBannerModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: Get a single popup/banner by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const item = await PopupBanner.findById(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// PUT: Update a popup/banner by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const data = await req.json();
  const item = await PopupBanner.findByIdAndUpdate(id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// DELETE: Delete a popup/banner by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const item = await PopupBanner.findByIdAndDelete(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
