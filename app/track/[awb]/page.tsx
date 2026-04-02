import React from 'react';

export const dynamic = 'force-dynamic';

async function getTracking(awb: string) {
	const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/track/${awb}`, {
		cache: 'no-store',
	});
	if (!res.ok) return null;
	try { return await res.json(); } catch { return null; }
}

export default async function TrackingPage({ params }: { params: { awb: string } }) {
	const data = await getTracking(params.awb);
	if (!data?.success) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-4">Track Shipment</h1>
				<p className="text-error">Tracking not found for AWB: {params.awb}</p>
			</div>
		);
	}
	const t = data.tracking;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Track Shipment</h1>
			<div className="card bg-base-100 shadow">
				<div className="card-body">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div><span className="font-semibold">AWB:</span> {params.awb}</div>
						<div><span className="font-semibold">Provider:</span> {t.provider || '—'}</div>
						<div><span className="font-semibold">Status:</span> {t.status || '—'}</div>
						<div><span className="font-semibold">Location:</span> {t.location || t.currentLocation || '—'}</div>
						<div><span className="font-semibold">ETA:</span> {t.estimatedDelivery ? new Date(t.estimatedDelivery).toLocaleString() : '—'}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

