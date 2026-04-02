import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS, type OrderStatus } from '@/lib/models/OrderModel';

// Sync tracking updates from 3PL/carrier
// Expects JSON body: { status?: string, location?: string, description?: string, timestamp?: string|Date, estimatedDeliveryDate?: string|Date, carrierName?: string, trackingNumber?: string }
export const PUT = auth(async (...args: any) => {
	const [req, { params }] = args;
	if (!req.auth || !req.auth.user?.isAdmin) {
		return Response.json(
			{ message: 'unauthorized' },
			{ status: 401 },
		);
	}

	try {
		await dbConnect();
		const body = await req.json().catch(() => ({}));
		const {
			status,
			location,
			description,
			timestamp,
			estimatedDeliveryDate,
			carrierName,
			trackingNumber,
		} = body || {};

		const order = await OrderModel.findById(params.id);
		if (!order) {
			return Response.json({ message: 'Order not found' }, { status: 404 });
		}

		// Update simple fields if provided
		if (typeof carrierName === 'string') order.carrierName = carrierName;
		if (typeof trackingNumber === 'string') order.trackingNumber = trackingNumber;
		if (estimatedDeliveryDate) {
			const d = new Date(estimatedDeliveryDate);
			if (!Number.isNaN(d.getTime())) order.estimatedDeliveryDate = d;
		}

		// Compute timeline status
		const validStatuses = new Set(Object.values(ORDER_STATUS));
		let newStatus: OrderStatus | undefined;
		if (typeof status === 'string' && validStatuses.has(status as OrderStatus)) {
			newStatus = status as OrderStatus;
			order.status = newStatus;
		}

		// Build timeline event
		const time = timestamp ? new Date(timestamp) : new Date();
		const safeTime = Number.isNaN(time.getTime()) ? new Date() : time;
		order.timeline.push({
			status: newStatus || order.status,
			timestamp: safeTime,
			description: description || `Tracking update${trackingNumber ? ` for ${trackingNumber}` : ''}`,
			location: location || order.shippingAddress?.city || '',
			updatedBy: req.auth.user?.id,
			metadata: { carrierName, trackingNumber },
		});

		const updated = await order.save();
		return Response.json(updated);
	} catch (err: any) {
		return Response.json(
			{ message: err?.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}) as any;

