import { NextRequest, NextResponse } from 'next/server';

// This route uses auth() and request headers; ensure it is treated as dynamic.
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import Order from '@/lib/models/OrderModel';
import { auth } from '@/lib/auth';
import { getProgress } from '@/lib/loyalty';

// GET /api/user/loyalty
// Returns user's loyalty points and history
export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get user data
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total spent from paid orders
    const totalSpentAggregation = await Order.aggregate([
      { $match: { user: userId, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const totalSpent = totalSpentAggregation[0]?.total || 0;
    
    // Canonical values
    const points = (user as any).loyaltyPoints || 0;
    const tier = (user as any).loyaltyTier || 'Bronze';
    const { nextTierPoints, pointsToNextTier } = getProgress(points);

    const loyaltyHistory = (user as any).loyaltyHistory || [];
    const rewardsHistory = loyaltyHistory.map((h: any) => ({
      _id: h._id?.toString() || '',
      points: h.points,
      type: h.type,
      description: h.description,
      date: h.date
    })).sort((a: any,b: any)=> new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      points,
      tier,
      totalSpent,
      nextTierPoints,
      pointsToNextTier,
      rewardsHistory,
      loyaltyPoints: points,
      loyaltyHistory: rewardsHistory
    });
  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}
