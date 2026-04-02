// API endpoint to update order status and trigger 3PL integration
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS } from '@/lib/models/OrderModel';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';
import { orderNotificationHook } from '@/lib/hooks/orderNotifications';

// PUT /api/orders/[id]/status - Update order status
export const PUT = auth(async (...args: any[]) => {
  const [req, { params }] = args;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const { id } = params;
    const { status, notes } = await req.json();

    // Validate status
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current order
    const order = await OrderModel.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;

    // Update order status
    order.status = status;
    if (notes) {
      order.notes = notes;
    }

    // Add timeline event
    await order.addTimelineEvent(
      status,
      notes || `Order status updated to ${status.replace('_', ' ')}`,
      {
        updatedBy: req.auth.user.id,
        location: order.shippingAddress?.city || '',
      }
    );

    await order.save();

    // Trigger automatic notification if status changed
    if (oldStatus !== status) {
      try {
        await orderNotificationHook.onOrderStatusChange({
          orderId: id,
          previousStatus: oldStatus,
          newStatus: status,
          updatedBy: req.auth.user.id,
        });
      } catch (notificationError) {
        console.error('Notification hook error:', notificationError);
        // Continue with order update - don't fail the request if notification fails
      }
    }

    // Handle 3PL integration for SHIPPED status
    let shipmentResult = null;
    if (status === ORDER_STATUS.SHIPPED && oldStatus !== ORDER_STATUS.SHIPPED) {
      try {
        shipmentResult = await OrderShipmentService.handleOrderStatusChange(id, status, oldStatus);
        
        if (!shipmentResult.success) {
          console.error('Failed to create shipment:', shipmentResult.error);
          // Continue with order update but log the error
        }
      } catch (error) {
        console.error('Error creating shipment:', error);
        // Continue with order update
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrierName: order.carrierName,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        timeline: order.timeline,
      },
      shipment: shipmentResult,
    });

  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}) as any;