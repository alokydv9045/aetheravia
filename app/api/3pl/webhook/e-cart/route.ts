// Webhook Route for E-Cart Updates
import { NextRequest, NextResponse } from 'next/server';
import { Shipment } from '@/lib/models/Shipment';
import crypto from 'crypto';

// POST /api/3pl/webhook/e-cart - Webhook for E-Cart updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-ecart-signature');
    const webhookSecret = process.env.ECART_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64');
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookData = JSON.parse(body);
    const { 
      tracking_number, 
      status, 
      current_location, 
      expected_delivery_date, 
      courier_partner,
      scan_details 
    } = webhookData;

    if (!tracking_number || !status) {
      return NextResponse.json({ error: 'Missing tracking_number or status' }, { status: 400 });
    }

    // Find and update shipment
    const shipment = await Shipment.findOne({ trackingId: tracking_number });
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Map E-Cart status to our status
    const statusMapping: { [key: string]: string } = {
      'MANIFEST': 'CREATED',
      'PICKUP_SCHEDULED': 'CREATED',
      'PICKED_UP': 'PICKED_UP',
      'IN_TRANSIT': 'IN_TRANSIT',
      'REACHED_DESTINATION': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'DELIVERY_ATTEMPTED': 'FAILED_DELIVERY',
      'UNDELIVERED': 'FAILED_DELIVERY',
      'RETURNED_TO_ORIGIN': 'RETURNED',
      'CANCELLED': 'CANCELLED',
      'LOST': 'LOST',
      'DAMAGED': 'DAMAGED',
    };

    const mappedStatus = statusMapping[status] || status;

    // Update shipment with latest scan details
    if (scan_details && Array.isArray(scan_details)) {
      for (const scan of scan_details) {
        await shipment.addTrackingUpdate(
          statusMapping[scan.status] || scan.status,
          scan.location,
          scan.remarks || `E-Cart update: ${scan.status}`,
          'WEBHOOK'
        );
      }
    } else {
      await shipment.addTrackingUpdate(
        mappedStatus,
        current_location,
        `Webhook update from E-Cart`,
        'WEBHOOK'
      );
    }

    // Store webhook data
    shipment.webhookData.push({
      timestamp: new Date(),
      provider: 'E_CART',
      data: webhookData,
    });

    // Update other fields if provided
    if (expected_delivery_date) {
      shipment.estimatedDelivery = new Date(expected_delivery_date);
    }

    if (courier_partner && courier_partner !== shipment.courierName) {
      shipment.courierName = courier_partner;
    }

    // Set actual delivery date if delivered
    if (mappedStatus === 'DELIVERED' && !shipment.actualDelivery) {
      shipment.actualDelivery = new Date();
    }

    // Handle delivery attempts
    if (mappedStatus === 'FAILED_DELIVERY') {
      await shipment.addDeliveryAttempt(
        'FAILED',
        webhookData.failure_reason || 'Delivery attempt failed',
        webhookData.next_attempt_date ? new Date(webhookData.next_attempt_date) : undefined
      );
    }

    await shipment.save();

    // TODO: Send notification to customer based on status
    // TODO: Update order status in main orders collection
    // TODO: Handle COD remittance updates

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed',
      updated_status: mappedStatus 
    });
  } catch (error: any) {
    console.error('E-Cart webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/3pl/webhook/e-cart - Webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // E-Cart webhook verification
  if (token === process.env.ECART_WEBHOOK_TOKEN) {
    return new NextResponse('verified', { status: 200 });
  }
  
  return NextResponse.json({ message: 'E-Cart webhook endpoint' });
}