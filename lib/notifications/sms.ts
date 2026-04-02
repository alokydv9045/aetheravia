import { OrderNotificationData } from './types';
import { formatPrice } from '@/lib/utils';
import { brandName } from '@/lib/brand';

interface SMSResult {
  messageId: string;
  status: string;
}

class SMSService {
  private twilioClient: any;

  constructor() {
    // Initialize Twilio client if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
      } catch (error) {
        console.warn('Twilio not available:', error);
        this.twilioClient = null;
      }
    } else {
      console.warn('Twilio credentials not configured');
      this.twilioClient = null;
    }
  }

  async sendOrderStatusUpdate(data: OrderNotificationData): Promise<SMSResult> {
    if (!this.twilioClient) {
      throw new Error('SMS service not configured');
    }

    if (!data.customerPhone) {
      throw new Error('Customer phone number not provided');
    }

    const message = this.generateSMSContent(data);

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log('SMS sent successfully:', result.sid);
      return {
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error('SMS send failed:', error);
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
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming US/Canada)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phone;
    }
    
    // Default to adding +1 for US/Canada
    return `+1${cleaned}`;
  }

  async sendBulkSMS(messages: Array<{
    to: string;
    body: string;
  }>): Promise<SMSResult[]> {
    if (!this.twilioClient) {
      throw new Error('SMS service not configured');
    }

    const results: SMSResult[] = [];
    
    for (const message of messages) {
      try {
        const result = await this.twilioClient.messages.create({
          body: message.body,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: this.formatPhoneNumber(message.to),
        });
        
        results.push({
          messageId: result.sid,
          status: result.status,
        });
      } catch (error) {
        console.error('Bulk SMS send failed for', message.to, error);
        results.push({
          messageId: '',
          status: 'failed',
        });
      }
    }
    
    return results;
  }

  isConfigured(): boolean {
    return this.twilioClient !== null;
  }
}

export const smsService = new SMSService();