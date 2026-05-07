import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS } from '@/lib/models/OrderModel';
import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { cancellationAnalytics } from '@/lib/analytics/cancellation';

export const POST = auth(async (...request: any) => {
  const [req, { params: paramsPromise }] = request;
  const params = await paramsPromise;
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { reason } = await req.json();
    
    await dbConnect();
    
    // Find the order and populate user for email
    const order = await OrderModel.findById(params.id).populate('user', 'email name');
    
    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the order belongs to the authenticated user
    const userId = req.auth.user?.id || req.auth.user?._id;
    if (order.user._id.toString() !== userId) {
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
        updatedBy: userId,
        metadata: { 
          cancelledBy: 'customer',
          reason: reason || 'Customer request'
        }
      }
    );

    // Process refund if order was paid via Razorpay
    let refundProcessed = false;
    let refundDetails = null;

    if (order.isPaid && order.paymentMethod === 'Razorpay' && order.paymentResult?.id) {
      try {
        const { razorpay } = await import('@/lib/razorpay');
        const refund = await razorpay.createRefund(order.paymentResult.id, order.totalPrice);
        refundProcessed = true;
        refundDetails = refund;
        
        // Update order with refund info
        order.notes = (order.notes || '') + `\n[REFUND] Processed ID: ${refund.id}`;
      } catch (refundError) {
        console.error('[REFUND_ERROR]:', refundError);
        // We log the error but allow cancellation to proceed in DB
        order.notes = (order.notes || '') + `\n[REFUND_FAILED] Please process manually. Error: ${refundError instanceof Error ? refundError.message : 'Unknown'}`;
      }
    }

    await order.save();

    // Send enhanced cancellation notification
    try {
      await notificationService.sendCancellationNotification({
        orderId: order._id.toString(),
        orderNumber: order._id.toString().substring(order._id.toString().length - 8).toUpperCase(),
        customerName: order.shippingAddress.fullName,
        customerEmail: order.user?.email || req.auth.user?.email,
        customerPhone: order.shippingAddress.phone || 'N/A',
        status: ORDER_STATUS.CANCELLED,
        previousStatus: previousStatus,
        totalAmount: order.totalPrice,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        })),
        orderItems: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        })),
        cancellationReason: reason || 'Customer request',
        refundAmount: refundProcessed ? order.totalPrice : 0,
        refundMethod: refundProcessed ? 'Original payment method (Razorpay)' : 'Manual / None',
        cancellationDate: new Date()
      });
    } catch (notificationError) {
      console.error('Failed to send cancellation notification:', notificationError);
    }

    // Track cancellation for analytics
    try {
      await cancellationAnalytics.trackCancellation(order._id.toString(), reason);
    } catch (analyticsError) {
      console.error('Failed to track cancellation analytics:', analyticsError);
    }

    // Update inventory (restore stock)
    try {
      const ProductModel = (await import('@/lib/models/ProductModel')).default;
      const bulkUpdates = order.items.map((item: any) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: item.qty } }
        }
      }));
      
      if (bulkUpdates.length > 0) {
        await ProductModel.bulkWrite(bulkUpdates);
      }
    } catch (inventoryError) {
      console.error('Failed to update inventory:', inventoryError);
    }

    return Response.json({
      success: true,
      message: refundProcessed 
        ? 'Order cancelled and refund processed successfully' 
        : 'Order cancelled successfully',
      refundProcessed,
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