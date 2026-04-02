// WebSocket server utilities for real-time order updates
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export interface ServerToClientEvents {
  orderStatusUpdate: (data: {
    orderId: string;
    status: string;
    timestamp: string;
    message?: string;
    updatedBy?: string;
    trackingInfo?: any;
  }) => void;
  orderCreated: (data: {
    orderId: string;
    userId: string;
    totalPrice: number;
    timestamp: string;
  }) => void;
  inventoryUpdate: (data: {
    productId: string;
    countInStock: number;
    timestamp: string;
  }) => void;
  adminMetricsUpdate: (data: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    timestamp: string;
  }) => void;
}

export interface ClientToServerEvents {
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
  joinAdminRoom: () => void;
  leaveAdminRoom: () => void;
  joinUserRoom: (userId: string) => void;
  leaveUserRoom: (userId: string) => void;
  updateOrderStatus: (data: {
    orderId: string;
    status: string;
    message?: string;
    updatedBy?: string;
    timestamp: string;
  }, callback: (response: { success: boolean; error?: string }) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  isAdmin?: boolean;
  joinedRooms: string[];
}

export type CustomSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type CustomSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// WebSocket manager class
class WebSocketManager {
  private static instance: WebSocketManager;
  private io: CustomSocketServer | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public initialize(server: HttpServer): CustomSocketServer {
    if (this.io) {
      return this.io;
    }

    this.io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    return this.io;
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: CustomSocket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);
      
      socket.data.joinedRooms = [];

      // Handle joining order-specific room
      socket.on('joinOrderRoom', (orderId: string) => {
        socket.join(`order:${orderId}`);
        socket.data.joinedRooms.push(`order:${orderId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined order room: ${orderId}`);
      });

      // Handle leaving order-specific room
      socket.on('leaveOrderRoom', (orderId: string) => {
        socket.leave(`order:${orderId}`);
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== `order:${orderId}`
        );
        console.log(`[WebSocket] Socket ${socket.id} left order room: ${orderId}`);
      });

      // Handle joining admin room
      socket.on('joinAdminRoom', () => {
        socket.join('admin');
        socket.data.isAdmin = true;
        socket.data.joinedRooms.push('admin');
        console.log(`[WebSocket] Socket ${socket.id} joined admin room`);
      });

      // Handle leaving admin room
      socket.on('leaveAdminRoom', () => {
        socket.leave('admin');
        socket.data.isAdmin = false;
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== 'admin'
        );
        console.log(`[WebSocket] Socket ${socket.id} left admin room`);
      });

      // Handle joining user-specific room
      socket.on('joinUserRoom', (userId: string) => {
        socket.join(`user:${userId}`);
        socket.data.userId = userId;
        socket.data.joinedRooms.push(`user:${userId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined user room: ${userId}`);
      });

      // Handle leaving user-specific room
      socket.on('leaveUserRoom', (userId: string) => {
        socket.leave(`user:${userId}`);
        socket.data.userId = undefined;
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== `user:${userId}`
        );
        console.log(`[WebSocket] Socket ${socket.id} left user room: ${userId}`);
      });

      // Handle order status updates from admin
      socket.on('updateOrderStatus', (data, callback) => {
        try {
          // Verify this is an admin socket
          if (!socket.data.isAdmin) {
            callback({ success: false, error: 'Unauthorized: Admin access required' });
            return;
          }

          // Emit the status update to all relevant rooms
          this.emitOrderStatusUpdate(data.orderId, {
            orderId: data.orderId,
            status: data.status,
            timestamp: data.timestamp,
            message: data.message,
            updatedBy: data.updatedBy,
          });

          // TODO: In a real implementation, you would also update the database here
          // await updateOrderStatusInDatabase(data.orderId, data.status, data.message);

          callback({ success: true });
          console.log(`[WebSocket] Order status updated by admin: ${data.orderId} -> ${data.status}`);
        } catch (error) {
          console.error(`[WebSocket] Error updating order status:`, error);
          callback({ success: false, error: 'Failed to update order status' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): CustomSocketServer | null {
    return this.io;
  }

  // Utility methods for emitting events
  public emitOrderStatusUpdate(orderId: string, data: Parameters<ServerToClientEvents['orderStatusUpdate']>[0]) {
    if (!this.io) return;
    
    // Emit to specific order room
    this.io.to(`order:${orderId}`).emit('orderStatusUpdate', data);
    
    // Also emit to admin room for real-time monitoring
    this.io.to('admin').emit('orderStatusUpdate', data);
    
    console.log(`[WebSocket] Emitted order status update for order: ${orderId}`);
  }

  public emitNewOrder(data: Parameters<ServerToClientEvents['orderCreated']>[0]) {
    if (!this.io) return;
    
    // Emit to admin room for new order notifications
    this.io.to('admin').emit('orderCreated', data);
    
    console.log(`[WebSocket] Emitted new order notification: ${data.orderId}`);
  }

  public emitInventoryUpdate(data: Parameters<ServerToClientEvents['inventoryUpdate']>[0]) {
    if (!this.io) return;
    
    // Emit to all connected clients for inventory updates
    this.io.emit('inventoryUpdate', data);
    
    console.log(`[WebSocket] Emitted inventory update for product: ${data.productId}`);
  }

  public emitAdminMetricsUpdate(data: Parameters<ServerToClientEvents['adminMetricsUpdate']>[0]) {
    if (!this.io) return;
    
    // Emit to admin room only
    this.io.to('admin').emit('adminMetricsUpdate', data);
    
    console.log(`[WebSocket] Emitted admin metrics update`);
  }

  public emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, data);
    console.log(`[WebSocket] Emitted ${event} to user: ${userId}`);
  }
}

export default WebSocketManager;