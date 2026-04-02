'use client';

import { useState, useEffect } from 'react';
import { useOrderTracking } from '@/lib/hooks/useWebSocket';
import { formatDate } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface RealTimeOrderStatusProps {
  orderId: string;
  initialStatus?: string;
  className?: string;
}

interface OrderUpdate {
  status: string;
  timestamp: string;
  message?: string;
  location?: string;
}

const statusColors = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'badge-primary',
  out_for_delivery: 'badge-secondary',
  delivered: 'badge-success',
  cancelled: 'badge-error',
  refunded: 'badge-error',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function RealTimeOrderStatus({ 
  orderId, 
  initialStatus = 'pending',
  className = '' 
}: RealTimeOrderStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [statusHistory, setStatusHistory] = useState<OrderUpdate[]>([]);
  
  const { 
    isConnected, 
    orderUpdates, 
    clearUpdates 
  } = useOrderTracking(orderId);

  // Update current status when real-time updates arrive
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[0];
      setCurrentStatus(latestUpdate.status);
      
      // Add to status history
      setStatusHistory(prev => {
        const newUpdate: OrderUpdate = {
          status: latestUpdate.status,
          timestamp: latestUpdate.timestamp,
          message: latestUpdate.message,
        };
        
        // Avoid duplicates
        if (prev.length === 0 || prev[0].timestamp !== newUpdate.timestamp) {
          return [newUpdate, ...prev];
        }
        return prev;
      });
    }
  }, [orderUpdates]);

  // Track connection status
  useEffect(() => {
    setIsLiveConnected(isConnected);
  }, [isConnected]);

  const getStatusBadgeClass = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'badge-neutral';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <div className="flex items-center gap-2">
          <span className={`badge ${getStatusBadgeClass(currentStatus)} badge-lg`}>
            {getStatusLabel(currentStatus)}
          </span>
          
          {/* Live Connection Indicator */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isLiveConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Updates Count */}
      {orderUpdates.length > 0 && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            {orderUpdates.length} new update{orderUpdates.length > 1 ? 's' : ''} received
          </span>
          <div>
            <button 
              className="btn btn-sm btn-outline"
              onClick={clearUpdates}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4">
            <h4 className="card-title text-base">Recent Updates</h4>
            <div className="space-y-3">
              {statusHistory.slice(0, 5).map((update, index) => (
                <div 
                  key={`${update.timestamp}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-base-200"
                >
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    index === 0 ? 'bg-primary animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${getStatusBadgeClass(update.status)} badge-sm`}>
                        {getStatusLabel(update.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {update.message && (
                      <p className="text-sm text-gray-700">{update.message}</p>
                    )}
                    {update.location && (
                      <p className="text-xs text-gray-500">📍 {update.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Debug (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Connection: {isConnected ? <><CheckCircle className="inline text-green-500 mr-1" /> Connected</> : <><XCircle className="inline text-red-500 mr-1" /> Disconnected</>}</div>
          <div>Order ID: {orderId}</div>
          <div>Updates: {orderUpdates.length}</div>
        </div>
      )}
    </div>
  );
}