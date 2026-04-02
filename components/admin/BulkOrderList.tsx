'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

// Date formatting helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
import { OrderFilters } from './AdvancedOrderFilters';

interface Order {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface BulkOrderListProps {
  orders: Order[];
  loading?: boolean;
  onStatusUpdate?: (orderIds: string[], newStatus: string) => Promise<void>;
  onExport?: (orderIds: string[]) => void;
  onDelete?: (orderIds: string[]) => Promise<void>;
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

export default function BulkOrderList({
  orders,
  loading = false,
  onStatusUpdate,
  onExport,
  onDelete,
}: BulkOrderListProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const selectAll = useCallback(() => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order._id)));
    }
  }, [orders, selectedOrders.size]);

  const toggleOrderSelection = useCallback((orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  }, [selectedOrders]);

  const executeBulkAction = async () => {
    if (selectedOrders.size === 0) return;

    setIsProcessingBulk(true);
    const orderIds = Array.from(selectedOrders);

    try {
      switch (bulkAction) {
        case 'status':
          if (bulkStatus && onStatusUpdate) {
            await onStatusUpdate(orderIds, bulkStatus);
          }
          break;
        case 'export':
          if (onExport) {
            onExport(orderIds);
          }
          break;
        case 'delete':
          if (onDelete) {
            const confirmed = confirm(`Are you sure you want to delete ${orderIds.length} order(s)?`);
            if (confirmed) {
              await onDelete(orderIds);
            }
          }
          break;
      }

      // Clear selection after successful action
      setSelectedOrders(new Set());
      setBulkAction('');
      setBulkStatus('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'badge-neutral';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="card bg-primary text-primary-content shadow">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                </span>
                
                <select
                  className="select select-sm bg-white text-black"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <option value="">Choose Action</option>
                  <option value="status">Update Status</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>

                {bulkAction === 'status' && (
                  <select
                    className="select select-sm bg-white text-black"
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}

                <button
                  className={`btn btn-sm ${isProcessingBulk ? 'loading' : ''}`}
                  disabled={!bulkAction || (bulkAction === 'status' && !bulkStatus) || isProcessingBulk}
                  onClick={executeBulkAction}
                >
                  {isProcessingBulk ? 'Processing...' : 'Execute'}
                </button>
              </div>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedOrders(new Set())}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Button */}
      <div className="flex items-center justify-between">
        <button
          className="btn btn-sm btn-outline"
          onClick={selectAll}
        >
          {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
        </button>
        
        <span className="text-sm text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer ${
              selectedOrders.has(order._id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => toggleOrderSelection(order._id)}
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-1"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => toggleOrderSelection(order._id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">#{order._id.slice(-8)}</h3>
                      <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <div className="font-medium">
                          {order.user?.name || order.shippingAddress?.fullName || 'Unknown'}
                        </div>
                        <div className="text-gray-500">
                          {order.user?.email}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600">Items:</span>
                        <div className="font-medium">
                          {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) > 1 ? 's' : ''}
                        </div>
                        <div className="text-gray-500">
                          {order.orderItems?.[0]?.name || 'No items'}
                          {(order.orderItems?.length || 0) > 1 && ` +${(order.orderItems?.length || 0) - 1} more`}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600">Total:</span>
                        <div className="font-medium text-lg">
                          {formatPrice(order.totalPrice || 0)}
                        </div>
                        <div className="text-gray-500">
                          {order.paymentMethod || 'Not specified'}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600">Date:</span>
                        <div className="font-medium">
                          {order.createdAt ? formatDate(new Date(order.createdAt)) : 'Not available'}
                        </div>
                        <div className="text-gray-500">
                          {order.shippingAddress?.city || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="btn btn-sm btn-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
}