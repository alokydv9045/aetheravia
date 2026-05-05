import { OrderNotificationData } from './types';
import { formatPrice } from '@/lib/utils';
import { brandName } from '@/lib/brand';
import axios from 'axios';

interface SMSResult {
  messageId: string;
  status: string;
}

class SMSService {
  private fast2smsApiKey: string | null;

  constructor() {
    // Initialize Fast2SMS API Key if available
    this.fast2smsApiKey = process.env.FAST2SMS_API_KEY || null;
  }

  async sendOrderStatusUpdate(data: OrderNotificationData): Promise<SMSResult> {
    if (!this.fast2smsApiKey) {
      throw new Error('Fast2SMS service not configured');
    }

    if (!data.customerPhone) {
      throw new Error('Customer phone number not provided');
    }

    const message = this.generateSMSContent(data);

    try {
      const formattedPhone = this.formatPhoneNumber(data.customerPhone);
      const result = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
          authorization: this.fast2smsApiKey,
          route: 'q',
          message: message,
          numbers: formattedPhone,
        }
      });



      if (result.data && (result.data.return === true || result.data.status_code === 200)) {
        return {
          messageId: result.data.request_id || 'fast2sms-ok',
          status: 'success',
        };
      } else {
        throw new Error(result.data?.message || 'Failed to send SMS through Fast2SMS');
      }
    } catch (error) {
      console.error('Fast2SMS send failed:', error);
      throw error;
    }
  }

  private generateSMSContent(data: OrderNotificationData): string {
    const statusMessage = this.getStatusMessage(data.status);
    
    let message = `${brandName}: ${statusMessage}\n\n`;
    message += `Order #${data.orderNumber}\n`;
    message += `Total: ${formatPrice(data.totalAmount)}\n`;
    
    if (data.trackingNumber) {
      message += `Tracking: ${data.trackingNumber}\n`;
    }
    
    if (data.estimatedDelivery) {
      message += `Est. Delivery: ${data.estimatedDelivery.toLocaleDateString()}\n`;
    }
    
    message += `\nTrack: ${process.env.NEXTAUTH_URL}/track/${data.orderId}`;
    
    // SMS has character limits, so keep it concise
    if (message.length > 160) {
      message = `${brandName}: ${statusMessage}\n`;
      message += `Order #${data.orderNumber} - ${formatPrice(data.totalAmount)}\n`;
      if (data.trackingNumber) {
        message += `Track: ${data.trackingNumber}\n`;
      }
      message += `Details: ${process.env.NEXTAUTH_URL}/track/${data.orderId}`;
    }
    
    return message;
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      pending: 'Order received!',
      confirmed: 'Order confirmed!',
      processing: 'Order is being prepared',
      shipped: 'Order shipped!',
      out_for_delivery: 'Order out for delivery',
      delivered: 'Order delivered!',
      cancelled: 'Order cancelled',
      returned: 'Order returned',
    };

    return messages[status] || 'Order updated';
  }

  private formatPhoneNumber(phone: string): string {
    // Extract last 10 digits to match Fast2SMS valid mobile numbers format
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.slice(-10);
    }
    return cleaned;
  }

  async sendBulkSMS(messages: Array<{
    to: string;
    body: string;
  }>): Promise<SMSResult[]> {
    if (!this.fast2smsApiKey) {
      throw new Error('Fast2SMS service not configured');
    }

    const results: SMSResult[] = [];
    
    for (const message of messages) {
      try {
        const formattedPhone = this.formatPhoneNumber(message.to);
        const result = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: this.fast2smsApiKey,
            route: 'q',
            message: message.body,
            numbers: formattedPhone,
          }
        });
        
        if (result.data && (result.data.return === true || result.data.status_code === 200)) {
          results.push({
            messageId: result.data.request_id || 'fast2sms-ok',
            status: 'success',
          });
        } else {
          results.push({
            messageId: '',
            status: 'failed',
          });
        }
      } catch (error) {
        console.error('Bulk Fast2SMS send failed for', message.to, error);
        results.push({
          messageId: '',
          status: 'failed',
        });
      }
    }
    
    return results;
  }

  isConfigured(): boolean {
    return this.fast2smsApiKey !== null;
  }
}

export const smsService = new SMSService();