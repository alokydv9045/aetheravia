import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { auth } from '@/lib/auth';
import { emitAdminEvent } from '@/lib/eventBus';
import { evaluateTierChange } from '@/lib/loyalty';

// POST /api/user/loyalty/redeem
// Body: { points: number, description?: string, orderId?: string }
export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { points, description, orderId, source = 'redeem', txnId } = await req.json();
  if (!points || points <= 0) {
    return NextResponse.json({ error: 'Invalid points' }, { status: 400 });
  }
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if ((user.loyaltyPoints || 0) < points) return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });

  if (txnId && user.loyaltyHistory?.some((h: any) => h.txnId === txnId)) {
    return NextResponse.json({ loyaltyPoints: user.loyaltyPoints, loyaltyHistory: user.loyaltyHistory });
  }

  const before = user.loyaltyPoints || 0;
  user.loyaltyPoints = before - points;
  user.loyaltyHistory.push({ type: 'redeem', points, description, orderId, date: new Date(), source, txnId });

  const oldTier = user.loyaltyTier || 'Bronze';
  const { newTier, changed } = evaluateTierChange(oldTier, user.loyaltyPoints);
  user.loyaltyTier = newTier;
  await user.save();

  emitAdminEvent({ ts: Date.now(), type: 'loyalty.redeemed', userId: String(user._id), delta: -points, balance: user.loyaltyPoints, orderId });
  if (changed) emitAdminEvent({ ts: Date.now(), type: 'loyalty.tierChanged', userId: String(user._id), from: oldTier, to: newTier, balance: user.loyaltyPoints });

  return NextResponse.json({ loyaltyPoints: user.loyaltyPoints, loyaltyHistory: user.loyaltyHistory });
}
