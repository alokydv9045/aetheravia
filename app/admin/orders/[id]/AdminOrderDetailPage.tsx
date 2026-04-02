'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

import OrderStatusManager3PL from '@/components/admin/OrderStatusManager3PL';
import OrderNotificationPanel from '@/components/admin/orders/OrderNotificationPanel';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  _id: string;
  product: string;
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface OrderDetails {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime?: string;
    emailAddress?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string;
  deliveredAt?: string;
  status: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    location?: string;
    metadata?: Record<string, any>;
  }>;
  tracking?: {
    number?: string;
    carrier?: string;
    url?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminOrderDetailPageProps {
  orderId: string;
}

export default function AdminOrderDetailPage({ orderId }: AdminOrderDetailPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'actions'>('details');

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data);
      } else {
        setError(data.message || 'Failed to load order');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId, loadOrder]);

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      loadOrder(); // Reload to get updated timeline
    }
  };

  const handleMarkPaid = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Order marked as paid');
        loadOrder();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to mark as paid');
      }
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handleMarkDelivered = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Order marked as delivered');
        loadOrder();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to mark as delivered');
      }
    } catch (error) {
      toast.error('Failed to mark as delivered');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-primary',
      shipped: 'badge-accent',
      out_for_delivery: 'badge-secondary',
      delivered: 'badge-success',
      cancelled: 'badge-error',
      returned: 'badge-ghost',
    };
    return statusColors[status] || 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
        <span>{error}</span>
        <button 
          onClick={loadOrder} 
          className="btn btn-sm btn-outline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-warning max-w-md mx-auto mt-8">
        <span>Order not found</span>
        <Link href="/admin/orders" className="btn btn-sm btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/orders" 
            className="btn btn-ghost btn-sm"
            aria-label="Back to orders"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
            <p className="text-base-content/70">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`badge ${getStatusColor(order.status)} badge-lg`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </div>
          {order.isPaid && (
            <div className="badge badge-success badge-lg">PAID</div>
          )}
          {order.isDelivered && (
            <div className="badge badge-success badge-lg">DELIVERED</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-fit">
        <button
          className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Order Details
        </button>
        <button
          className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Shipping Info */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Customer & Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-sm text-base-content/70 mb-2">Customer</h3>
                    <div className="space-y-1">
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-sm text-base-content/60">{order.user?.email}</p>
                      <p className="text-xs text-base-content/50">ID: {order.user?._id}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-base-content/70 mb-2">Shipping Address</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p>Phone: {order.shippingAddress.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Order Items ({order.items.length})</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-base-content/60">SKU: {item.slug}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="badge badge-outline">Qty: {item.qty}</span>
                          <span className="font-semibold">{formatPrice(item.price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Payment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-sm text-base-content/70 mb-2">Payment Method</h3>
                    <p className="font-medium capitalize">{order.paymentMethod}</p>
                    <div className="mt-2">
                      <div className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                        {order.isPaid ? 'Paid' : 'Pending Payment'}
                      </div>
                    </div>
                    {order.paidAt && (
                      <p className="text-xs text-base-content/50 mt-1">
                        Paid on {formatDate(order.paidAt)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-base-content/70 mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{formatPrice(order.itemsPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatPrice(order.shippingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatPrice(order.taxPrice)}</span>
                      </div>
                      <div className="divider my-2"></div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(order.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management Sidebar */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Status Management</h2>
                <OrderStatusManager3PL 
                  orderId={order._id}
                  currentStatus={order.status}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="space-y-3">
                  {!order.isPaid && (
                    <button
                      onClick={handleMarkPaid}
                      className="btn btn-success btn-sm w-full"
                    >
                      Mark as Paid
                    </button>
                  )}
                  {order.isPaid && !order.isDelivered && (
                    <button
                      onClick={handleMarkDelivered}
                      className="btn btn-info btn-sm w-full"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <Link
                    href={`/order/${order._id}`}
                    className="btn btn-outline btn-sm w-full"
                  >
                    View Customer Page
                  </Link>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.tracking && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title">Tracking Information</h2>
                  <div className="space-y-2">
                    {order.tracking.number && (
                      <div>
                        <span className="text-sm text-base-content/70">Tracking Number:</span>
                        <p className="font-mono font-medium">{order.tracking.number}</p>
                      </div>
                    )}
                    {order.tracking.carrier && (
                      <div>
                        <span className="text-sm text-base-content/70">Carrier:</span>
                        <p className="font-medium">{order.tracking.carrier}</p>
                      </div>
                    )}
                    {order.tracking.url && (
                      <a
                        href={order.tracking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm w-full"
                      >
                        Track Package
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Order Timeline</h2>
            {order.timeline && order.timeline.length > 0 ? (
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      {index < order.timeline.length - 1 && (
                        <div className="w-0.5 h-16 bg-base-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.description}</p>
                          <p className="text-sm text-base-content/60">
                            Status: {event.status.replace('_', ' ')}
                            {event.location && ` • ${event.location}`}
                          </p>
                        </div>
                        <span className="text-xs text-base-content/50">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60">No timeline events available</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Order Actions</h2>
              <div className="space-y-3">
                <button className="btn btn-outline btn-sm w-full">
                  Print Invoice
                </button>
                <button className="btn btn-outline btn-sm w-full">
                  Print Shipping Label
                </button>
                <button className="btn btn-outline btn-sm w-full">
                  Send Email Update
                </button>
              </div>
            </div>
          </div>

          {/* Order Notification Panel */}
          <div className="md:col-span-2">
            <OrderNotificationPanel
              orderId={order._id}
              orderNumber={order._id.slice(-8).toUpperCase()}
              customerEmail={order.user?.email}
              customerPhone={order.shippingAddress?.phone}
            />
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Advanced Actions</h2>
              <div className="space-y-3">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg w-full transition-colors text-sm">
                  Initiate Return
                </button>
                <button className="btn btn-error btn-sm w-full">
                  Cancel Order
                </button>
                <button className="btn btn-ghost btn-sm w-full">
                  Duplicate Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}