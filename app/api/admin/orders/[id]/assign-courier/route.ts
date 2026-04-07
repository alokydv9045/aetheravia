import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS, type OrderStatus } from '@/lib/models/OrderModel';

// Assign or update courier details for an order
// Expects JSON body: { carrierName?: string, trackingNumber?: string, estimatedDeliveryDate?: string | Date, status?: string, notes?: string }
export const PUT = auth(async (...args: any) => {
	const [req, { params: paramsPromise }] = args;
	const params = await paramsPromise;
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
			carrierName,
			trackingNumber,
			estimatedDeliveryDate,
			status,
			notes,
		} = body || {};

		const order = await OrderModel.findById(params.id);
		if (!order) {
			return Response.json(
				{ message: 'Order not found' },
				{ status: 404 },
			);
		}

		// Apply updates if provided
		if (typeof carrierName === 'string') order.carrierName = carrierName;
		if (typeof trackingNumber === 'string') order.trackingNumber = trackingNumber;
		if (estimatedDeliveryDate) {
			const d = new Date(estimatedDeliveryDate);
			if (!Number.isNaN(d.getTime())) order.estimatedDeliveryDate = d;
		}
		if (typeof notes === 'string' && notes.trim()) {
			order.notes = [order.notes, notes].filter(Boolean).join('\n');
		}

		// Optionally update status if a valid one is provided
			const validStatuses = new Set(Object.values(ORDER_STATUS));
			if (typeof status === 'string' && validStatuses.has(status as OrderStatus)) {
				order.status = status as OrderStatus;
			}

		// Add a timeline event
		const parts: string[] = [];
		if (carrierName) parts.push(`Courier: ${carrierName}`);
		if (trackingNumber) parts.push(`Tracking: ${trackingNumber}`);
		if (estimatedDeliveryDate) parts.push(`ETA: ${new Date(estimatedDeliveryDate).toLocaleDateString()}`);
		const description = parts.length
			? `Courier assigned/updated — ${parts.join(' · ')}`
			: 'Courier details updated';
		order.timeline.push({
			status: order.status,
			timestamp: new Date(),
			description,
			location: order.shippingAddress?.city || '',
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

