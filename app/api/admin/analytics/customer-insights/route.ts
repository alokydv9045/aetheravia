import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/OrderModel';
import User from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET /api/admin/analytics/customer-insights
export async function GET(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  // Top customers by total spend
  const topCustomers = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
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
        totalSpent: 1,
        orderCount: 1,
      },
    },
  ]);

  // Repeat customer rate
  const repeatStats = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } },
      },
    },
  ]);

  const repeatRate = repeatStats.length > 0 && repeatStats[0].totalCustomers > 0
    ? (repeatStats[0].repeatCustomers / repeatStats[0].totalCustomers) * 100
    : 0;

  return NextResponse.json({ topCustomers, repeatRate });
}
