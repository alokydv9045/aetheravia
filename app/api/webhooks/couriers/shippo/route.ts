import dbConnect from '@/lib/dbConnect';
import { Shipment } from '@/lib/models/Shipment';
import { normalizeWebhook } from '@/lib/services/webhookNormalize';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    
    // Shippo webhook structure is different from other providers
    const trackingNumber = body?.tracking_number || body?.object?.tracking_number;
    
    if (!trackingNumber) {
      return Response.json({ ok: true, message: 'No tracking number found' });
    }

    // Find shipment by tracking number
    const shipment = await Shipment.findOne({ trackingId: trackingNumber });
    
    if (shipment) {
      // Store raw webhook data
      shipment.webhookData.push({ 
        provider: 'SHIPPO', 
        data: body,
        timestamp: new Date()
      });

      // Normalize the webhook data
      const normalized = normalizeShippoWebhook(body);
      
      if (normalized.status) {
        shipment.status = normalized.status;
      }
      
      if (normalized.location) {
        shipment.currentLocation = normalized.location;
      }
      
      if (normalized.eta) {
        shipment.estimatedDelivery = normalized.eta;
      }
      
      if (normalized.actualDelivery) {
        shipment.actualDelivery = normalized.actualDelivery;
      }

      // Add tracking history entry
      shipment.trackingHistory.push({
        timestamp: new Date(),
        status: normalized.status || shipment.status,
        location: normalized.location || '',
        remarks: normalized.remarks || 'Status update from Shippo',
        updatedBy: 'WEBHOOK',
      });

      await shipment.save();
      
      // Sync status back to order
      await OrderShipmentService.syncShipmentStatusToOrder(trackingNumber);
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('Shippo webhook error:', err);
    return Response.json({ ok: false, error: err?.message || 'error' }, { status: 500 });
  }
}

// Normalize Shippo webhook data to our standard format
function normalizeShippoWebhook(body: any) {
  const trackingNumber = body?.tracking_number || body?.object?.tracking_number;
  
  // Shippo tracking status mapping
  const status = mapShippoStatus(body?.tracking_status?.status || body?.object?.tracking_status?.status);
  
  const location = body?.tracking_status?.location?.city || 
                  body?.object?.tracking_status?.location?.city || 
                  body?.tracking_status?.location || 
                  body?.object?.tracking_status?.location;
  
  const eta = body?.eta || body?.object?.eta;
  
  // Check if delivered
  const isDelivered = status === 'DELIVERED';
  const actualDelivery = isDelivered ? new Date() : undefined;
  
  const remarks = body?.tracking_status?.status_details || 
                 body?.object?.tracking_status?.status_details ||
                 'Status update from Shippo';

  return {
    trackingId: trackingNumber,
    status,
    location,
    eta: eta ? new Date(eta) : undefined,
    actualDelivery,
    remarks,
  };
}

// Map Shippo status to our internal status
function mapShippoStatus(shippoStatus: string): string | undefined {
  if (!shippoStatus) return undefined;
  
  const status = shippoStatus.toLowerCase();
  
  // Shippo status mapping
  switch (status) {
    case 'pre_transit':
    case 'unknown':
      return 'CREATED';
    case 'transit':
      return 'IN_TRANSIT';
    case 'delivered':
      return 'DELIVERED';
    case 'returned':
      return 'RETURNED';
    case 'failure':
    case 'exception':
      return 'FAILED_DELIVERY';
    default:
      return 'IN_TRANSIT';
  }
}