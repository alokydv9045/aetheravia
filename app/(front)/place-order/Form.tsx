'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CouponSection from '@/components/checkout/CouponSection';
import PaymentErrorHandler from '@/components/PaymentErrorHandler';
import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery (COD)',
  razorpay_upi: 'Instant UPI',
  razorpay_card: 'Credit / Debit Card',
  razorpay_netbanking: 'Net Banking',
  razorpay_wallet: 'Digital Wallet',
};

const Form = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    paymentMethod,
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getFinalTotal,
    clear,
  } = useCartService();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/place-order');
    }
  }, [status, router]);

  const isCashOnDelivery = paymentMethod === 'cod';
  const isRazorpayPayment = paymentMethod?.startsWith('razorpay');

  const handleRazorpayPayment = async (orderId: string) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment system not initialized. Please refresh.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderResponse = await fetch('/api/orders/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: getFinalTotal(),
          orderId,
          paymentMethod 
        }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create secure payment order');

      const { razorpayOrder, razorpayKeyId } = await orderResponse.json();

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: 'AETHERAVIA',
        description: `Order #${orderId.slice(-6)}`,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/orders/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              clear();
              toast.success('Order Placed Successfully');
              router.push(`/order/${orderId}`);
            } else {
              toast.error('Signature validation failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.error('Exchange cancelled');
          },
        },
        theme: { color: '#725a39' },
        prefill: {
          name: shippingAddress.fullName,
          email: session?.user?.email || '',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setIsProcessingPayment(false);
      setPaymentError(error);
      toast.error(error.message || 'Payment processing error');
    }
  };

  const { trigger: placeOrder, isMutating: isPlacing } = useSWRMutation(
    `/api/orders/mine`,
    async () => {
      const finalAmount = getFinalTotal();
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress,
          items,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice: finalAmount,
          coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            name: appliedCoupon.name,
            type: appliedCoupon.type,
            discountAmount: appliedCoupon.discountAmount,
            originalOrderValue: totalPrice,
          } : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const orderId = data.order._id;
        if (isCashOnDelivery) {
          clear();
          toast.success('Manifest Recorded. Payment due upon arrival.');
          return router.push(`/order/${orderId}`);
        } else if (isRazorpayPayment) {
          await handleRazorpayPayment(orderId);
        }
      } else {
        toast.error(data.message);
      }
    },
  );

  useEffect(() => {
    if (mounted && !paymentMethod) router.push('/payment');
    if (mounted && items.length === 0) router.push('/cart');
    
    if (isRazorpayPayment && typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [paymentMethod, router, isRazorpayPayment, items.length, mounted]);

  if (!mounted || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface text-primary font-headline italic text-2xl">
        Preparing your order...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <CheckoutSteps current={3} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          {/* Main Review Manifest */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container-low rounded-lg border border-outline-variant/10 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 bg-primary/[0.02] flex justify-between items-center">
                <h2 className="font-headline text-2xl text-secondary italic">Shipping Address</h2>
                <Link href="/shipping" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Revise</Link>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mb-2">Receiver</p>
                  <p className="font-label text-on-surface font-bold text-lg">{shippingAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mb-2">Destination</p>
                  <p className="font-body text-on-surface text-sm leading-relaxed">
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.postalCode}<br />
                    {shippingAddress.country}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-container-low rounded-lg border border-outline-variant/10 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 bg-primary/[0.02] flex justify-between items-center">
                <h2 className="font-headline text-2xl text-secondary italic">Payment Method</h2>
                <Link href="/payment" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Modify</Link>
              </div>
              <div className="p-8 flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{isCashOnDelivery ? 'payments' : 'verified_user'}</span>
                </div>
                <div>
                  <p className="font-label text-on-surface font-bold text-lg">
                    {PAYMENT_METHOD_LABELS[paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || paymentMethod}
                  </p>
                  <p className="text-xs text-secondary font-body mt-1 italic">
                    {isCashOnDelivery ? 'Pay with cash upon delivery.' : 'Secured via encrypted payment gateway.'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-container-low rounded-lg border border-outline-variant/10 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 bg-primary/[0.02] flex justify-between items-center">
                <h2 className="font-headline text-2xl text-secondary italic">Order Items</h2>
                <Link href="/cart" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Adjust Bag</Link>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {items.map((item) => (
                  <div key={item.slug} className="p-8 flex items-center gap-8">
                    <div className="relative w-20 aspect-square bg-surface rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover grayscale-[20%]"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-xl text-on-surface truncate">{item.name}</h4>
                      <p className="text-[11px] text-secondary font-bold uppercase tracking-widest mt-1">
                        {item.qty} Unit{item.qty > 1 ? 's' : ''} • {item.color && `${item.color} • `}{item.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-lg text-primary">{formatPrice(item.price * item.qty)}</p>
                      <p className="text-[10px] text-secondary opacity-60 italic">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32 space-y-8"
            >
              <CouponSection
                orderValue={totalPrice}
                shippingCost={shippingPrice}
                onCouponApplied={applyCoupon}
                onCouponRemoved={removeCoupon}
                appliedCoupon={appliedCoupon}
              />

              <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl border border-outline-variant/10">
                <h3 className="font-headline text-2xl text-secondary border-b border-outline-variant/20 pb-4 mb-6 italic">Order Summary</h3>
                
                <ul className="space-y-4 font-body text-sm">
                  <li className="flex justify-between text-secondary">
                    <span>Collective Value</span>
                    <span>{formatPrice(itemsPrice)}</span>
                  </li>
                  <li className="flex justify-between text-secondary">
                    <span>Logistics Contribution</span>
                    <span>{formatPrice(shippingPrice)}</span>
                  </li>
                  <li className="flex justify-between text-secondary">
                    <span>Tax Estimate</span>
                    <span>{formatPrice(taxPrice)}</span>
                  </li>

                  {appliedCoupon && (
                    <li className="flex justify-between text-primary font-bold bg-primary/5 p-3 rounded -mx-3">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                    </li>
                  )}

                  <li className="border-t border-outline-variant/20 pt-6 mt-6">
                    <div className="flex justify-between items-baseline">
                      <span className="font-headline text-xl text-secondary italic">Total Amount</span>
                      <span className="font-headline text-3xl text-primary">{formatPrice(getFinalTotal())}</span>
                    </div>
                  </li>
                </ul>

                <AnimatePresence>
                  {paymentError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                      <PaymentErrorHandler 
                        error={paymentError} 
                        onRetry={() => setPaymentError(null)}
                        onDismiss={() => setPaymentError(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => placeOrder()}
                  disabled={isPlacing || isProcessingPayment}
                  className="w-full bg-primary text-on-primary py-6 rounded-lg font-bold tracking-[0.3em] uppercase text-xs hover:bg-primary-container transition-all shadow-xl shadow-primary/20 mt-8 disabled:opacity-50 flex justify-center items-center gap-3"
                >
                  {(isPlacing || isProcessingPayment) ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {isCashOnDelivery ? 'Confirm Order' : 'Pay Now'}
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-secondary/40 mt-6 uppercase tracking-widest font-bold">
                  Manifest recorded under encrypted protocol 7.2
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
