import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { Server as NetServer } from 'http';
import WebSocketManager from '@/lib/websocket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Type assertion for the socket property
  const socketRes = res as any;
  
  if (socketRes.socket.server.io) {
    console.log('[WebSocket] Socket.IO server already running');
    res.end();
    return;
  }

  console.log('[WebSocket] Initializing Socket.IO server...');

  const wsManager = WebSocketManager.getInstance();
  const io = wsManager.initialize(socketRes.socket.server);
  
  socketRes.socket.server.io = io;

  console.log('[WebSocket] Socket.IO server initialized successfully');
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};