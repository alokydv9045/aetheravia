// API Routes for 3PL Integration
import { NextRequest, NextResponse } from 'next/server';
import { Courier3PLManager } from '@/lib/3pl/manager';
import { Shipment } from '@/lib/models/Shipment';
import { requireAdminSession } from '@/lib/requireAdminSession';

// Initialize 3PL Manager
const courier3PL = new Courier3PLManager({
  deliveryCom: {
    apiKey: process.env.DELIVERY_COM_API_KEY || '',
    baseUrl: process.env.DELIVERY_COM_BASE_URL || 'https://api.delivery.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
  eCart: {
    apiKey: process.env.ECART_API_KEY || '',
    secretKey: process.env.ECART_SECRET_KEY || '',
    baseUrl: process.env.ECART_BASE_URL || 'https://api.ecart.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
  shippo: {
    apiKey: process.env.SHIPPO_API_KEY || '',
    baseUrl: process.env.SHIPPO_BASE_URL || 'https://api.goshippo.com/v1',
    environment: (process.env.NODE_ENV === 'production' ? 'live' : 'test') as 'test' | 'live',
  },
});

// POST /api/3pl/shipments - Create new shipment
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shipmentData = await request.json();

    // Validate required fields
    if (!shipmentData.orderId || !shipmentData.customerDetails || !shipmentData.orderDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, customerDetails, orderDetails' },
        { status: 400 }
      );
    }

    // Create shipment via 3PL service
    const result = await courier3PL.createShipment(shipmentData);

    if (result.success) {
      // Save shipment to database
      const shipment = new Shipment({
        orderId: shipmentData.orderId,
        trackingId: result.trackingId,
        provider: result.provider,
        shipmentId: result.shipmentId,
        courierName: result.courierName,
        status: 'CREATED',
        estimatedDelivery: new Date(result.estimatedDelivery),
        shippingCharges: result.shippingCharges,
        codAmount: shipmentData.orderDetails.codAmount || 0,
        weight: shipmentData.orderDetails.totalWeight,
        packageDetails: shipmentData.orderDetails.items.map((item: any) => item.name).join(', '),
        trackingHistory: [{
          timestamp: new Date(),
          status: 'CREATED',
          location: shipmentData.pickupDetails.city,
          remarks: 'Shipment created successfully',
          updatedBy: 'SYSTEM',
        }],
        metadata: {
          createdBy: session.user.email || 'ADMIN',
        },
      });

      await shipment.save();

      return NextResponse.json({
        success: true,
        data: {
          trackingId: result.trackingId,
          provider: result.provider,
          courierName: result.courierName,
          estimatedDelivery: result.estimatedDelivery,
          shippingCharges: result.shippingCharges,
        },
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create shipment' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Shipment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/3pl/shipments - List shipments with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const orderId = searchParams.get('orderId');
    const trackingId = searchParams.get('trackingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (provider) query.provider = provider;
    if (orderId) query.orderId = orderId;
    if (trackingId) query.trackingId = new RegExp(trackingId, 'i');

    // Get shipments with pagination
    const shipments = await Shipment.find(query)
      .populate('orderId', 'orderNumber customerName totalPrice')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Shipment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get shipments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}