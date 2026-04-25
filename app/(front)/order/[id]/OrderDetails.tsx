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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (authStatus === 'loading') return;
    if (authStatus === 'unauthenticated' || !session) {
      toast.error('Please sign in to view your ritual details');
      router.push(`/signin?callbackUrl=/order/${orderId}`);
    }
  }, [authStatus, session, router, orderId]);

  const { trigger: deliverOrder, isMutating: isDelivering } = useSWRMutation(
    `/api/orders/${orderId}`,
    async () => {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: 'PUT',
      });
      const data = await res.json();
      res.ok ? toast.success('Order delivered successfully') : toast.error(data.message);
    },
  );

  const { data, error, mutate } = useSWR(`/api/orders/${orderId}`);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleRazorpayPayment = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/create-razorpay-order`, { method: 'POST' });
      const razorpayOrder = await res.json();
      
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'AETHERAVIA',
        description: `Order Manifest #${orderId.slice(-6)}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          const verifyRes = await fetch(`/api/orders/${orderId}/verify-razorpay-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await verifyRes.json();
          if (data.isPaid) {
            toast.success('Payment complete');
            mutate();
          } else {
            toast.error('Verification failure');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: { color: '#725a39' },
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate exchange');
    }
  };

  if (!mounted || authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="animate-pulse font-headline italic text-2xl text-primary">Recalling ritual manifest...</div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <h2 className="font-headline text-5xl text-primary italic mb-6">Manifest Lost</h2>
        <p className="text-secondary font-body mb-12 opacity-80 leading-relaxed">
          The record you seek has vanished from our archives or remains obscured by privilege.
        </p>
        <Link href="/order-history" className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-2xl shadow-primary/20">
          Return to Archives
        </Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="animate-pulse font-headline italic text-2xl text-primary">Sourcing record data...</div>
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
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    createdAt,
    status = 'pending',
    timeline = [],
    progress = { percentage: 0 },
    statusInfo = { label: 'Processing', description: 'Order is being processed', icon: '📋' },
    tracking = {},
  } = data;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        {/* Header Record */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-lg border border-outline-variant/10 shadow-xl overflow-hidden mb-12"
        >
          <div className="p-8 md:p-12 border-b border-outline-variant/10 bg-primary/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">Formal Record</p>
              <h1 className="font-headline text-4xl md:text-5xl text-on-surface italic">
                Manifest #{orderId.slice(-8).toUpperCase()}
              </h1>
              <p className="text-secondary font-body text-sm mt-4 opacity-70">
                Recorded on {format(new Date(createdAt), 'MMMM dd, yyyy')} • 
                <span className="italic ml-2">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <ReorderButton
                orderId={orderId}
                orderStatus={status}
                onSuccess={() => toast.success('Products added to your bag')}
              />
              <OrderCancelButton
                orderId={orderId}
                orderStatus={status}
                onCancelSuccess={() => mutate()}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl">
                <span className="material-symbols-outlined text-4xl">{statusInfo.icon || 'history_edu'}</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl text-on-surface italic">{statusInfo.label}</h3>
                <p className="text-secondary font-body text-sm opacity-70">{statusInfo.description}</p>
              </div>
            </div>
            
            <div className="relative h-1 bg-outline-variant/20 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                className="absolute inset-0 bg-primary"
               />
            </div>
          </div>
        </motion.div>

        {/* Navigation Manifest */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-outline-variant/20 pb-4">
              {[
                { id: 'tracking', label: 'Order Status', icon: 'location_on' },
                { id: 'details', label: 'Order Items', icon: 'inventory_2' },
                { id: 'timeline', label: 'Historical Log', icon: 'history' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'text-primary' : 'text-secondary opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'tracking' && (
                <motion.div 
                  key="tracking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <OrderTimeline
                    orderId={orderId}
                    timeline={timeline}
                    currentStatus={status}
                    progress={progress}
                    statusInfo={statusInfo}
                    trackingInfo={tracking}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-surface-container-low p-8 rounded border border-outline-variant/10 shadow-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mb-4">Destination</p>
                      <div className="font-body text-on-surface text-sm leading-relaxed">
                        <p className="font-label font-bold text-lg mb-2">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-8 rounded border border-outline-variant/10 shadow-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mb-4">Exchange Conduit</p>
                      <div className="font-body text-on-surface text-sm leading-relaxed">
                        <p className="font-label font-bold text-lg mb-2">{paymentMethod}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-primary' : 'bg-secondary/30'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{isPaid ? 'Acquisition Verified' : 'Exchange Pending'}</span>
                        </div>
                        {paidAt && <p className="text-[10px] text-secondary opacity-60 mt-2 uppercase tracking-widest">Confirmed {format(new Date(paidAt), 'MMM dd, yyyy')}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-surface-container-low rounded border border-outline-variant/10 shadow-lg overflow-hidden"
                >
                  <div className="divide-y divide-outline-variant/10">
                    {items.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="p-8 flex items-center gap-8">
                        <div className="relative w-24 aspect-square bg-surface rounded overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover grayscale-[20%]" sizes="96px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-headline text-2xl text-on-surface italic truncate">{item.name}</h4>
                          <p className="text-[11px] text-secondary font-bold uppercase tracking-widest mt-1">
                            {item.qty} Product{item.qty > 1 ? 's' : ''} • {item.color && `${item.color} • `}{item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline text-xl text-primary">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div 
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <OrderTimeline
                    orderId={orderId}
                    timeline={timeline}
                    currentStatus={status}
                    progress={progress}
                    statusInfo={statusInfo}
                    trackingInfo={tracking}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Value Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl border border-outline-variant/10 sticky top-32">
              <h3 className="font-headline text-2xl text-secondary border-b border-outline-variant/20 pb-4 mb-6 italic">Record Summary</h3>
              <ul className="space-y-4 font-body text-sm">
                <li className="flex justify-between text-secondary">
                  <span>Items Price</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </li>
                <li className="flex justify-between text-secondary">
                  <span>Logistics</span>
                  <span>{formatPrice(shippingPrice)}</span>
                </li>
                <li className="flex justify-between text-secondary">
                  <span>Treasury</span>
                  <span>{formatPrice(taxPrice)}</span>
                </li>
                <li className="border-t border-outline-variant/20 pt-6 mt-6">
                  <div className="flex justify-between items-baseline">
                    <span className="font-headline text-xl text-secondary italic">Final Exchange</span>
                    <span className="font-headline text-3xl text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </li>
              </ul>

              <div className="mt-12 space-y-4">
                {!isPaid && paymentMethod?.toLowerCase().includes('razorpay') && (
                  <button
                    onClick={handleRazorpayPayment}
                    className="w-full bg-primary text-on-primary py-6 rounded-lg font-bold tracking-[0.3em] uppercase text-xs hover:bg-primary-container transition-all shadow-xl shadow-primary/20 flex justify-center items-center gap-3"
                  >
                    Complete Exchange
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </button>
                )}
                
                {session?.user.isAdmin && !isDelivered && (
                  <button
                    onClick={() => deliverOrder()}
                    disabled={isDelivering}
                    className="w-full bg-secondary text-white py-6 rounded-lg font-bold tracking-[0.3em] uppercase text-xs hover:bg-on-surface transition-all disabled:opacity-50 flex justify-center items-center gap-3"
                  >
                    {isDelivering ? 'Recording...' : 'Mark as Delivered'}
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 bg-surface-container-low rounded border border-outline-variant/10 text-center">
              <span className="material-symbols-outlined text-primary text-3xl mb-4">help_center</span>
              <h4 className="font-headline text-xl italic text-on-surface mb-2">Seek Guidance?</h4>
              <p className="text-xs text-secondary font-body mb-6 opacity-70">If this record holds anomalies, our curators are available for discourse.</p>
              <Link href="/contact" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Connect with Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
