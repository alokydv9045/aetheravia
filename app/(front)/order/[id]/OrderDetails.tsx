'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { formatDistanceToNow, format } from 'date-fns';

import OrderCancelButton from '@/components/order/OrderCancelButton';
import OrderTimeline from '@/components/order/OrderTimeline';
import ReorderButton from '@/components/order/ReorderButton';
import { Order, OrderItem } from '@/lib/models/OrderModel';
import { formatPrice } from '@/lib/utils';

interface IOrderDetails {
  orderId: string;
  razorpayKeyId: string;
}

const OrderDetails = ({ orderId, razorpayKeyId }: IOrderDetails) => {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tracking' | 'details' | 'timeline'>('tracking');
  const [showAllItems, setShowAllItems] = useState(false);

  // Authentication check
  useEffect(() => {
    if (authStatus === 'loading') return; // Still loading
    
    if (authStatus === 'unauthenticated' || !session) {
      toast.error('Please sign in to view your order');
      router.push(`/signin?callbackUrl=/order/${orderId}`);
      return;
    }
  }, [authStatus, session, router, orderId]);

  const handleReorderSuccess = () => {
    toast.success('Items added to cart successfully!');
  };

  const { trigger: deliverOrder, isMutating: isDelivering } = useSWRMutation(
    `/api/orders/${orderId}`,
    async (url) => {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      res.ok
        ? toast.success('Order delivered successfully')
        : toast.error(data.message);
    },
  );

  // Load Razorpay script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  function createRazorpayOrder() {
    return fetch(`/api/orders/${orderId}/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json());
  }

  function handleRazorpayPayment() {
    createRazorpayOrder()
      .then((razorpayOrder) => {
        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'BELLA MODA',
          description: `Order #${orderId}`,
          order_id: razorpayOrder.id,
          handler: function (response: any) {
            verifyRazorpayPayment(response);
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#3399cc',
          },
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      })
      .catch((error) => {
        toast.error('Failed to create payment order');
        console.error(error);
      });
  }

  function verifyRazorpayPayment(response: any) {
    fetch(`/api/orders/${orderId}/verify-razorpay-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isPaid) {
          toast.success('Payment successful!');
          window.location.reload();
        } else {
          toast.error('Payment verification failed');
        }
      })
      .catch((error) => {
        toast.error('Payment verification failed');
        console.error(error);
      });
  }

  const { data, error } = useSWR(`/api/orders/${orderId}`);

  // Show loading while checking authentication
  if (authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (authStatus === 'unauthenticated' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Redirecting to sign in...</span>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
        <Link href="/order-history" className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-all">
          View Order History
        </Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-lg">Loading your order details...</p>
      </div>
    </div>
  );

  const {
    paymentMethod,
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isDelivered,
    deliveredAt,
    isPaid,
    paidAt,
    createdAt,
    status = 'pending',
    timeline = [],
    progress = { percentage: 0, currentPhase: 'pending' },
    statusInfo = { label: 'Processing', description: 'Order is being processed', color: 'primary', icon: '📋' },
    tracking = {},
  } = data;

  // Enhanced status mapping
  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { 
        label: 'Order Placed', 
        description: 'Your order has been received and is being processed',
        color: 'bg-blue-500', 
        icon: '📋',
        progress: 10
      },
      confirmed: { 
        label: 'Confirmed', 
        description: 'Your order has been confirmed and payment verified',
        color: 'bg-green-500', 
        icon: '✅',
        progress: 25
      },
      processing: { 
        label: 'Processing', 
        description: 'Your items are being prepared for shipment',
        color: 'bg-green-600', 
        icon: '📦',
        progress: 50
      },
      shipped: { 
        label: 'Shipped', 
        description: 'Your order is on its way!',
        color: 'bg-blue-600', 
        icon: '🚚',
        progress: 75
      },
      out_for_delivery: { 
        label: 'Out for Delivery', 
        description: 'Your package is out for delivery',
        color: 'bg-purple-500', 
        icon: '🚛',
        progress: 90
      },
      delivered: { 
        label: 'Delivered', 
        description: 'Your order has been successfully delivered',
        color: 'bg-green-600', 
        icon: '🎉',
        progress: 100
      },
      cancelled: { 
        label: 'Cancelled', 
        description: 'This order has been cancelled',
        color: 'bg-red-500', 
        icon: '❌',
        progress: 0
      },
      returned: { 
        label: 'Returned', 
        description: 'This order has been returned',
        color: 'bg-orange-500', 
        icon: '↩️',
        progress: 0
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const currentStatusInfo = getStatusInfo(status);
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Order #{orderId.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {format(new Date(createdAt), 'MMMM dd, yyyy')} • 
              <span className="ml-1">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <ReorderButton
              orderId={orderId}
              orderStatus={status}
              size="md"
              variant="secondary"
              onSuccess={handleReorderSuccess}
            />
            <OrderCancelButton
              orderId={orderId}
              orderStatus={status}
              onCancelSuccess={() => {
                // Refresh the page to show updated order status
                window.location.reload();
              }}
            />
            {tracking?.number && (
              <a 
                href={tracking.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <span className="hidden sm:inline">Track Package</span>
                <span className="sm:hidden">Track</span>
                🔗
              </a>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full ${currentStatusInfo.color} flex items-center justify-center text-white text-xl`}>
              {currentStatusInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentStatusInfo.label}</h3>
              <p className="text-gray-600 text-sm">{currentStatusInfo.description}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${currentStatusInfo.color} h-2 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${currentStatusInfo.progress}%` }}
            ></div>
          </div>
          
          {status !== 'delivered' && status !== 'cancelled' && (
            <p className="text-sm text-gray-500 mt-2">
              Estimated delivery: {format(estimatedDelivery, 'EEEE, MMMM dd')}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'tracking', name: 'Tracking', icon: '📍' },
              { id: 'details', name: 'Order Details', icon: '📄' },
              { id: 'timeline', name: 'Timeline', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <OrderTimeline
                orderId={orderId}
                timeline={timeline}
                currentStatus={status}
                progress={progress}
                statusInfo={currentStatusInfo}
                trackingInfo={tracking}
                enableRealTime={true}
              />
              
              {/* Shipping Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📍</span>
                    Delivery Address
                  </h4>
                  <div className="text-gray-700">
                    <p className="font-medium">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.country}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💳</span>
                    Payment Information
                  </h4>
                  <div className="text-gray-700">
                    <p>Method: <span className="font-medium">{paymentMethod}</span></p>
                    <p>Status: 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isPaid ? 'bg-green-100 text-green-800' : 'bg-green-50 text-green-700'
                      }`}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                    {paidAt && <p className="text-sm text-gray-500">Paid on {format(new Date(paidAt), 'MMM dd, yyyy')}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Items List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items ({items.length})</h3>
                <div className="space-y-4">
                  {(showAllItems ? items : items.slice(0, 3)).map((item: OrderItem, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="relative w-16 h-16 bg-white rounded-lg border overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                        {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-500">each</p>
                      </div>
                    </div>
                  ))}
                  
                  {items.length > 3 && !showAllItems && (
                    <button
                      onClick={() => setShowAllItems(true)}
                      className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Show {items.length - 3} more items
                    </button>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">{formatPrice(shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatPrice(taxPrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {!isPaid && paymentMethod === 'Razorpay' && (
                    <button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                      onClick={handleRazorpayPayment}
                    >
                      Complete Payment
                    </button>
                  )}
                  
                  {session?.user.isAdmin && !isDelivered && (
                    <button
                      className="w-full btn btn-outline"
                      onClick={() => deliverOrder()}
                      disabled={isDelivering}
                    >
                      {isDelivering && <span className="loading loading-spinner loading-sm mr-2"></span>}
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Timeline</h3>
              <OrderTimeline
                orderId={orderId}
                timeline={timeline}
                currentStatus={status}
                progress={progress}
                statusInfo={currentStatusInfo}
                trackingInfo={tracking}
                enableRealTime={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📞</div>
            <h4 className="font-medium text-gray-900">Customer Support</h4>
            <p className="text-sm text-gray-600">Get help with your order</p>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Contact Us</button>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-medium text-gray-900">Returns</h4>
            <p className="text-sm text-gray-600">Start a return or exchange</p>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Return Items</button>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">❓</div>
            <h4 className="font-medium text-gray-900">FAQ</h4>
            <p className="text-sm text-gray-600">Find answers to common questions</p>
            <Link href="/help" className="mt-2 text-sm text-blue-600 hover:text-blue-700 block">View FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
