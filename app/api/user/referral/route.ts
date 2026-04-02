import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// GET /api/user/referral
// Returns user's referral code, referral link, credits, and history
export async function GET() {
  await dbConnect();
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await User.findById(session.user.id).select('referralCode referralCredits referralHistory email');
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // Generate referral code if missing
  if (!user.referralCode) {
    user.referralCode = crypto.randomBytes(4).toString('hex');
    await user.save();
  }
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/register?ref=${user.referralCode}`;
  return NextResponse.json({
    referralCode: user.referralCode,
    referralLink,
    referralCredits: user.referralCredits || 0,
    referralHistory: user.referralHistory || [],
    email: user.email,
  });
}
