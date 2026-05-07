import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin session
    const session = await requireAdminSession();
    if (!session || !(session as any).user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await OrderModel.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update fields
    const oldStatus = order.status;
    order.status = status;
    order.orderStatus = status; // Sync compatibility field
    
    // If status is delivered, update relevant flags
    if (status === 'delivered') {
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      order.isDelivered = true;
      
      // Auto-pay if not already paid (COD flow)
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          ...order.paymentResult,
          status: 'completed',
          update_time: new Date().toISOString()
        };
      }
    }

    // Save the order (this triggers pre('save') middleware for timeline)
    const updatedOrder = await order.save();

    // Trigger loyalty points awarding if delivered
    if (status === 'delivered' && oldStatus !== 'delivered') {
      try {
        const { awardPointsForOrder } = await import('@/lib/services/loyaltyService');
        await awardPointsForOrder(order._id.toString(), order.user.toString());
      } catch (loyaltyError) {
        console.error('[LOYALTY_AWARD_ERROR]:', loyaltyError);
        // We don't fail the response if loyalty awarding fails, but it's logged
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}