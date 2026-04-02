'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents 
} from '@/lib/websocket';

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onOrderStatusUpdate?: (data: Parameters<ServerToClientEvents['orderStatusUpdate']>[0]) => void;
  onOrderCreated?: (data: Parameters<ServerToClientEvents['orderCreated']>[0]) => void;
  onInventoryUpdate?: (data: Parameters<ServerToClientEvents['inventoryUpdate']>[0]) => void;
  onAdminMetricsUpdate?: (data: Parameters<ServerToClientEvents['adminMetricsUpdate']>[0]) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<ClientSocket | null>(null);
  const {
    autoConnect = true,
    onOrderStatusUpdate,
    onOrderCreated,
    onInventoryUpdate,
    onAdminMetricsUpdate,
  } = options;

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    setIsConnecting(true);

    try {
      // Initialize Socket.IO server first
      await fetch('/api/socket');

      // Create client connection
      const socket: ClientSocket = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('[WebSocket] Connected to server');
        setIsConnected(true);
        setIsConnecting(false);

        // Auto-join user room if logged in
        if (session?.user?._id) {
          socket.emit('joinUserRoom', session.user._id);
        }

        // Auto-join admin room if user is admin
        if (session?.user?.isAdmin) {
          socket.emit('joinAdminRoom');
        }
      });

      socket.on('disconnect', () => {
        console.log('[WebSocket] Disconnected from server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error);
        setIsConnecting(false);
      });

      // Event listeners
      if (onOrderStatusUpdate) {
        socket.on('orderStatusUpdate', onOrderStatusUpdate);
      }

      if (onOrderCreated) {
        socket.on('orderCreated', onOrderCreated);
      }

      if (onInventoryUpdate) {
        socket.on('inventoryUpdate', onInventoryUpdate);
      }

      if (onAdminMetricsUpdate) {
        socket.on('adminMetricsUpdate', onAdminMetricsUpdate);
      }

      return socket;
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
      setIsConnecting(false);
      return null;
    }
  }, [session?.user?._id, session?.user?.isAdmin, onOrderStatusUpdate, onOrderCreated, onInventoryUpdate, onAdminMetricsUpdate]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Join specific order room
  const joinOrderRoom = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinOrderRoom', orderId);
    }
  }, []);

  // Leave specific order room
  const leaveOrderRoom = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveOrderRoom', orderId);
    }
  }, []);

  // Join admin room
  const joinAdminRoom = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinAdminRoom');
    }
  }, []);

  // Leave admin room
  const leaveAdminRoom = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveAdminRoom');
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, connect]);

  // Reconnect when session changes
  useEffect(() => {
    if (socketRef.current?.connected && session?.user) {
      // Join appropriate rooms based on user session
      if (session.user._id) {
        socketRef.current.emit('joinUserRoom', session.user._id);
      }
      
      if (session.user.isAdmin) {
        socketRef.current.emit('joinAdminRoom');
      }
    }
  }, [session]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    joinOrderRoom,
    leaveOrderRoom,
    joinAdminRoom,
    leaveAdminRoom,
  };
}

// Specialized hook for order tracking
export function useOrderTracking(orderId: string) {
  const [orderUpdates, setOrderUpdates] = useState<Parameters<ServerToClientEvents['orderStatusUpdate']>[0][]>([]);

  const { isConnected, joinOrderRoom, leaveOrderRoom, ...websocket } = useWebSocket({
    onOrderStatusUpdate: (data) => {
      if (data.orderId === orderId) {
        setOrderUpdates(prev => [data, ...prev]);
      }
    },
  });

  useEffect(() => {
    if (isConnected) {
      joinOrderRoom(orderId);
    }

    return () => {
      if (isConnected) {
        leaveOrderRoom(orderId);
      }
    };
  }, [isConnected, orderId, joinOrderRoom, leaveOrderRoom]);

  return {
    ...websocket,
    isConnected,
    orderUpdates,
    clearUpdates: () => setOrderUpdates([]),
  };
}

// Specialized hook for admin dashboard
export function useAdminWebSocket() {
  const [newOrders, setNewOrders] = useState<Parameters<ServerToClientEvents['orderCreated']>[0][]>([]);
  const [metricsUpdates, setMetricsUpdates] = useState<Parameters<ServerToClientEvents['adminMetricsUpdate']>[0] | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<Parameters<ServerToClientEvents['orderStatusUpdate']>[0][]>([]);

  const { socket, isConnected, joinAdminRoom, leaveAdminRoom, ...websocket } = useWebSocket({
    onOrderCreated: (data) => {
      setNewOrders(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 orders
    },
    onAdminMetricsUpdate: (data) => {
      setMetricsUpdates(data);
    },
    onOrderStatusUpdate: (data) => {
      setOrderUpdates(prev => [data, ...prev.slice(0, 19)]); // Keep last 20 updates
    },
  });

  useEffect(() => {
    if (isConnected) {
      joinAdminRoom();
    }

    return () => {
      if (isConnected) {
        leaveAdminRoom();
      }
    };
  }, [isConnected, joinAdminRoom, leaveAdminRoom]);

  // Send order status update
  const sendOrderUpdate = useCallback(async (updateData: {
    orderId: string;
    status: string;
    message?: string;
    updatedBy?: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const updatePayload = {
        ...updateData,
        timestamp: new Date().toISOString(),
        updatedBy: updateData.updatedBy || 'Admin',
      };

      socket.emit('updateOrderStatus', updatePayload, (response: { success: boolean; error?: string }) => {
        if (response?.success) {
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to update order status'));
        }
      });
    });
  }, [socket]);

  const joinOrderRoom = useCallback((orderId: string) => {
    if (socket?.connected) {
      socket.emit('joinOrderRoom', orderId);
    }
  }, [socket]);

  const leaveOrderRoom = useCallback((orderId: string) => {
    if (socket?.connected) {
      socket.emit('leaveOrderRoom', orderId);
    }
  }, [socket]);

  return {
    ...websocket,
    isConnected,
    newOrders,
    metricsUpdates,
    orderUpdates,
    sendOrderUpdate,
    joinOrderRoom,
    leaveOrderRoom,
    clearNewOrders: () => setNewOrders([]),
    clearOrderUpdates: () => setOrderUpdates([]),
  };
}