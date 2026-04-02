// API Route for Tracking Shipments
import { NextRequest, NextResponse } from 'next/server';
import { Courier3PLManager } from '@/lib/3pl/manager';
import { Shipment } from '@/lib/models/Shipment';

// Initialize 3PL Manager
const courier3PL = new Courier3PLManager({
  shippo: {
    apiKey: process.env.SHIPPO_API_KEY || '',
    baseUrl: process.env.SHIPPO_BASE_URL || 'https://api.goshippo.com',
    environment: (process.env.NODE_ENV === 'production' ? 'live' : 'test') as 'test' | 'live',
  },
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
});

// GET /api/3pl/track/[trackingId] - Track shipment
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    // Get shipment from database
    const shipment = await Shipment.findOne({ trackingId })
      .populate('orderId', 'orderNumber customerName')
      .lean();

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Type assertion for lean document
    const shipmentData = shipment as any;

    // Get live tracking data from 3PL provider
    const trackingResult = await courier3PL.trackShipment(trackingId, shipmentData.provider);

    if (trackingResult.success) {
      // Update shipment in database if status changed
      if (trackingResult.status !== shipmentData.status) {
        await Shipment.findByIdAndUpdate(shipmentData._id, {
          status: trackingResult.status,
          currentLocation: trackingResult.location,
          estimatedDelivery: trackingResult.estimatedDelivery ? new Date(trackingResult.estimatedDelivery) : undefined,
          $push: {
            trackingHistory: {
              timestamp: new Date(),
              status: trackingResult.status,
              location: trackingResult.location,
              remarks: 'Status updated via tracking API',
              updatedBy: 'SYSTEM',
            },
          },
        });

        // Update actual delivery date if delivered
        if (trackingResult.status === 'DELIVERED') {
          await Shipment.findByIdAndUpdate(shipmentData._id, {
            actualDelivery: new Date(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          trackingId,
          orderId: shipmentData.orderId,
          provider: shipmentData.provider,
          courierName: shipmentData.courierName,
          status: trackingResult.status,
          statusCode: trackingResult.statusCode,
          currentLocation: trackingResult.location,
          estimatedDelivery: trackingResult.estimatedDelivery,
          trackingHistory: trackingResult.history || shipmentData.trackingHistory,
          shippingCharges: shipmentData.shippingCharges,
          lastUpdated: new Date().toISOString(),
        },
      });
    } else {
      // Return database information if API call fails
      return NextResponse.json({
        success: true,
        data: {
          trackingId,
          orderId: shipmentData.orderId,
          provider: shipmentData.provider,
          courierName: shipmentData.courierName,
          status: shipmentData.status,
          currentLocation: shipmentData.currentLocation,
          estimatedDelivery: shipmentData.estimatedDelivery,
          trackingHistory: shipmentData.trackingHistory,
          shippingCharges: shipmentData.shippingCharges,
          lastUpdated: shipmentData.updatedAt,
          note: 'Live tracking temporarily unavailable, showing last known status',
        },
      });
    }
  } catch (error: any) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/3pl/track/[trackingId] - Manually update tracking status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    const { status, location, remarks } = await request.json();

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: 'Tracking ID and status are required' },
        { status: 400 }
      );
    }

    const shipment = await Shipment.findOne({ trackingId });
    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update tracking status
    await shipment.addTrackingUpdate(status, location, remarks, 'MANUAL');

    return NextResponse.json({
      success: true,
      message: 'Tracking status updated successfully',
    });
  } catch (error: any) {
    console.error('Manual tracking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}