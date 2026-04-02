import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/OrderModel';
import Product from '@/lib/models/ProductModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET /api/admin/analytics/revenue-by-category
export async function GET(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  // Aggregate revenue by product category
  const revenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.category',
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
        totalSold: { $sum: '$orderItems.qty' },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return NextResponse.json(revenue);
}
