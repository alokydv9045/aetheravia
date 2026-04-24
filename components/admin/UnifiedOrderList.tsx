'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { 
  Package, 
  Eye, 
  Settings, 
  Plus, 
  Minus 
} from 'lucide-react';

interface Order {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
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
  status: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UnifiedOrderListProps {
  orders: Order[];
  loading: boolean;
  viewMode: 'table' | 'cards';
  selectedOrders: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function UnifiedOrderList({
  orders,
  loading,
  viewMode,
  selectedOrders,
  onSelectionChange,
  onStatusUpdate,
}: UnifiedOrderListProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(orders.map(order => order._id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  // Handle individual selection
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelection = new Set(selectedOrders);
    if (checked) {
      newSelection.add(orderId);
    } else {
      newSelection.delete(orderId);
    }
    onSelectionChange(newSelection);
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className="badge badge-ghost badge-sm">unknown</span>;
    const normalized = status.toLowerCase();
    const map: Record<string, string> = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-accent',
      out_for_delivery: 'badge-secondary',
      delivered: 'badge-success',
      cancelled: 'badge-error',
      refunded: 'badge-neutral'
    };
    const cls = map[normalized] || 'badge-outline';
    return <span className={`badge badge-sm ${cls}`}>{normalized.replaceAll('_', ' ')}</span>;
  };


  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-base-100 p-4 space-y-3">
            <div className="h-4 w-1/3 bg-base-300 rounded" />
            <div className="h-3 w-1/2 bg-base-300 rounded" />
            <div className="h-3 w-2/3 bg-base-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">No orders found</h3>
        <p className="text-base-content/70">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order._id} className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              {/* Header with selection */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedOrders.has(order._id)}
                    onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                  />
                  <div>
                    <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-base-content/70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status || order.orderStatus} />
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <p className="font-medium text-sm">
                  {order.user?.name || order.shippingAddress?.fullName || 'Unknown Customer'}
                </p>
                <p className="text-xs text-base-content/70">
                  {order.user?.email || order.shippingAddress?.email || ''}
                </p>
              </div>

              {/* Order Details */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span>{order.orderItems?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>


              {/* Actions */}
              <div className="flex gap-2">
                <Link 
                  href={`/order/${order._id}`} 
                  className="btn btn-xs btn-outline flex-1"
                >
                  View
                </Link>
                
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-xs btn-outline">
                    Status
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                    <li><a onClick={() => onStatusUpdate(order._id, 'processing')}>Processing</a></li>
                    <li><a onClick={() => onStatusUpdate(order._id, 'shipped')}>Shipped</a></li>
                    <li><a onClick={() => onStatusUpdate(order._id, 'delivered')}>Delivered</a></li>
                    <li><a onClick={() => onStatusUpdate(order._id, 'cancelled')}>Cancelled</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view
  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedOrders.size === orders.length && orders.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Payment</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order._id}>
              <tr className="hover">
                <td>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                  />
                </td>
                <td>
                  <div>
                    <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-base-content/70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td>
                  <div>
                    <p className="font-medium">
                      {order.user?.name || order.shippingAddress?.fullName || 'Unknown'}
                    </p>
                    <p className="text-xs text-base-content/70">
                      {order.user?.email || order.shippingAddress?.email || ''}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span>{order.orderItems?.length || 0}</span>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => toggleOrderExpansion(order._id)}
                    >
                      {expandedOrders.has(order._id) ? <Minus size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                </td>
                <td>
                  <span className="capitalize">{order.paymentMethod}</span>
                </td>
                <td>
                  <span className="font-medium">{formatPrice(order.totalPrice)}</span>
                </td>
                <td>
                  <StatusBadge status={order.status || order.orderStatus} />
                </td>
                <td>
                  <div className="flex gap-1">
                    <Link 
                      href={`/order/${order._id}`} 
                      className="btn btn-ghost btn-xs"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-xs" title="Update Status">
                        <Settings size={16} />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                        <li><a onClick={() => onStatusUpdate(order._id, 'processing')}>Processing</a></li>
                        <li><a onClick={() => onStatusUpdate(order._id, 'shipped')}>Shipped</a></li>
                        <li><a onClick={() => onStatusUpdate(order._id, 'delivered')}>Delivered</a></li>
                        <li><a onClick={() => onStatusUpdate(order._id, 'cancelled')}>Cancelled</a></li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Expanded row for order items */}
              {expandedOrders.has(order._id) && (
                <tr>
                  <td colSpan={9}>
                    <div className="p-4 bg-base-200 rounded">
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            {item.image && (
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-base-content/70">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatPrice(item.quantity * item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Shipping Address */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Shipping Address:</h4>
                        <div className="text-sm text-base-content/70">
                          <p>{order.shippingAddress?.fullName}</p>
                          <p>{order.shippingAddress?.address}</p>
                          <p>
                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                          </p>
                          <p>{order.shippingAddress?.country}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}