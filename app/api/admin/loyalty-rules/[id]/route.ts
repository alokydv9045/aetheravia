import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LoyaltyRule from '@/lib/models/LoyaltyRuleModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: Get a single loyalty rule by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const rule = await LoyaltyRule.findById(id);
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rule);
}

// PUT: Update a loyalty rule by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const data = await req.json();
  const rule = await LoyaltyRule.findByIdAndUpdate(id, data, { new: true });
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rule);
}

// DELETE: Delete a loyalty rule by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  await requireAdminSession();
  const { id } = await params;
  const rule = await LoyaltyRule.findByIdAndDelete(id);
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
