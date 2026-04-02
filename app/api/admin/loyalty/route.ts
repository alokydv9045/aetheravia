import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emitAdminEvent } from '@/lib/eventBus';

// GET: List all users' loyalty info
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const users = await User.find({}, 'name email loyaltyPoints loyaltyTier').lean();
  return NextResponse.json(users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    loyaltyPoints: (u as any).loyaltyPoints || 0,
    loyaltyTier: (u as any).loyaltyTier || 'Bronze'
  })));
}

// PUT: Update a user's loyalty info
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    await requireAdminSession();
    const body = await req.json();
    const { userId, points, tier } = body || {};
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    if (typeof points !== 'number' || Number.isNaN(points) || points < 0) return NextResponse.json({ error: 'Invalid points' }, { status: 400 });
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const prevPoints = user.loyaltyPoints || 0;
    const delta = points - prevPoints;
    user.loyaltyPoints = points;
    if (tier) user.loyaltyTier = tier;
    if (delta !== 0) {
      user.loyaltyHistory.push({ type: 'adjust', points: delta, description: 'Admin manual set', date: new Date() });
    }
    await user.save();
    emitAdminEvent({ ts: Date.now(), type: 'loyalty.updated', userId: String(user._id), points: user.loyaltyPoints, tier: user.loyaltyTier, delta });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin loyalty PUT error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Error' }, { status: 500 });
  }
}
