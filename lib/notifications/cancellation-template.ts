import { OrderNotificationData } from './types';
import { formatPrice } from '@/lib/utils';
import { brandName } from '@/lib/brand';

export function generateCancellationEmailTemplate(data: OrderNotificationData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    orderNumber,
    customerName,
    items,
    orderItems,
    totalAmount,
    cancellationReason,
    refundAmount,
    refundMethod
  } = data;

  // Use orderItems if available, otherwise fall back to items
  const itemsToDisplay = orderItems || items;

  const subject = `Order Cancelled - #${orderNumber} | ${brandName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .order-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .order-items {
          margin: 20px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .item:last-child {
          border-bottom: none;
        }
        .total {
          background: #e3f2fd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .refund-info {
          background: #e8f5e8;
          border-left: 4px solid #4caf50;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .cancellation-reason {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px;
        }
        .support-info {
          background: #f1f3f4;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Cancelled</h1>
          <p>Your order has been successfully cancelled</p>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName},</h2>
          <p>We've successfully cancelled your order as requested. We're sorry to see you go, but we understand that plans can change.</p>
          
          <div class="order-info">
            <h3>📋 Order Details</h3>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p><strong>Cancellation Time:</strong> ${new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
          </div>

          ${cancellationReason ? `
          <div class="cancellation-reason">
            <h3>📝 Cancellation Reason</h3>
            <p>${cancellationReason}</p>
          </div>
          ` : ''}

          <div class="order-items">
            <h3>🛍️ Cancelled Items</h3>
            ${itemsToDisplay?.map((item: any) => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  <small>Quantity: ${item.quantity}</small>
                </div>
                <div>${formatPrice(item.price * item.quantity)}</div>
              </div>
            `).join('') || '<p>Order items information not available</p>'}
          </div>

          <div class="total">
            <h3>💰 Cancelled Order Total</h3>
            <h2 style="color: #667eea; margin: 0;">${formatPrice(totalAmount || 0)}</h2>
          </div>

          ${refundAmount && refundAmount > 0 ? `
          <div class="refund-info">
            <h3>💳 Refund Information</h3>
            <p><strong>Refund Amount:</strong> ${formatPrice(refundAmount)}</p>
            <p><strong>Refund Method:</strong> ${refundMethod || 'Original payment method'}</p>
            <p><strong>Processing Time:</strong> 3-5 business days</p>
            <p><small>You will receive a separate notification once the refund is processed.</small></p>
          </div>
          ` : `
          <div class="refund-info">
            <h3>💳 Refund Processing</h3>
            <p>If you made a payment for this order, your refund will be processed automatically within 3-5 business days to your original payment method.</p>
            <p>You will receive a separate notification once the refund is initiated.</p>
          </div>
          `}

          <div class="support-info">
            <h3>🤝 Need Help?</h3>
            <p>If you have any questions about your cancellation or need assistance with a new order, our customer support team is here to help:</p>
            <ul>
              <li>📧 Email: support@${brandName.toLowerCase()}.com</li>
              <li>📞 Phone: +1 (555) 123-4567</li>
              <li>💬 Live Chat: Available on our website</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://your-domain.com'}" class="btn">Continue Shopping</a>
            <a href="${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/order-history" class="btn" style="background: #6c757d;">View Order History</a>
          </div>

          <p>We hope to serve you again soon! Thank you for choosing ${brandName}.</p>
        </div>
        
        <div class="footer">
          <p><strong>${brandName}</strong></p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Order Cancelled - #${orderNumber}

    Hello ${customerName},

    We've successfully cancelled your order as requested.

    Order Details:
    Order Number: #${orderNumber}
    Cancellation Date: ${new Date().toLocaleDateString()}
    
    ${cancellationReason ? `Cancellation Reason: ${cancellationReason}` : ''}

    Cancelled Items:
    ${itemsToDisplay?.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - ${formatPrice(item.price * item.quantity)}`).join('\n') || 'Order items information not available'}

    Total Amount: ${formatPrice(totalAmount || 0)}

    ${refundAmount && refundAmount > 0 ? `
    Refund Information:
    - Refund Amount: ${formatPrice(refundAmount)}
    - Refund Method: ${refundMethod || 'Original payment method'}
    - Processing Time: 3-5 business days
    ` : `
    Refund Processing:
    If you made a payment for this order, your refund will be processed automatically within 3-5 business days.
    `}

    Need Help?
    Email: support@${brandName.toLowerCase()}.com
    Phone: +1 (555) 123-4567

    Thank you for choosing ${brandName}.

    This is an automated email. Please do not reply directly to this message.
  `;

  return { subject, html, text };
}