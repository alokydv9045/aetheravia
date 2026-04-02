import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AbandonedCart from '@/lib/models/AbandonedCartModel';
import User from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET /api/admin/analytics/abandoned-carts
export async function GET(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  // Total abandoned carts
  const totalAbandoned = await AbandonedCart.countDocuments();

  // Abandoned carts in the last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recentAbandoned = await AbandonedCart.countDocuments({ updatedAt: { $gte: since } });

  // Top users with most abandoned carts
  const topUsers = await AbandonedCart.aggregate([
    {
      $group: {
        _id: '$user',
        count: { $sum: 1 },
        lastAbandoned: { $max: '$updatedAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$userInfo.name',
        email: '$userInfo.email',
        count: 1,
        lastAbandoned: 1,
      },
    },
  ]);

  return NextResponse.json({ totalAbandoned, recentAbandoned, topUsers });
}
