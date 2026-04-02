// Webhook Routes for 3PL Status Updates
import { NextRequest, NextResponse } from 'next/server';
import { Shipment } from '@/lib/models/Shipment';
import crypto from 'crypto';

// POST /api/3pl/webhook/delivery-com - Webhook for Delivery.com updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.DELIVERY_COM_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookData = JSON.parse(body);
    const { tracking_id, status, location, estimated_delivery, courier_name } = webhookData;

    if (!tracking_id || !status) {
      return NextResponse.json({ error: 'Missing tracking_id or status' }, { status: 400 });
    }

    // Find and update shipment
    const shipment = await Shipment.findOne({ trackingId: tracking_id });
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Map Delivery.com status to our status
    const statusMapping: { [key: string]: string } = {
      'PICKUP_ARRANGED': 'CREATED',
      'PICKED_UP': 'PICKED_UP',
      'IN_TRANSIT': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'DELIVERY_FAILED': 'FAILED_DELIVERY',
      'RETURNED': 'RETURNED',
      'CANCELLED': 'CANCELLED',
    };

    const mappedStatus = statusMapping[status] || status;

    // Update shipment
    await shipment.addTrackingUpdate(
      mappedStatus,
      location,
      `Webhook update from Delivery.com`,
      'WEBHOOK'
    );

    // Store webhook data
    shipment.webhookData.push({
      timestamp: new Date(),
      provider: 'DELIVERY_COM',
      data: webhookData,
    });

    // Update other fields if provided
    if (estimated_delivery) {
      shipment.estimatedDelivery = new Date(estimated_delivery);
    }

    if (courier_name && courier_name !== shipment.courierName) {
      shipment.courierName = courier_name;
    }

    // Set actual delivery date if delivered
    if (mappedStatus === 'DELIVERED' && !shipment.actualDelivery) {
      shipment.actualDelivery = new Date();
    }

    await shipment.save();

    // TODO: Send notification to customer (email/SMS)
    // TODO: Update order status in main orders collection

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Delivery.com webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/3pl/webhook/delivery-com - Webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ message: 'Delivery.com webhook endpoint' });
}