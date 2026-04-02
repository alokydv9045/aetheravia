import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET /api/admin/analytics/sales?period=daily|weekly|monthly|yearly
export async function GET(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'daily';

  let groupFormat: any = {};
  switch (period) {
    case 'yearly':
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    case 'monthly':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    case 'weekly':
      groupFormat = { $dateToString: { format: '%G-%V', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const sales = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: {
      _id: groupFormat,
      totalSales: { $sum: '$totalPrice' },
      totalOrders: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json(sales);
}
