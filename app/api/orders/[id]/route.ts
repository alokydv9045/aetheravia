import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS } from '@/lib/models/OrderModel';

export const GET = auth(async (...request: any) => {
  const [req, { params }] = request;
  if (!req.auth) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }

  try {
    await dbConnect();
    
    const order = await OrderModel.findById(params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name slug image');

    if (!order) {
      return Response.json({ message: 'Order not found' }, { status: 404 });
    }

    // Calculate additional data
    const progressPercentage = order.getProgressPercentage();
    const nextStatus = order.getNextStatus();
    const estimatedDelivery = order.estimatedDeliveryDate || 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from now

    // Enhanced order response with timeline and progress
    const enhancedOrder = {
      ...order.toObject(),
      progress: {
        percentage: progressPercentage,
        nextStatus,
        currentPhase: order.status,
        totalPhases: Object.keys(ORDER_STATUS).length - 2, // Exclude cancelled and returned
      },
      timeline: order.timeline.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      estimatedDelivery,
      tracking: {
        number: order.trackingNumber,
        carrier: order.carrierName,
        url: order.trackingNumber ? 
          `https://track.example.com/${order.trackingNumber}` : null,
      },
      statusInfo: getStatusInfo(order.status),
      lastUpdated: order.timeline.length > 0 ? 
        order.timeline[order.timeline.length - 1].timestamp : order.updatedAt,
    };

    return Response.json(enhancedOrder);
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return Response.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
});

// PATCH method to update order status (for admin)
export const PATCH = auth(async (...request: any) => {
  const [req, { params }] = request;
  if (!req.auth) {
    return Response.json(
      { message: 'unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { status, description, trackingNumber, carrierName, notes } = await req.json();
    
    await dbConnect();
    
    const order = await OrderModel.findById(params.id);
    if (!order) {
      return Response.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update order fields
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      order.status = status;
    }
    
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    
    if (carrierName !== undefined) {
      order.carrierName = carrierName;
    }
    
    if (notes !== undefined) {
      order.notes = notes;
    }

    // Add custom timeline event if description provided
    if (description && status) {
      await order.addTimelineEvent(status, description, {
        updatedBy: req.auth.user?.id,
        metadata: { trackingNumber, carrierName }
      });
    }

    await order.save();

    // Trigger real-time update (you can implement WebSocket/SSE here)
    // await notifyOrderUpdate(order._id, order.toObject());

    return Response.json({
      message: 'Order updated successfully',
      order: order.toObject(),
    });
  } catch (error: any) {
    console.error('Order update error:', error);
    return Response.json(
      { message: 'Failed to update order' },
      { status: 500 }
    );
  }
});

// Helper function to get status information
function getStatusInfo(status: string) {
  const statusMap: Record<string, any> = {
    [ORDER_STATUS.PENDING]: {
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      color: 'warning',
      icon: '📋',
    },
    [ORDER_STATUS.CONFIRMED]: {
      label: 'Order Confirmed',
      description: 'Your order has been confirmed and payment verified',
      color: 'info',
      icon: '✅',
    },
    [ORDER_STATUS.PROCESSING]: {
      label: 'Processing',
      description: 'Your order is being prepared for shipment',
      color: 'primary',
      icon: '📦',
    },
    [ORDER_STATUS.SHIPPED]: {
      label: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      color: 'primary',
      icon: '🚚',
    },
    [ORDER_STATUS.OUT_FOR_DELIVERY]: {
      label: 'Out for Delivery',
      description: 'Your order is out for delivery and will arrive soon',
      color: 'warning',
      icon: '🚛',
    },
    [ORDER_STATUS.DELIVERED]: {
      label: 'Delivered',
      description: 'Your order has been delivered successfully',
      color: 'success',
      icon: '🎉',
    },
    [ORDER_STATUS.CANCELLED]: {
      label: 'Cancelled',
      description: 'Your order has been cancelled',
      color: 'error',
      icon: '❌',
    },
    [ORDER_STATUS.RETURNED]: {
      label: 'Returned',
      description: 'Your order has been returned',
      color: 'error',
      icon: '↩️',
    },
  };

  return statusMap[status] || {
    label: status,
    description: 'Order status',
    color: 'neutral',
    icon: '📋',
  };
}
