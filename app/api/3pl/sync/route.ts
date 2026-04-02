// Sync webhook for updating order statuses from 3PL providers
import { NextRequest, NextResponse } from 'next/server';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';
import { Shipment } from '@/lib/models/Shipment';
import dbConnect from '@/lib/dbConnect';

// POST /api/3pl/sync - Sync all shipment statuses
export async function POST(request: NextRequest) {
  try {
    // Check for authorization (webhook secret or admin auth)
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.SYNC_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all active shipments that are not delivered
    const activeShipments = await Shipment.find({
      status: { $nin: ['DELIVERED', 'CANCELLED', 'RETURNED'] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    }).select('trackingId orderId status');

    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[],
    };

    console.log(`Processing ${activeShipments.length} active shipments for sync...`);

    // Process each shipment
    for (const shipment of activeShipments) {
      try {
        results.processed++;
        
        // Sync shipment status to order
        const syncResult = await OrderShipmentService.syncShipmentStatusToOrder(shipment.trackingId);
        
        if (syncResult.success) {
          results.updated++;
          results.details.push({
            trackingId: shipment.trackingId,
            orderId: shipment.orderId,
            status: 'updated',
            orderStatus: syncResult.orderStatus,
            shipmentStatus: syncResult.shipmentStatus,
          });
        } else {
          results.errors++;
          results.details.push({
            trackingId: shipment.trackingId,
            orderId: shipment.orderId,
            status: 'error',
            error: syncResult.error,
          });
        }
        
        // Add small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        results.errors++;
        results.details.push({
          trackingId: shipment.trackingId,
          orderId: shipment.orderId,
          status: 'error',
          error: error.message,
        });
        console.error(`Error syncing shipment ${shipment.trackingId}:`, error);
      }
    }

    console.log('Sync completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      results,
    });

  } catch (error: any) {
    console.error('Error in sync webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/3pl/sync - Get sync status
export async function GET() {
  try {
    await dbConnect();
    
    const activeShipments = await Shipment.countDocuments({
      status: { $nin: ['DELIVERED', 'CANCELLED', 'RETURNED'] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const recentSyncEvents = await Shipment.find({
      'webhookData.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .select('trackingId orderId status webhookData')
      .sort({ 'webhookData.timestamp': -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        activeShipments,
        recentSyncEvents: recentSyncEvents.length,
        lastSync: recentSyncEvents[0]?.webhookData?.slice(-1)[0]?.timestamp || null,
      },
    });

  } catch (error: any) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}