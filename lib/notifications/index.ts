import { OrderStatus } from '@/lib/models/OrderModel';
import {
  NotificationConfig,
  OrderNotificationData,
  NotificationResult
} from './types';
import { emailService } from './email';
import { smsService } from './sms';

// Re-export types for convenience
export type {
  NotificationConfig,
  OrderNotificationData,
  NotificationResult
};

class NotificationService {
  async sendOrderStatusUpdate(
    data: OrderNotificationData,
    config: NotificationConfig = { email: true }
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      // Send email notification
      if (config.email && data.customerEmail) {
        try {
          const emailResult = await emailService.sendOrderStatusUpdate(data);
          results.push({
            success: true,
            messageId: emailResult.messageId,
            channel: 'email'
          });
        } catch (error) {
          console.error('Email notification failed:', error);
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Email send failed',
            channel: 'email'
          });
        }
      }

      // Send SMS notification
      if (config.sms && data.customerPhone) {
        try {
          const smsResult = await smsService.sendOrderStatusUpdate(data);
          results.push({
            success: true,
            messageId: smsResult.messageId,
            channel: 'sms'
          });
        } catch (error) {
          console.error('SMS notification failed:', error);
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'SMS send failed',
            channel: 'sms'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Notification service error:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown notification error',
        channel: 'email'
      }];
    }
  }

  async sendOrderConfirmation(data: OrderNotificationData): Promise<NotificationResult[]> {
    return this.sendOrderStatusUpdate(data, { email: true, sms: true });
  }

  async sendShippingNotification(data: OrderNotificationData): Promise<NotificationResult[]> {
    return this.sendOrderStatusUpdate(data, { email: true, sms: true });
  }

  async sendDeliveryNotification(data: OrderNotificationData): Promise<NotificationResult[]> {
    return this.sendOrderStatusUpdate(data, { email: true, sms: false });
  }

  async sendCancellationNotification(data: OrderNotificationData): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      // Send specialized cancellation email
      const emailResult = await emailService.sendCancellationEmail(data);
      results.push({
        success: true,
        messageId: emailResult.messageId,
        channel: 'email'
      });
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        channel: 'email'
      });
    }

    // Also send SMS notification if phone number is available
    if (data.customerPhone) {
      try {
        const smsResult = await smsService.sendOrderStatusUpdate(data);
        results.push({
          success: true,
          messageId: smsResult.messageId,
          channel: 'sms'
        });
      } catch (error) {
        console.error('Failed to send cancellation SMS:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          channel: 'sms'
        });
      }
    }

    return results;
  }

  getStatusMessage(status: OrderStatus): string {
    const messages: Record<string, string> = {
      pending: 'Your order has been received and is being processed.',
      confirmed: 'Your order has been confirmed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way.',
      out_for_delivery: 'Your order is out for delivery.',
      delivered: 'Your order has been successfully delivered.',
      cancelled: 'Your order has been cancelled.',
      returned: 'Your order has been returned.'
    };

    return messages[status] || 'Your order status has been updated.';
  }

  getStatusSubject(status: OrderStatus, orderNumber: string): string {
    const subjects: Record<string, string> = {
      pending: `Order Confirmation - #${orderNumber}`,
      confirmed: `Order Confirmed - #${orderNumber}`,
      processing: `Order Processing - #${orderNumber}`,
      shipped: `Order Shipped - #${orderNumber}`,
      out_for_delivery: `Order Out for Delivery - #${orderNumber}`,
      delivered: `Order Delivered - #${orderNumber}`,
      cancelled: `Order Cancelled - #${orderNumber}`,
      returned: `Order Returned - #${orderNumber}`
    };

    return subjects[status] || `Order Update - #${orderNumber}`;
  }
}

export const notificationService = new NotificationService();