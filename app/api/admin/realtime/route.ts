import { NextRequest } from 'next/server';
import { onAdminEvent } from '@/lib/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/realtime - Server-Sent Events stream of admin events
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Heartbeat to keep the connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`:heartbeat\n\n`));
      }, 15000);

      const unsubscribe = onAdminEvent((evt) => {
        controller.enqueue(encoder.encode(`event: admin\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      });

      controller.enqueue(encoder.encode('retry: 5000\n'));
      controller.enqueue(encoder.encode(`event: ready\n`));
      controller.enqueue(encoder.encode(`data: {"ok":true}\n\n`));

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
