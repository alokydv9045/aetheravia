// API endpoint to get shipment tracking for an order
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';

// GET /api/orders/[id]/tracking - Get shipment tracking
export const GET = auth(async (...args: any[]) => {
  const [req, { params }] = args;
  
  if (!req.auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    
    // Get shipment tracking
    const trackingResult = await OrderShipmentService.getOrderShipmentTracking(id);
    
    if (trackingResult.success) {
      return NextResponse.json({
        success: true,
        tracking: trackingResult.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: trackingResult.error || 'Tracking information not available',
      }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Error getting tracking information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}) as any;
