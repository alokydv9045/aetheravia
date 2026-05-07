import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'This endpoint is disabled in production' }, { status: 403 });
  }

  try {
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const orders = await OrderModel.find({
      userId: session.user._id
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    const debugInfo = orders.map(order => ({
      _id: order._id,
      createdAt: order.createdAt,
      hasItems: !!order.items,
      itemsLength: order.items?.length,
      allFields: Object.keys(order)
    }));

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      debugInfo
    });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching debug info' },
      { status: 500 }
    );
  }
}