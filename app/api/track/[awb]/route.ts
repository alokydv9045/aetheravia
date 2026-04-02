import dbConnect from '@/lib/dbConnect';
import { Courier3PLManager } from '@/lib/3pl/manager';
import { Shipment } from '@/lib/models/Shipment';

// Public tracking endpoint by AWB/tracking number
const courier3PL = new Courier3PLManager({
	shippo: {
		apiKey: process.env.SHIPPO_API_KEY || '',
		baseUrl: process.env.SHIPPO_BASE_URL || 'https://api.goshippo.com',
		environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
	},
	deliveryCom: {
		apiKey: process.env.DELIVERY_COM_API_KEY || '',
		baseUrl: process.env.DELIVERY_COM_BASE_URL || 'https://api.delivery.com',
		environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
	},
	eCart: {
		apiKey: process.env.ECART_API_KEY || '',
		secretKey: process.env.ECART_SECRET_KEY || '',
		baseUrl: process.env.ECART_BASE_URL || 'https://api.ecart.com',
		environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
	},
});

export async function GET(
	_req: Request,
	{ params }: { params: { awb: string } },
) {
	try {
		await dbConnect();
		const { awb } = params;
		if (!awb) {
			return Response.json({ error: 'AWB is required' }, { status: 400 });
		}

		// Try to find a stored shipment first (optional)
		const shipment = await Shipment.findOne({ trackingId: awb });

		// Fetch live tracking from 3PLs
		const result = await courier3PL.trackShipment(awb, shipment?.provider);
		if (!result.success) {
			return Response.json(
				{ success: false, error: result.error || 'Tracking not found' },
				{ status: 404 },
			);
		}

		// Optionally update cached fields
		if (shipment) {
			const now = new Date();
			const historyEntry = {
				timestamp: now,
				status: result.status,
				location: result.location || '',
				remarks: 'Synced via public AWB tracking',
				updatedBy: 'SYSTEM',
			} as any;
			shipment.status = result.status;
			shipment.currentLocation = result.location || shipment.currentLocation;
			if (result.estimatedDelivery) {
				const eta = new Date(result.estimatedDelivery);
				if (!Number.isNaN(eta.getTime())) shipment.estimatedDelivery = eta;
			}
			shipment.trackingHistory.push(historyEntry);
			await shipment.save().catch(() => {});
		}

		return Response.json({ success: true, tracking: result });
	} catch (err: any) {
		return Response.json(
			{ success: false, error: err?.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

