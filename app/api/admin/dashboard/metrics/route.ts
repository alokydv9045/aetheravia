import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order, { ORDER_STATUS } from '@/lib/models/OrderModel';
import ProductModel from '@/lib/models/ProductModel';
import UserModel from '@/lib/models/UserModel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = auth(async (req) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 13); // last 14 days including today
    startDate.setHours(0, 0, 0, 0);

    // Sales by day (last 14 days)
    const salesByDayAgg = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);
    // Build complete series across days even if zero
    const salesByDay: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 0; i < 14; i++) {
      const dt = new Date(startDate);
      dt.setDate(startDate.getDate() + i);
      const key = { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
      const found = salesByDayAgg.find((x: any) => x._id.y === key.y && x._id.m === key.m && x._id.d === key.d);
      salesByDay.push({
        date: dt.toISOString().slice(0, 10),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    // Orders by status
    const statuses = Object.values(ORDER_STATUS);
    const ordersByStatusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const ordersByStatus: Record<string, number> = {};
    for (const s of statuses) ordersByStatus[s] = 0;
    for (const row of ordersByStatusAgg) ordersByStatus[row._id] = row.count;

    // Top products by revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.slug',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          qty: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Low stock products (<= 5)
    const lowStock = await ProductModel.find({ countInStock: { $lte: 5 } }, { name: 1, slug: 1, countInStock: 1 })
      .sort({ countInStock: 1 })
      .limit(8)
      .lean();

    // Recent orders (5)
    const recentOrders = await Order.find({}, { totalPrice: 1, status: 1, createdAt: 1, isPaid: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // New users last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const newUsers = await UserModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    return NextResponse.json({
      salesByDay,
      ordersByStatus,
      topProducts,
      lowStock,
      recentOrders,
      newUsers,
    });
  } catch (err) {
    console.error('[admin/metrics] error:', err);
    return NextResponse.json({ message: 'Failed to load metrics' }, { status: 500 });
  }
});
