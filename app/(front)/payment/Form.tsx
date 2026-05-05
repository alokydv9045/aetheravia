'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import useCartService from '@/lib/hooks/useCartStore';

const PAYMENT_METHODS = [
  {
    id: 'razorpay_upi',
    name: 'Instant UPI',
    description: 'Direct ritual acquisition via Google Pay, PhonePe, or Paytm',
    icon: 'account_balance',
    tag: 'Recommended'
  },
  {
    id: 'razorpay_card',
    name: 'Heritage Card',
    description: 'Secure transaction via Credit or Debit credentials',
    icon: 'credit_card',
  },
  {
    id: 'razorpay_netbanking',
    name: 'Bank Transfer',
    description: 'Traditional acquisition through direct banking portals',
    icon: 'account_balance_wallet',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    description: 'Pay with cash upon delivery of your order',
    icon: 'payments',
    tag: 'Convenience Fee'
  },
];

const Form = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedMethod, setSelectedMethod] = useState('');

  const { savePaymentMethod, paymentMethod, shippingAddress } = useCartService();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      toast.error('Please sign in to continue checkout');
      router.push('/signin?callbackUrl=/payment');
    }
  }, [status, router]);

  useEffect(() => {
    if (!shippingAddress.address) {
      router.push('/shipping');
    }
    setSelectedMethod(paymentMethod || 'razorpay_upi');
  }, [paymentMethod, router, shippingAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      toast.error('Please select a method of exchange');
      return;
    }
    savePaymentMethod(selectedMethod);
    router.push('/place-order');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="animate-pulse font-headline italic text-2xl text-primary">Loading payment options...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <CheckoutSteps current={2} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-8 md:p-12 rounded-lg border border-outline-variant/10 shadow-2xl shadow-primary/5"
        >
          <div className="mb-12 text-center md:text-left">
            <h1 className="font-headline text-4xl text-primary italic mb-4">Payment Method</h1>
            <p className="text-secondary font-body tracking-wide opacity-70">How would you like to pay for your order?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <label 
                  key={method.id}
                  className={`relative flex items-center p-6 rounded-lg border cursor-pointer transition-all duration-500 group ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20' 
                      : 'border-outline-variant/20 bg-surface hover:border-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="sr-only"
                  />
                  
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    selectedMethod === method.id ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'
                  }`}>
                    <span className="material-symbols-outlined">{method.icon}</span>
                  </div>

                  <div className="ml-6 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-xl text-on-surface">{method.name}</span>
                      {method.tag && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {method.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary font-body mt-1 opacity-70">{method.description}</p>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    selectedMethod === method.id ? 'border-primary' : 'border-outline-variant/30'
                  }`}>
                    <AnimatePresence>
                      {selectedMethod === method.id && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-3 h-3 rounded-full bg-primary"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-12 p-6 bg-surface-container-high/30 rounded border border-outline-variant/10 flex items-start gap-4">
               <span className="material-symbols-outlined text-primary">verified_user</span>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Secured Transaction</p>
                 <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                   Your acquisition is protected by military-grade encryption via the Razorpay gateway. 
                   AetherAvia does not archive your sensitive financial credentials.
                 </p>
               </div>
            </div>

            <div className="pt-12 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="text-[10px] font-label text-secondary hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Shipping
              </button>
              
              <button 
                type="submit"
                className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/10 flex items-center gap-3"
              >
                Review Order
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Form;

