import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS } from '@/lib/models/OrderModel';
import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { cancellationAnalytics } from '@/lib/analytics/cancellation';

export const POST = auth(async (...request: any) => {
  const [req, { params }] = request;
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { reason } = await req.json();
    
    await dbConnect();
    
    // Find the order
    const order = await OrderModel.findById(params.id);
    
    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the order belongs to the authenticated user
    if (order.user.toString() !== req.auth.user?.id) {
      return Response.json(
        { message: 'Unauthorized to cancel this order' },
        { status: 403 }
      );
    }

    // Check if the order can be cancelled
    const cancellableStatuses = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return Response.json(
        { 
          message: 'Order cannot be cancelled at this stage',
          currentStatus: order.status 
        },
        { status: 400 }
      );
    }

    // Store previous status for notification
    const previousStatus = order.status;

    // Update order status to cancelled
    order.status = ORDER_STATUS.CANCELLED;
    
    // Add timeline event
    await order.addTimelineEvent(
      ORDER_STATUS.CANCELLED, 
      reason || 'Order cancelled by customer',
      {
        updatedBy: req.auth.user?.id,
        metadata: { 
          cancelledBy: 'customer',
          reason: reason || 'Customer request'
        }
      }
    );

    await order.save();

    // Send enhanced cancellation notification
    try {
      await notificationService.sendCancellationNotification({
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        status: ORDER_STATUS.CANCELLED,
        previousStatus: previousStatus,
        totalAmount: order.totalAmount,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        orderItems: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        cancellationReason: reason,
        refundAmount: order.totalAmount, // Assuming full refund
        refundMethod: 'Original payment method',
        cancellationDate: new Date()
      });
    } catch (notificationError) {
      console.error('Failed to send cancellation notification:', notificationError);
      // Don't fail the cancellation if notification fails
    }

    // Track cancellation for analytics
    try {
      await cancellationAnalytics.trackCancellation(order._id.toString(), reason);
    } catch (analyticsError) {
      console.error('Failed to track cancellation analytics:', analyticsError);
      // Don't fail the cancellation if analytics tracking fails
    }

    // TODO: Implement refund processing if payment was made
    // TODO: Update inventory (restore stock)

    return Response.json({
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Order cancellation error:', error);
    return Response.json(
      { message: 'Failed to cancel order' },
      { status: 500 }
    );
  }
});