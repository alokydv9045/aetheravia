// Utility for broadcasting order updates via SSE

interface Connection {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  orderId: string;
}

const connections = new Map<string, Connection>();

export function registerConnection(connectionId: string, connection: Connection) {
  connections.set(connectionId, connection);
}

export function removeConnection(connectionId: string) {
  connections.delete(connectionId);
}

export function broadcastOrderUpdate(orderId: string, updateData: any) {
  const message = JSON.stringify({
    type: 'status_update',
    orderId,
    ...updateData,
    timestamp: new Date().toISOString(),
  });
  for (const [connectionId, connection] of connections.entries()) {
    if (connection.orderId === orderId) {
      try {
        connection.controller.enqueue(
          connection.encoder.encode(`data: ${message}\n\n`)
        );
      } catch (error) {
        connections.delete(connectionId);
      }
    }
  }
}

export function startHeartbeat() {
  setInterval(() => {
    const heartbeat = JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    });
    for (const [connectionId, connection] of connections.entries()) {
      try {
        connection.controller.enqueue(
          connection.encoder.encode(`data: ${heartbeat}\n\n`)
        );
      } catch (error) {
        connections.delete(connectionId);
      }
    }
  }, 30000);
}
