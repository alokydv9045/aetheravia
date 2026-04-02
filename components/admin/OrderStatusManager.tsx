'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { ORDER_STATUS, OrderStatus } from '@/lib/models/OrderModel';

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate?: (newStatus: OrderStatus) => void;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [description, setDescription] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: ORDER_STATUS.PENDING, label: 'Order Placed', color: 'warning' },
    { value: ORDER_STATUS.CONFIRMED, label: 'Order Confirmed', color: 'info' },
    { value: ORDER_STATUS.PROCESSING, label: 'Processing', color: 'primary' },
    { value: ORDER_STATUS.SHIPPED, label: 'Shipped', color: 'primary' },
    { value: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', color: 'warning' },
    { value: ORDER_STATUS.DELIVERED, label: 'Delivered', color: 'success' },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled', color: 'error' },
    { value: ORDER_STATUS.RETURNED, label: 'Returned', color: 'error' },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          description: description || undefined,
          trackingNumber: trackingNumber || undefined,
          carrierName: carrierName || undefined,
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        onStatusUpdate?.(selectedStatus);
        
        // Reset form
        setDescription('');
        setTrackingNumber('');
        setCarrierName('');
        setNotes('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Status update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'neutral';
  };

  const getQuickActions = () => {
    const actions = [];
    
    switch (currentStatus) {
      case ORDER_STATUS.PENDING:
        actions.push(
          { status: ORDER_STATUS.CONFIRMED, label: 'Confirm Order', color: 'info' },
          { status: ORDER_STATUS.CANCELLED, label: 'Cancel Order', color: 'error' }
        );
        break;
      case ORDER_STATUS.CONFIRMED:
        actions.push(
          { status: ORDER_STATUS.PROCESSING, label: 'Start Processing', color: 'primary' }
        );
        break;
      case ORDER_STATUS.PROCESSING:
        actions.push(
          { status: ORDER_STATUS.SHIPPED, label: 'Mark as Shipped', color: 'primary' }
        );
        break;
      case ORDER_STATUS.SHIPPED:
        actions.push(
          { status: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', color: 'warning' }
        );
        break;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        actions.push(
          { status: ORDER_STATUS.DELIVERED, label: 'Mark as Delivered', color: 'success' }
        );
        break;
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 sm:p-6">
        <h3 className="card-title text-base sm:text-lg">Order Status Management</h3>
        
        {/* Current Status Display */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs sm:text-sm font-medium">Current Status:</span>
            <span className={`badge badge-${getStatusColor(currentStatus)} badge-sm sm:badge-md`}>
              {statusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <h4 className="font-medium mb-2 text-xs sm:text-sm">Quick Actions:</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.status}
                  className={`btn btn-xs sm:btn-sm btn-${action.color}`}
                  onClick={() => {
                    setSelectedStatus(action.status);
                    handleStatusUpdate();
                  }}
                  disabled={isUpdating}
                >
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden text-xs">{action.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divider text-xs">OR</div>

        {/* Manual Status Update */}
        <div className="space-y-3 sm:space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs sm:text-sm">Update Status</span>
            </label>
            <select 
              className="select select-bordered select-sm sm:select-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs sm:text-sm">Description (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Custom status description..."
              className="input input-bordered input-sm sm:input-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {(selectedStatus === ORDER_STATUS.SHIPPED || selectedStatus === ORDER_STATUS.OUT_FOR_DELIVERY) && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs sm:text-sm">Tracking Number</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  className="input input-bordered input-sm sm:input-md"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs sm:text-sm">Carrier Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., FedEx, UPS, DHL..."
                  className="input input-bordered input-sm sm:input-md"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs sm:text-sm">Internal Notes (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm sm:textarea-md"
              placeholder="Internal notes about this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <button
            className="btn btn-primary w-full btn-sm sm:btn-md"
            onClick={handleStatusUpdate}
            disabled={isUpdating || selectedStatus === currentStatus}
          >
            {isUpdating && <span className="loading loading-spinner loading-xs sm:loading-sm"></span>}
            <span className="hidden sm:inline">Update Order Status</span>
            <span className="sm:hidden text-xs">Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusManager;