import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Order from '@/lib/models/OrderModel';
import { notificationService, OrderNotificationData } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, notifyEmail = true, notifySMS = false } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch the order with populated user data
    const order = await Order.findById(orderId).populate('user');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare notification data
    const notificationData: OrderNotificationData = {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.fullName || order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.shippingAddress?.phone || order.user?.phone || '',
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      deliveryAddress: order.shippingAddress ? {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
      } : undefined,
    };

    // Send notifications
    const results = await notificationService.sendOrderStatusUpdate(
      notificationData,
      { email: notifyEmail, sms: notifySMS }
    );

    // Log notification results
    console.log('Notification results:', results);

    const successfulNotifications = results.filter(r => r.success);
    const failedNotifications = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Sent ${successfulNotifications.length} notification(s)`,
      results: {
        successful: successfulNotifications.length,
        failed: failedNotifications.length,
        details: results,
      },
    });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check notification service configuration
    const emailConfigured = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );

    const smsConfigured = !!process.env.FAST2SMS_API_KEY;

    return NextResponse.json({
      email: {
        configured: emailConfigured,
        provider: 'SMTP',
      },
      sms: {
        configured: smsConfigured,
        provider: 'Fast2SMS',
      },
    });

  } catch (error) {
    console.error('Notification config check error:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}