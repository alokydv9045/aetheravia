// API endpoint for 3PL shipment analytics
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';

// GET /api/3pl/analytics - Get shipment analytics
export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get analytics
    const analyticsResult = await OrderShipmentService.getShipmentAnalytics({
      from: startDate,
      to: endDate,
    });

    if (analyticsResult.success) {
      return NextResponse.json({
        success: true,
        data: analyticsResult.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: analyticsResult.error,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error getting 3PL analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}) as any;