import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the latest order for debugging
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
      itemsType: typeof order.items,
      itemsLength: order.items?.length,
      hasOrderItems: !!order.orderItems,
      orderItemsType: typeof order.orderItems,
      orderItemsLength: order.orderItems?.length,
      firstItem: order.items?.[0] || null,
      firstOrderItem: order.orderItems?.[0] || null,
      allFields: Object.keys(order)
    }));

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      debugInfo
    });

  } catch (error) {
    console.error('Debug orders error:', error);
    return NextResponse.json(
      { message: 'Error fetching debug info' },
      { status: 500 }
    );
  }
}