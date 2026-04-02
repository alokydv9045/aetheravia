import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LoyaltyRule from '@/lib/models/LoyaltyRuleModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: List all loyalty rules
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const rules = await LoyaltyRule.find({}).sort({ createdAt: -1 });
  return NextResponse.json(rules);
}

// POST: Create a new loyalty rule
export async function POST(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const data = await req.json();
  const rule = await LoyaltyRule.create(data);
  return NextResponse.json(rule, { status: 201 });
}
