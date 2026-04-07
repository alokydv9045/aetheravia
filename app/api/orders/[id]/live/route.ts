import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { registerConnection, removeConnection, startHeartbeat } from '@/lib/services/orderLive';

export const GET = auth(async (...request: any) => {
  const [req, { params: paramsPromise }] = request;
  const params = await paramsPromise;
  
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const orderId = params.id;
  
  try {
    await dbConnect();
    
    // Verify order exists and user has access
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return Response.json({ message: 'Order not found' }, { status: 404 });
    }

    // Check if user owns the order or is admin
    const userId = req.auth.user?.id || req.auth.user?._id;
    if (order.user.toString() !== userId.toString()) {
      // Add admin check here if needed
      return Response.json({ message: 'Access denied' }, { status: 403 });
    }

    // Create SSE response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const data = JSON.stringify({
          type: 'connected',
          orderId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        const connectionId = `${orderId}-${Date.now()}`;
        registerConnection(connectionId, { controller, encoder, orderId });
        const currentStatus = {
          type: 'status_update',
          orderId,
          status: order.status,
          timeline: order.timeline,
          progress: order.getProgressPercentage(),
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(currentStatus)}\n\n`));
        req.signal?.addEventListener('abort', () => {
          removeConnection(connectionId);
          controller.close();
        });
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
    
  } catch (error: any) {
    console.error('SSE connection error:', error);
    return Response.json(
      { message: 'Failed to establish real-time connection' },
      { status: 500 }
    );
  }
});

// Start heartbeat for SSE connections
startHeartbeat();