'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, Settings, Truck, Home, Package, XCircle, RotateCcw, HelpCircle } from 'lucide-react';

import OrderCancelButton from './OrderCancelButton';
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
}

interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  metadata?: Record<string, any>;
}

interface TrackingInfo {
  number?: string;
  carrier?: string;
  url?: string;
  estimatedDelivery?: string;
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
  timeline: TimelineEvent[];
  tracking?: TrackingInfo;
  createdAt: string;
  updatedAt: string;
  progress: {
    percentage: number;
    currentPhase: string;
    nextStatus?: string;
  };
}

interface EnhancedOrderTrackingProps {
  orderId: string;
  razorpayKeyId: string;
}

export default function EnhancedOrderTracking({ orderId, razorpayKeyId }: EnhancedOrderTrackingProps) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'items'>('overview');
  const [isReordering, setIsReordering] = useState(false);

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

  // Real-time updates using polling (can be replaced with WebSocket)
  useEffect(() => {
    if (!order || order.isDelivered) return;

    const interval = setInterval(() => {
      loadOrder();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [order, loadOrder]);

  const handleReorder = async () => {
    if (!order) return;
    
    setIsReordering(true);
    try {
      // Add items to cart (implementation depends on your cart service)
      toast.success('Items added to cart!');
      // Redirect to cart or checkout
    } catch (error) {
      toast.error('Failed to reorder items');
    } finally {
      setIsReordering(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
      pending: {
        label: 'Order Placed',
        color: 'text-warning',
        icon: <FileText />,
        description: 'Your order has been received and is being processed.',
      },
      confirmed: {
        label: 'Order Confirmed',
        color: 'text-info',
        icon: <CheckCircle />,
        description: 'Your order has been confirmed and payment verified.',
      },
      processing: {
        label: 'Processing',
        color: 'text-primary',
        icon: <Settings />,
        description: 'Your order is being prepared for shipment.',
      },
      shipped: {
        label: 'Shipped',
        color: 'text-accent',
        icon: <Truck />,
        description: 'Your order has been shipped and is on its way.',
      },
      out_for_delivery: {
        label: 'Out for Delivery',
        color: 'text-secondary',
        icon: <Home />,
        description: 'Your order is out for delivery and will arrive soon.',
      },
      delivered: {
        label: 'Delivered',
        color: 'text-success',
        icon: <Package />,
        description: 'Your order has been successfully delivered.',
      },
      cancelled: {
        label: 'Cancelled',
        color: 'text-error',
        icon: <XCircle />,
        description: 'Your order has been cancelled.',
      },
      returned: {
        label: 'Returned',
        color: 'text-neutral',
        icon: <RotateCcw />,
        description: 'Your order has been returned.',
      },
    };
    
    return statusMap[status] || {
      label: status,
      color: 'text-neutral',
      icon: <HelpCircle />,
      description: 'Status information not available.',
    };
  };

  const calculateProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      pending: 10,
      confirmed: 25,
      processing: 40,
      shipped: 65,
      out_for_delivery: 85,
      delivered: 100,
      cancelled: 0,
      returned: 0,
    };
    return progressMap[status] || 0;
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-error max-w-md">
          <span>{error}</span>
          <button onClick={loadOrder} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-warning max-w-md">
          <span>Order not found</span>
          <Link href="/order-history" className="btn btn-sm btn-primary">
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const progress = calculateProgress(order.status);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-base-content/70">
            Order #{order._id.slice(-8)} • Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{statusInfo.icon}</div>
                <div>
                  <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </h2>
                  <p className="text-sm text-base-content/70">
                    {statusInfo.description}
                  </p>
                </div>
              </div>
              {order.tracking?.url && (
                <a
                  href={order.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Track Package
                </a>
              )}
            </div>

            <div className="w-full bg-base-300 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-base-content/60 mt-2">
              <span>Order Placed</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>

            {order.tracking?.estimatedDelivery && (
              <div className="mt-4 p-3 bg-info/10 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Estimated Delivery:</span>{' '}
                  {formatDate(order.tracking.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit mx-auto">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            className={`tab ${activeTab === 'items' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items ({order.items.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Items ({order.items.length}):</span>
                    <span>{formatPrice(order.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Status:</span>
                    <div className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Method:</span>
                    <span className="text-sm font-medium capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Shipping Address</h3>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm">{order.shippingAddress.address}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                </div>

                {order.tracking && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Tracking Information</h4>
                    {order.tracking.number && (
                      <p className="text-sm">
                        <span className="text-base-content/70">Tracking #:</span>{' '}
                        <span className="font-mono">{order.tracking.number}</span>
                      </p>
                    )}
                    {order.tracking.carrier && (
                      <p className="text-sm">
                        <span className="text-base-content/70">Carrier:</span>{' '}
                        <span className="font-medium">{order.tracking.carrier}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Order Timeline</h3>
              {order.timeline && order.timeline.length > 0 ? (
                <div className="space-y-6">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-primary' : 'bg-base-300'
                        }`}></div>
                        {index < order.timeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-base-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-base-content/60 capitalize">
                              {event.status.replace('_', ' ')}
                              {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                          <span className="text-xs text-base-content/50 whitespace-nowrap ml-4">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base-content/60 text-center py-8">
                  No timeline events available
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-20 h-20 rounded">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-sm text-base-content/60">SKU: {item.slug}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="badge badge-outline">Qty: {item.qty}</span>
                        <span className="font-semibold">{formatPrice(item.price)} each</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">
                        {formatPrice(item.price * item.qty)}
                      </p>
                      <Link
                        href={`/product/${item.slug}`}
                        className="btn btn-outline btn-xs mt-2"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex flex-wrap gap-4 justify-center">
              {order.isDelivered && (
                <button
                  onClick={handleReorder}
                  disabled={isReordering}
                  className="btn btn-primary"
                >
                  {isReordering ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Reorder Items'
                  )}
                </button>
              )}
              
              <Link href="/order-history" className="btn btn-outline">
                View All Orders
              </Link>
              
              <button className="btn btn-ghost">
                Download Invoice
              </button>
              
              <OrderCancelButton
                orderId={order._id}
                orderStatus={order.status}
                onCancelSuccess={() => {
                  // Refresh the page to update order status
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}