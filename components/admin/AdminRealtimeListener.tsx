"use client";
import { useEffect, useRef, useState } from 'react';

interface AdminRealtimeEvent {
  type: string;
  ts: number;
  [key: string]: any;
}

// Simple in-memory buffer (last N events) for quick dev inspection
const MAX_EVENTS = 50;

export default function AdminRealtimeListener() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<AdminRealtimeEvent[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);

  useEffect(() => {
    let stopped = false;

    function connect() {
      if (stopped) return;
      const es = new EventSource('/api/admin/realtime');
      esRef.current = es;
      es.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
      };
      es.onerror = () => {
        setConnected(false);
        es.close();
        // Exponential backoff up to ~10s
        const retry = Math.min(10000, 500 * Math.pow(2, retryRef.current++));
        setTimeout(connect, retry);
      };
      es.addEventListener('ping', () => {
        // heartbeat - ignore
      });
      es.addEventListener('message', (e) => {
        if (!e.data) return;
        try {
          const evt: AdminRealtimeEvent = JSON.parse(e.data);
          setEvents((prev) => {
            const next = [evt, ...prev];
            if (next.length > MAX_EVENTS) next.pop();
            return next;
          });
          // TODO: integrate with toast/notification system if desired
        } catch (_) {
          // ignore parse errors
        }
      });
    }

    connect();
    return () => {
      stopped = true;
      esRef.current?.close();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-2 right-2 z-40 text-xs text-gray-500 opacity-60 hover:opacity-100 transition" aria-hidden>
      <div className={`rounded px-2 py-1 shadow ${connected ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
        {connected ? 'Realtime: live' : 'Realtime: offline'}
      </div>
      {process.env.NODE_ENV === 'development' && events.length > 0 && (
        <div className="mt-1 max-h-64 w-72 overflow-auto rounded bg-black/80 p-2 font-mono text-[10px] text-green-200">
          {events.slice(0, 10).map((e, i) => (
            <div key={i} className="mb-1 border-b border-white/10 pb-1 last:border-0">
              <div className="font-semibold text-cyan-300">{e.type}</div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(e, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
