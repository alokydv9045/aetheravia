import { OrderStatus } from '@/lib/models/OrderModel';

export interface NotificationConfig {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}

export interface OrderNotificationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Cancellation specific fields
  cancellationReason?: string;
  refundAmount?: number;
  refundMethod?: string;
  cancellationDate?: Date;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  channel: 'email' | 'sms' | 'whatsapp';
}