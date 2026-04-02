import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';

export const PUT = auth(async (...args: any) => {
  const [req, { params }] = args;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const order = await OrderModel.findById(params.id);
    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.isPaid) {
      return Response.json(
        { message: 'Order is already paid' },
        { status: 400 }
      );
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: `admin_${Date.now()}`,
      status: 'COMPLETED',
      updateTime: new Date().toISOString(),
      emailAddress: order.user?.email || 'admin@system.com',
    };

    // Add timeline event
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: 'paid',
      timestamp: new Date(),
      description: 'Payment confirmed by admin',
      location: 'Admin Panel',
      metadata: {
        adminId: req.auth.user.id,
        method: 'manual'
      }
    });

    const updatedOrder = await order.save();
    return Response.json(updatedOrder);

  } catch (error) {
    console.error('Error marking order as paid:', error);
    return Response.json(
      { message: 'Failed to mark order as paid' },
      { status: 500 }
    );
  }
});