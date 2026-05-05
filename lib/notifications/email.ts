import * as nodemailer from 'nodemailer';
import { OrderNotificationData } from './types';
import { formatPrice } from '@/lib/utils';
import { brandName } from '@/lib/brand';
import { generateCancellationEmailTemplate } from './cancellation-template';

interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOrderStatusUpdate(data: OrderNotificationData): Promise<EmailResult> {
    const { subject, html, text } = this.generateEmailContent(data);

    const mailOptions = {
      from: `"${brandName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject,
      html,
      text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      console.error('Email send failed:', error);
      throw error;
    }
  }

  async sendCancellationEmail(data: OrderNotificationData): Promise<EmailResult> {
    try {
      const { subject, html, text } = generateCancellationEmailTemplate(data);

      const mailOptions = {
        from: `"${brandName}" <${process.env.SMTP_FROM}>`,
        to: data.customerEmail,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);

      
      return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }

  async sendLoginOtp(email: string, otp: string): Promise<EmailResult> {
    const subject = `Your Verification Code - ${brandName}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #fcfbf9; color: #1a1a1a; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e1da; }
    .header { padding: 40px 30px; text-align: center; border-bottom: 1px solid #f0eee9; }
    .header h1 { margin: 0; font-size: 24px; font-style: italic; color: #904917; font-weight: 300; }
    .content { padding: 50px 40px; text-align: center; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #7c7c7c; margin-bottom: 20px; font-weight: 700; }
    .otp-code { font-size: 48px; letter-spacing: 0.15em; color: #1a1a1a; margin: 30px 0; font-family: 'Helvetica', sans-serif; font-weight: 200; }
    .message { font-size: 15px; line-height: 1.7; color: #4a4a4a; margin-bottom: 40px; }
    .expiry { font-size: 12px; color: #a09e9a; font-style: italic; }
    .footer { padding: 30px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #b0ada8; border-top: 1px solid #f0eee9; background-color: #faf9f7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName}</h1>
    </div>
    <div class="content">
      <div class="otp-label">Verification Code</div>
      <div class="message">Please use the following code to complete your login to the Artisanal Archive.</div>
      <div class="otp-code">${otp}</div>
      <div class="expiry">This code will expire in 10 minutes.</div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${brandName}. Handcrafted Heritage.
    </div>
  </div>
</body>
</html>
    `;

    const text = `
${brandName} Verification Code

Please use the following code to complete your login:
${otp}

This code will expire in 10 minutes.

© ${new Date().getFullYear()} ${brandName}.
    `;

    const mailOptions = {
      from: `"${brandName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      console.error('OTP email send failed:', error);
      throw error;
    }
  }

  async sendRegisterOtp(email: string, otp: string): Promise<EmailResult> {
    const subject = `Complete Your Ritual - Registration Code - ${brandName}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #fcf9f4; color: #1c1c19; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e2dd; border-radius: 4px; overflow: hidden; }
    .header { padding: 40px; text-align: center; background-color: #fcf9f4; border-bottom: 1px solid #e5e2dd; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #904917; font-family: 'Times New Roman', serif; }
    .content { padding: 60px 40px; text-align: center; }
    .welcome-text { font-size: 14px; text-transform: uppercase; letter-spacing: 0.3em; color: #725a39; margin-bottom: 24px; font-weight: 600; }
    .main-title { font-size: 24px; line-height: 1.4; color: #1c1c19; margin-bottom: 32px; font-style: italic; }
    .otp-container { background-color: #f6f3ee; padding: 40px; border-radius: 2px; margin: 40px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #82746c; margin-bottom: 16px; font-weight: 700; }
    .otp-code { font-size: 56px; letter-spacing: 0.2em; color: #904917; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 200; margin: 0; }
    .expiry { font-size: 12px; color: #82746c; font-style: italic; margin-top: 40px; }
    .footer { padding: 40px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4c3b9; background-color: #fcf9f4; border-top: 1px solid #e5e2dd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AetherAvia</h1>
    </div>
    <div class="content">
      <div class="welcome-text">Begin Your Ritual</div>
      <div class="main-title">You are one step away from joining our artisanal collective.</div>
      <div class="otp-container">
        <div class="otp-label">Verification Code</div>
        <div class="otp-code">${otp}</div>
      </div>
      <p style="font-size: 15px; color: #50443d; line-height: 1.8;">Use this code to verify your email and complete the creation of your account.</p>
      <div class="expiry">This code will expire in 15 minutes.</div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} AetherAvia Artisanal Collective. Handcrafted Heritage.
    </div>
  </div>
</body>
</html>
    `;

    const text = `
AetherAvia - Begin Your Ritual

Please use the following code to complete your registration:
${otp}

This code will expire in 15 minutes.

© ${new Date().getFullYear()} AetherAvia Artisanal Collective.
    `;

    const mailOptions = {
      from: `"${brandName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      console.error('Registration OTP email send failed:', error);
      throw error;
    }
  }

  private generateEmailContent(data: OrderNotificationData): {
    subject: string;
    html: string;
    text: string;
  } {
    const subject = this.getSubjectByStatus(data.status, data.orderNumber);
    const statusMessage = this.getStatusMessage(data.status);
    const statusColor = this.getStatusColor(data.status);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #B78C69 0%, #89694f 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
    .status-banner { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; font-size: 18px; font-weight: 500; }
    .content { padding: 30px; }
    .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-info h3 { margin: 0 0 15px 0; color: #333; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .info-label { font-weight: 600; color: #666; }
    .info-value { color: #333; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .items-table th { background-color: #f8f9fa; font-weight: 600; color: #666; }
    .total-row { font-weight: 600; background-color: #f8f9fa; }
    .tracking-info { background-color: #f8f3f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B78C69; }
    .button { display: inline-block; background-color: #B78C69; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; border-top: 1px solid #eee; }
    .footer a { color: #B78C69; text-decoration: none; }
    @media (max-width: 600px) {
      .content { padding: 20px; }
      .info-row { flex-direction: column; }
      .info-label { margin-bottom: 5px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName}</h1>
    </div>
    
    <div class="status-banner">
      ${statusMessage}
    </div>
    
    <div class="content">
      <h2>Hello ${data.customerName},</h2>
      
      <p>Your order status has been updated. Here are the details:</p>
      
      <div class="order-info">
        <h3>Order Information</h3>
        <div class="info-row">
          <span class="info-label">Order Number:</span>
          <span class="info-value">#${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value" style="color: ${statusColor}; font-weight: 600;">${data.status.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Amount:</span>
          <span class="info-value">${formatPrice(data.totalAmount)}</span>
        </div>
        ${data.estimatedDelivery ? `
        <div class="info-row">
          <span class="info-label">Estimated Delivery:</span>
          <span class="info-value">${data.estimatedDelivery.toLocaleDateString()}</span>
        </div>
        ` : ''}
      </div>
      
      ${data.trackingNumber ? `
      <div class="tracking-info">
        <h3 style="margin: 0 0 10px 0; color: #89694f;">📦 Tracking Information</h3>
        <p style="margin: 0;">Tracking Number: <strong>${data.trackingNumber}</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">You can track your order using this number on our website.</p>
      </div>
      ` : ''}
      
      <h3>Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(item.price * item.quantity)}</td>
          </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td>${formatPrice(data.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
      
      ${data.deliveryAddress ? `
      <div class="order-info">
        <h3>Delivery Address</h3>
        <p style="margin: 0; line-height: 1.6;">
          ${data.deliveryAddress.street}<br>
          ${data.deliveryAddress.city}, ${data.deliveryAddress.state} ${data.deliveryAddress.zipCode}
        </p>
      </div>
      ` : ''}
      
      <a href="${process.env.NEXTAUTH_URL}/track/${data.orderId}" class="button">
        Track Your Order
      </a>
      
      <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
      
      <p>Thank you for shopping with ${brandName}!</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXTAUTH_URL}">Visit our website</a> | 
        <a href="${process.env.NEXTAUTH_URL}/profile">Manage account</a> | 
        <a href="${process.env.NEXTAUTH_URL}/support">Contact support</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
${brandName} - ${subject}

Hello ${data.customerName},

${statusMessage}

Order Details:
- Order Number: #${data.orderNumber}
- Status: ${data.status.toUpperCase()}
- Total Amount: ${formatPrice(data.totalAmount)}
${data.estimatedDelivery ? `- Estimated Delivery: ${data.estimatedDelivery.toLocaleDateString()}` : ''}
${data.trackingNumber ? `- Tracking Number: ${data.trackingNumber}` : ''}

Order Items:
${data.items.map(item => `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n')}

Total: ${formatPrice(data.totalAmount)}

${data.deliveryAddress ? `
Delivery Address:
${data.deliveryAddress.street}
${data.deliveryAddress.city}, ${data.deliveryAddress.state} ${data.deliveryAddress.zipCode}
` : ''}

Track your order: ${process.env.NEXTAUTH_URL}/track/${data.orderId}

Thank you for shopping with ${brandName}!

If you have any questions, please contact our support team.
    `;

    return { subject, html, text };
  }

  private getSubjectByStatus(status: string, orderNumber: string): string {
    const subjects: Record<string, string> = {
      pending: `Order Confirmation - #${orderNumber}`,
      confirmed: `Order Confirmed - #${orderNumber}`,
      processing: `Order Processing - #${orderNumber}`,
      shipped: `Order Shipped - #${orderNumber}`,
      out_for_delivery: `Order Out for Delivery - #${orderNumber}`,
      delivered: `Order Delivered - #${orderNumber}`,
      cancelled: `Order Cancelled - #${orderNumber}`,
      returned: `Order Returned - #${orderNumber}`,
    };

    return subjects[status] || `Order Update - #${orderNumber}`;
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      pending: 'Your order has been received and is being processed.',
      confirmed: 'Your order has been confirmed and will be processed shortly.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way.',
      out_for_delivery: 'Your order is out for delivery.',
      delivered: 'Your order has been successfully delivered.',
      cancelled: 'Your order has been cancelled.',
      returned: 'Your order has been returned.',
    };

    return messages[status] || 'Your order status has been updated.';
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      out_for_delivery: '#f97316',
      delivered: '#B78C69',
      cancelled: '#ef4444',
      returned: '#6b7280',
    };

    return colors[status] || '#6b7280';
  }
}

export const emailService = new EmailService();