'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import OrderStatusManager3PL from '@/components/admin/OrderStatusManager3PL';

interface OrderDetails {
  _id: string;
  user?: { name: string; email: string };
  items: Array<{
    name: string;
    qty: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  status: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    location?: string;
  }>;
  createdAt: string;
}

interface OrderDetailPageProps {
  orderId: string;
}

export default function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setOrder({ ...order, status: newStatus });
      // Reload order to get latest data
      setTimeout(loadOrder, 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button className="btn btn-sm" onClick={loadOrder}>
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-warning">
        <span>Order not found</span>
      </div>
    );
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-base-content/70">Order ID: {order._id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-base-content/70">Created</p>
          <p className="font-medium">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping Info */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Customer & Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-base-content/70">Customer</h3>
                  <p className="font-medium">{order.user?.name || 'Guest'}</p>
                  <p className="text-sm text-base-content/60">{order.user?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-base-content/70">Shipping Address</h3>
                  <div className="text-sm">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-base-content/60">
                        Quantity: {item.qty} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="divider"></div>
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
              
              <div className="text-sm text-base-content/60">
                Payment Method: {order.paymentMethod}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Order Timeline</h2>
              <div className="space-y-3">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
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
            </div>
          </div>
        </div>

        {/* Right Column - Status Management */}
        <div className="space-y-6">
          <OrderStatusManager3PL 
            orderId={order._id}
            currentStatus={order.status}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </div>
    </div>
  );
}