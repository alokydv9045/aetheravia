'use client';

import { useState, useEffect } from 'react';
import { useAdminWebSocket } from '@/lib/hooks/useWebSocket';

interface AdminOrderManagerProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

interface AdminOrderUpdate {
  orderId: string;
  status: string;
  updatedBy: string;
  timestamp: string;
  message?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-green-600' },
  { value: 'processing', label: 'Processing', color: 'btn-info' },
  { value: 'shipped', label: 'Shipped', color: 'btn-primary' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'btn-secondary' },
  { value: 'delivered', label: 'Delivered', color: 'btn-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'btn-error' },
  { value: 'refunded', label: 'Refunded', color: 'btn-error' },
];

export default function AdminOrderManager({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: AdminOrderManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<AdminOrderUpdate[]>([]);
  
  const { 
    isConnected, 
    sendOrderUpdate, 
    orderUpdates 
  } = useAdminWebSocket();

  // Listen for incoming order updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const relevantUpdates = orderUpdates.filter(update => 
        update.orderId === orderId
      );
      
      if (relevantUpdates.length > 0) {
        setRecentUpdates(prev => {
          const newUpdates = relevantUpdates.map(update => ({
            orderId: update.orderId,
            status: update.status,
            updatedBy: update.updatedBy || 'System',
            timestamp: update.timestamp,
            message: update.message,
          }));
          
          return [...newUpdates, ...prev].slice(0, 10); // Keep last 10 updates
        });
      }
    }
  }, [orderUpdates, orderId]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      return;
    }

    setIsUpdating(true);
    
    try {
      // Send real-time update via WebSocket
      await sendOrderUpdate({
        orderId,
        status: selectedStatus,
        message: updateMessage || `Order status updated to ${selectedStatus}`,
        updatedBy: 'Admin', // This should come from session in real implementation
      });

      // Call parent callback if provided
      if (onStatusUpdate) {
        onStatusUpdate(orderId, selectedStatus);
      }

      // Clear message after successful update
      setUpdateMessage('');
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Reset to current status on error
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'btn-neutral';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  return (
    <div className="space-y-6">
      {/* Status Update Section */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Update Order Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="mb-4">
            <label className="label">
              <span className="label-text">Current Status</span>
            </label>
            <div className={`btn ${getStatusColor(currentStatus)} btn-sm no-animation`}>
              {getStatusLabel(currentStatus)}
            </div>
          </div>

          {/* Status Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">New Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Update Message */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Update Message (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Add a note about this status update..."
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-end">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSelectedStatus(currentStatus);
                setUpdateMessage('');
              }}
            >
              Reset
            </button>
            <button
              className={`btn btn-primary ${isUpdating ? 'loading' : ''}`}
              onClick={handleStatusUpdate}
              disabled={selectedStatus === currentStatus || isUpdating || !isConnected}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      {recentUpdates.length > 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h4 className="card-title text-base">Recent Updates</h4>
            <div className="space-y-3">
              {recentUpdates.map((update, index) => (
                <div 
                  key={`${update.timestamp}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-base-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-sm ${getStatusColor(update.status).replace('btn-', 'badge-')}`}>
                        {getStatusLabel(update.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        by {update.updatedBy}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {update.message && (
                      <p className="text-sm text-gray-700">{update.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h4 className="card-title text-base">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {currentStatus === 'pending' && (
              <button
                className="btn btn-info btn-sm"
                onClick={() => {
                  setSelectedStatus('processing');
                  setUpdateMessage('Order is now being processed');
                }}
              >
                Mark as Processing
              </button>
            )}
            {currentStatus === 'processing' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedStatus('shipped');
                  setUpdateMessage('Order has been shipped');
                }}
              >
                Mark as Shipped
              </button>
            )}
            {currentStatus === 'shipped' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedStatus('out_for_delivery');
                  setUpdateMessage('Order is out for delivery');
                }}
              >
                Out for Delivery
              </button>
            )}
            {currentStatus === 'out_for_delivery' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
                  setSelectedStatus('delivered');
                  setUpdateMessage('Order has been delivered successfully');
                }}
              >
                Mark as Delivered
              </button>
            )}
            {!['delivered', 'cancelled', 'refunded'].includes(currentStatus) && (
              <button
                className="btn btn-error btn-sm btn-outline"
                onClick={() => {
                  setSelectedStatus('cancelled');
                  setUpdateMessage('Order has been cancelled');
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}