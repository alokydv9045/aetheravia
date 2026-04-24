'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

import { Order } from '@/lib/models/OrderModel';
import { formatPrice } from '@/lib/utils';
import ReorderButton from '@/components/order/ReorderButton';

const STATUS_CONFIG = {
  delivered: { label: 'Completed Ritual', color: 'bg-primary text-on-primary', icon: 'auto_fix_high' },
  shipped: { label: 'In Transit', color: 'bg-secondary text-white', icon: 'local_shipping' },
  processing: { label: 'Preparing Record', color: 'bg-surface-container-high text-secondary', icon: 'history_edu' },
  cancelled: { label: 'Manifest Voided', color: 'bg-error text-on-error', icon: 'block' },
  pending: { label: 'Awaiting Action', color: 'bg-outline text-white', icon: 'pending' },
};

const MyOrders = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { data: orders, error, isLoading } = useSWR(mounted ? `/api/orders/mine` : null);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated' || (!session && status !== 'loading')) {
      router.push('/signin?callbackUrl=/order-history');
    }
  }, [status, session, router]);

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-surface">
        <div className="animate-pulse font-headline italic text-2xl text-primary">Recalling archive logs...</div>
      </div>
    );
  }

  if (error) return (
    <div className="text-center py-24">
      <h2 className="font-headline text-3xl text-error italic mb-4">Archive Link Broken</h2>
      <p className="text-secondary font-body">Unable to establish connection with the central manifest.</p>
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-32 bg-surface-container-low rounded-lg border border-outline-variant/10">
        <span className="material-symbols-outlined text-primary/20 text-6xl mb-6">history_edu</span>
        <h2 className="font-headline text-4xl text-secondary italic mb-4">Empty Archives</h2>
        <p className="text-secondary font-body opacity-60 mb-12">No ritual records have been established for this identity.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/10">
          Begin a Ritual
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {orders.map((order: Order, index: number) => {
            const statusKey = (order.status || 'pending') as keyof typeof STATUS_CONFIG;
            const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-surface-container-low rounded-lg border border-outline-variant/10 shadow-lg hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 flex items-start gap-4">
                   <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
                     <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
                     {config.label}
                   </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="space-y-2 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Manifest Record</p>
                    <h3 className="font-headline text-3xl text-on-surface italic">
                      #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-secondary font-body text-sm opacity-60">
                      Established on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Collective Value</p>
                    <p className="font-headline text-2xl text-primary">{formatPrice(order.totalPrice)}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 md:pt-0">
                    <Link 
                      href={`/order/${order._id}`}
                      className="bg-surface-container-high text-on-surface px-8 py-4 rounded font-bold tracking-widest uppercase text-[9px] border border-outline-variant/20 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      Examine Manifest
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                    <ReorderButton
                      orderId={order._id}
                      orderStatus={order.status}
                      onSuccess={() => toast.success('Rituals re-added to your bag')}
                    />
                  </div>
                </div>

                <div className="px-8 pb-8 md:px-12 md:pb-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-outline-variant/10 pt-8 opacity-60">
                   <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">Items</p>
                     <p className="text-sm font-label font-bold">{order.items.length} Essence{order.items.length > 1 ? 's' : ''}</p>
                   </div>
                   <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">Exchange</p>
                     <p className="text-sm font-label font-bold">{order.paymentMethod}</p>
                   </div>
                   <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">Settlement</p>
                     <p className="text-sm font-label font-bold flex items-center gap-1">
                       {order.isPaid ? 'Verified' : 'Pending'}
                     </p>
                   </div>
                   <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">Logistics</p>
                     <p className="text-sm font-label font-bold">{order.isDelivered ? 'Fulfilled' : 'In Transit'}</p>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyOrders;
