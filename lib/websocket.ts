// WebSocket server utilities for real-time order updates
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

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

      
      socket.data.joinedRooms = [];

      // Handle joining order-specific room
      socket.on('joinOrderRoom', (orderId: string) => {
        socket.join(`order:${orderId}`);
        socket.data.joinedRooms.push(`order:${orderId}`);

      });

      // Handle leaving order-specific room
      socket.on('leaveOrderRoom', (orderId: string) => {
        socket.leave(`order:${orderId}`);
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== `order:${orderId}`
        );

      });

      // Handle joining admin room
      socket.on('joinAdminRoom', () => {
        socket.join('admin');
        socket.data.isAdmin = true;
        socket.data.joinedRooms.push('admin');

      });

      // Handle leaving admin room
      socket.on('leaveAdminRoom', () => {
        socket.leave('admin');
        socket.data.isAdmin = false;
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== 'admin'
        );

      });

      // Handle joining user-specific room
      socket.on('joinUserRoom', (userId: string) => {
        socket.join(`user:${userId}`);
        socket.data.userId = userId;
        socket.data.joinedRooms.push(`user:${userId}`);

      });

      // Handle leaving user-specific room
      socket.on('leaveUserRoom', (userId: string) => {
        socket.leave(`user:${userId}`);
        socket.data.userId = undefined;
        socket.data.joinedRooms = socket.data.joinedRooms.filter(
          (room: string) => room !== `user:${userId}`
        );

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

          // Update the database
          import('@/lib/models/OrderModel').then(async (OrderModelMod) => {
            const OrderModel = OrderModelMod.default;
            const order = await OrderModel.findById(data.orderId);
            if (order) {
              order.status = data.status;
              if (data.message) {
                order.notes = data.message;
              }
              await order.save();
            }
          }).catch(err => console.error("DB Update Error via WebSocket:", err));

          callback({ success: true });

        } catch (error) {
          console.error(`[WebSocket] Error updating order status:`, error);
          callback({ success: false, error: 'Failed to update order status' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {

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
    

  }

  public emitNewOrder(data: Parameters<ServerToClientEvents['orderCreated']>[0]) {
    if (!this.io) return;
    
    // Emit to admin room for new order notifications
    this.io.to('admin').emit('orderCreated', data);
    

  }

  public emitInventoryUpdate(data: Parameters<ServerToClientEvents['inventoryUpdate']>[0]) {
    if (!this.io) return;
    
    // Emit to all connected clients for inventory updates
    this.io.emit('inventoryUpdate', data);
    

  }

  public emitAdminMetricsUpdate(data: Parameters<ServerToClientEvents['adminMetricsUpdate']>[0]) {
    if (!this.io) return;
    
    // Emit to admin room only
    this.io.to('admin').emit('adminMetricsUpdate', data);
    

  }

  public emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, data);

  }
}

export default WebSocketManager;