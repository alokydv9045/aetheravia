import dbConnect from '@/lib/dbConnect';
import { Shipment } from '@/lib/models/Shipment';
import { normalizeWebhook } from '@/lib/services/webhookNormalize';
import { OrderShipmentService } from '@/lib/services/orderShipmentService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
	return Response.json({ ok: true });
}

export async function POST(req: Request) {
		try {
		await dbConnect();
			const body = await req.json().catch(() => ({}));
			const n = normalizeWebhook('BLUEDART', body);
			if (!n.trackingId) return Response.json({ ok: true });

			const shipment = await Shipment.findOne({ trackingId: n.trackingId });
			if (shipment) {
				shipment.webhookData.push({ provider: 'BLUEDART', data: body });
				if (n.status) shipment.status = n.status;
				if (n.location) shipment.currentLocation = n.location;
				if (n.eta) shipment.estimatedDelivery = n.eta;
				if (n.actualDelivery) shipment.actualDelivery = n.actualDelivery;
				shipment.trackingHistory.push({
					status: n.status || shipment.status,
					location: n.location,
					remarks: n.remarks,
					updatedBy: 'WEBHOOK',
				});
				await shipment.save();
				await OrderShipmentService.syncShipmentStatusToOrder(n.trackingId);
			}

			return Response.json({ ok: true });
	} catch (err: any) {
		return Response.json({ ok: false, error: err?.message || 'error' }, { status: 500 });
	}
}

