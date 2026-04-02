import { EventEmitter } from 'events';

// Reuse a single EventEmitter across hot reloads in dev
const g = globalThis as any;
if (!g.__ADMIN_EVENT_BUS) {
  g.__ADMIN_EVENT_BUS = new EventEmitter();
  g.__ADMIN_EVENT_BUS.setMaxListeners(100);
}

export interface AdminRealtimeEvent {
  type: string; // e.g. 'order.created', 'order.paid', 'shipment.updated'
  ts?: number;   // epoch ms (filled automatically if omitted)
  [key: string]: any; // payload
}

export const adminBus: EventEmitter = g.__ADMIN_EVENT_BUS;

export function emitAdminEvent(evt: AdminRealtimeEvent) {
  evt.ts = evt.ts || Date.now();
  adminBus.emit('admin-event', evt);
}

export function onAdminEvent(cb: (evt: AdminRealtimeEvent) => void) {
  adminBus.on('admin-event', cb);
  return () => adminBus.off('admin-event', cb);
}
