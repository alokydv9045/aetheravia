'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: string) => void;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'badge-warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'badge-info' },
  { value: 'processing', label: 'Processing', color: 'badge-primary' },
  { value: 'shipped', label: 'Shipped', color: 'badge-accent' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'badge-secondary' },
  { value: 'delivered', label: 'Delivered', color: 'badge-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-error' },
  { value: 'returned', label: 'Returned', color: 'badge-ghost' },
];

export default function OrderStatusManager({ orderId, currentStatus, onStatusUpdate }: OrderStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Load tracking information
  const loadTracking = useCallback(async () => {
    if (currentStatus !== 'shipped' && currentStatus !== 'out_for_delivery' && currentStatus !== 'delivered') {
      return;
    }

    setLoadingTracking(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`);
      const data = await response.json();
      
      if (data.success) {
        setTracking(data.tracking);
      }
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setLoadingTracking(false);
    }
  }, [orderId, currentStatus]);

  useEffect(() => {
    loadTracking();
  }, [orderId, currentStatus, loadTracking]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast.error('Please select a different status');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order status updated successfully!');
        
        // Show shipment information if created
        if (data.shipment?.success && data.shipment.trackingId) {
          toast.success(`Shipment created! Tracking ID: ${data.shipment.trackingId}`);
        }
        
        onStatusUpdate?.(selectedStatus);
        setNotes('');
        
        // Reload tracking if status is shipped
        if (selectedStatus === 'shipped') {
          setTimeout(loadTracking, 2000); // Wait for shipment creation
        }
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return ORDER_STATUSES.find(status => status.value === currentStatus);
  };

  const getSelectedStatusInfo = () => {
    return ORDER_STATUSES.find(status => status.value === selectedStatus);
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Order Status</h3>
          <div className="flex items-center gap-3">
            <span className={`badge ${getCurrentStatusInfo()?.color} badge-lg`}>
              {getCurrentStatusInfo()?.label}
            </span>
            <span className="text-sm text-base-content/70">
              Order ID: {orderId.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      {tracking && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">Shipment Tracking</h3>
            {loadingTracking ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Loading tracking information...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Tracking ID:</span>
                    <p className="font-mono text-sm">{tracking.trackingId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Courier:</span>
                    <p className="text-sm">{tracking.courierName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Current Location:</span>
                    <p className="text-sm">{tracking.currentLocation || 'In Transit'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Estimated Delivery:</span>
                    <p className="text-sm">
                      {tracking.estimatedDelivery 
                        ? new Date(tracking.estimatedDelivery).toLocaleDateString()
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Tracking History */}
                {tracking.trackingHistory && tracking.trackingHistory.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Tracking History:</span>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {tracking.trackingHistory.slice(0, 5).map((event: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs py-1 border-b border-base-200 last:border-b-0">
                          <span>{event.description || event.status}</span>
                          <span className="text-base-content/60">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Form */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Update Status</h3>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Status</span>
            </label>
            <select 
              className="select select-bordered"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {ORDER_STATUSES.map(status => (
                <option 
                  key={status.value} 
                  value={status.value}
                  disabled={status.value === currentStatus}
                >
                  {status.label} {status.value === currentStatus ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Notes (Optional)</span>
            </label>
            <textarea 
              className="textarea textarea-bordered"
              placeholder="Add notes about this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Status Preview */}
          {selectedStatus !== currentStatus && (
            <div className="alert alert-info">
              <div className="flex items-center gap-2">
                <span>Status will change to:</span>
                <span className={`badge ${getSelectedStatusInfo()?.color}`}>
                  {getSelectedStatusInfo()?.label}
                </span>
              </div>
              {selectedStatus === 'shipped' && (
                <div className="text-sm mt-1">
                  🚚 A shipment will be automatically created with 3PL provider
                </div>
              )}
            </div>
          )}

          <div className="card-actions justify-end">
            <button 
              className="btn btn-primary"
              onClick={handleStatusUpdate}
              disabled={isUpdating || selectedStatus === currentStatus}
            >
              {isUpdating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}