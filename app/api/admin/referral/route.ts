import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';
import crypto from 'crypto';
import { emitAdminEvent } from '@/lib/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: List referral related info for users (paginated later if needed)
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const users = await User.find({}, 'name email referralCode referredBy referralCredits referralHistory createdAt').lean();
  return NextResponse.json(users);
}

/*
PUT body contract:
{
  userId: string;
  action: 'generateCode' | 'adjustCredits' | 'setReferredBy' | 'addHistoryEntry';
  amount?: number;                 // for adjustCredits (can be negative)
  referredByCodeOrEmail?: string;  // for setReferredBy (we attempt to resolve to a referrer's code)
  history?: { referredUserId: string; referredUserEmail?: string; reward: number; orderId?: string } // addHistoryEntry
}
*/
export async function PUT(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  try {
    const body = await req.json();
    const { userId, action } = body || {};
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let changed = false;
    if (action === 'generateCode') {
      if (!user.referralCode) {
        user.referralCode = crypto.randomBytes(4).toString('hex');
        changed = true;
      }
    } else if (action === 'adjustCredits') {
      const amt = Number(body.amount);
      if (!Number.isFinite(amt) || amt === 0) {
        return NextResponse.json({ error: 'Valid non-zero amount required' }, { status: 400 });
      }
      user.referralCredits = (user.referralCredits || 0) + amt;
      changed = true;
      user.referralHistory = user.referralHistory || [];
      user.referralHistory.push({
        referredUserId: 'manual-adjust',
        referredUserEmail: 'manual',
        reward: amt,
        date: new Date(),
      });
    } else if (action === 'setReferredBy') {
      const lookup = body.referredByCodeOrEmail?.trim();
      if (!lookup) return NextResponse.json({ error: 'referredByCodeOrEmail required' }, { status: 400 });
      const referrer = await User.findOne({ $or: [{ referralCode: lookup }, { email: lookup }] }).select('referralCode _id');
      if (!referrer) return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
      if (user._id.equals(referrer._id)) return NextResponse.json({ error: 'Cannot self-refer' }, { status: 400 });
      user.referredBy = referrer.referralCode;
      changed = true;
    } else if (action === 'addHistoryEntry') {
      const h = body.history;
      if (!h || !h.referredUserId || !Number.isFinite(h.reward)) {
        return NextResponse.json({ error: 'history entry invalid' }, { status: 400 });
      }
      user.referralHistory = user.referralHistory || [];
      user.referralHistory.push({
        referredUserId: h.referredUserId,
        referredUserEmail: h.referredUserEmail,
        reward: h.reward,
        orderId: h.orderId,
        date: new Date(),
      });
      user.referralCredits = (user.referralCredits || 0) + h.reward;
      changed = true;
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    if (changed) {
      await user.save();
      emitAdminEvent({ type: 'referral.updated', userId: String(user._id), action });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin referral PUT error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
