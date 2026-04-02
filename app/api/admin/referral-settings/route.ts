import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ReferralSettings from '@/lib/models/ReferralSettingsModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: Get current referral settings (singleton)
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const settings = await ReferralSettings.findOne({});
  return NextResponse.json(settings);
}

// POST: Create or update referral settings (singleton)
export async function POST(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const data = await req.json();
  let settings = await ReferralSettings.findOne({});
  if (settings) {
    Object.assign(settings, data);
    await settings.save();
  } else {
    settings = await ReferralSettings.create(data);
  }
  return NextResponse.json(settings);
}
