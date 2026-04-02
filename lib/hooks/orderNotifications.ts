import Order from '@/lib/models/OrderModel';
import { OrderStatus } from '@/lib/models/OrderModel';
import { notificationService, OrderNotificationData } from '@/lib/notifications';

interface OrderUpdateHookData {
  orderId: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  updatedBy?: string;
}

class OrderNotificationHook {
  async onOrderStatusChange(data: OrderUpdateHookData): Promise<void> {
    try {
      console.log('Order status change hook triggered:', data);

      // Fetch the complete order data
      const order = await Order.findById(data.orderId).populate('user');
      
      if (!order) {
        console.warn('Order not found for notification:', data.orderId);
        return;
      }

      // Only send notifications for certain status changes
      const notifiableStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
      
      if (!notifiableStatuses.includes(data.newStatus)) {
        console.log('Status not notifiable:', data.newStatus);
        return;
      }

      // Skip if no customer contact info
      if (!order.user?.email && !order.shippingAddress?.phone) {
        console.warn('No customer contact info for notification:', data.orderId);
        return;
      }

      // Prepare notification data
      const notificationData: OrderNotificationData = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress?.fullName || order.user?.name || 'Customer',
        customerEmail: order.user?.email || '',
        customerPhone: order.shippingAddress?.phone || order.user?.phone || '',
        status: order.status,
        previousStatus: data.previousStatus,
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

      // Determine notification methods based on status
      const config = this.getNotificationConfig(data.newStatus);

      // Send notifications
      const results = await notificationService.sendOrderStatusUpdate(notificationData, config);

      // Log results
      console.log('Automatic notification results:', {
        orderId: data.orderId,
        status: data.newStatus,
        results,
      });

      // Store notification log in order
      const notificationLog = {
        timestamp: new Date(),
        status: data.newStatus,
        channels: results.map(r => ({
          channel: r.channel,
          success: r.success,
          messageId: r.messageId,
          error: r.error,
        })),
        triggeredBy: 'system',
        updatedBy: data.updatedBy,
      };

      await Order.findByIdAndUpdate(data.orderId, {
        $push: { notificationHistory: notificationLog },
      });

    } catch (error) {
      console.error('Order notification hook error:', error);
      // Don't throw - we don't want to break the order update if notification fails
    }
  }

  private getNotificationConfig(status: string): { email?: boolean; sms?: boolean } {
    // Configure which statuses get which types of notifications
    const configs: Record<string, { email?: boolean; sms?: boolean }> = {
      confirmed: { email: true, sms: true },
      processing: { email: true, sms: false },
      shipped: { email: true, sms: true },
      out_for_delivery: { email: true, sms: true },
      delivered: { email: true, sms: false },
      cancelled: { email: true, sms: true },
    };

    return configs[status] || { email: true };
  }

  async onOrderCreated(orderId: string): Promise<void> {
    await this.onOrderStatusChange({
      orderId,
      newStatus: 'pending',
      updatedBy: 'system',
    });
  }

  async onPaymentConfirmed(orderId: string): Promise<void> {
    await this.onOrderStatusChange({
      orderId,
      previousStatus: 'pending',
      newStatus: 'confirmed',
      updatedBy: 'system',
    });
  }
}

export const orderNotificationHook = new OrderNotificationHook();