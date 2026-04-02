// Normalize webhook payloads from various courier providers into a common shape

export type NormalizedWebhook = {
  trackingId: string | null;
  status?: string;
  location?: string;
  eta?: Date;
  actualDelivery?: Date;
  remarks?: string;
};

function parseDate(value: any): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function mapStatus(raw?: string): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).toLowerCase();
  if (s.includes('deliver') && (s.includes('complete') || s.includes('success') || !s.includes('attempt'))) return 'DELIVERED';
  if (s.includes('out for delivery') || s.includes('ofd')) return 'OUT_FOR_DELIVERY';
  if (s.includes('in transit') || s.includes('transit') || s.includes('moving')) return 'IN_TRANSIT';
  if (s.includes('picked')) return 'PICKED_UP';
  if (s.includes('return')) return 'RETURNED';
  if (s.includes('fail') || s.includes('attempt')) return 'FAILED_DELIVERY';
  if (s.includes('cancel')) return 'CANCELLED';
  if (s.includes('lost')) return 'LOST';
  if (s.includes('damage')) return 'DAMAGED';
  if (s.includes('create')) return 'CREATED';
  return undefined;
}

export function normalizeWebhook(provider: string, body: any): NormalizedWebhook {
  const trackingId =
    body?.tracking_id || body?.trackingId || body?.awb || body?.awbNo || body?.waybill || body?.Shipment?.AWB || null;

  // Try common status fields
  const rawStatus = body?.status || body?.current_status || body?.scan_status || body?.event_status || body?.Shipment?.Status;
  const status = mapStatus(rawStatus) || (rawStatus ? String(rawStatus).toUpperCase() : undefined);

  const location = body?.location || body?.current_location || body?.currentLocation || body?.scan_location || body?.event_location || body?.place || undefined;

  const eta = parseDate(
    body?.eta || body?.estimated_delivery || body?.estimatedDelivery || body?.expected_delivery_date || body?.EDD
  );

  const actualDelivery = parseDate(body?.delivered_at || body?.deliveredAt || body?.DeliveryDate || body?.delivery_date);

  const remarks = body?.remarks || body?.message || body?.description || body?.event_remark || undefined;

  return { trackingId, status, location, eta, actualDelivery, remarks };
}
