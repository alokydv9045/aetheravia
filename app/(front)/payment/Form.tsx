'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import useCartService from '@/lib/hooks/useCartStore';

const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: '💵',
  },
  {
    id: 'razorpay_upi',
    name: 'UPI Payment',
    description: 'Pay instantly using UPI apps like Google Pay, PhonePe, Paytm',
    icon: '📱',
  },
  {
    id: 'razorpay_card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your credit or debit card',
    icon: '💳',
  },
  {
    id: 'razorpay_netbanking',
    name: 'Net Banking',
    description: 'Pay directly from your bank account',
    icon: '🏦',
  },
  {
    id: 'razorpay_wallet',
    name: 'Wallet',
    description: 'Pay using digital wallets like Paytm, Mobikwik',
    icon: '👛',
  },
];

const Form = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const { savePaymentMethod, paymentMethod, shippingAddress } =
    useCartService();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      toast.error('Please sign in to continue checkout');
      router.push('/signin?callbackUrl=/payment');
      return;
    }
  }, [status, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    savePaymentMethod(selectedPaymentMethod);
    router.push('/place-order');
  };

  useEffect(() => {
    if (!shippingAddress) {
      return router.push('/shipping');
    }
    // Set default payment method to COD for better UX
    setSelectedPaymentMethod(paymentMethod || 'cod');
  }, [paymentMethod, router, shippingAddress]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">Verifying authentication...</span>
      </div>
    );
  }

  // If not authenticated, this will be handled by the useEffect
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">Redirecting to sign in...</span>
      </div>
    );
  }

  return (
    <div>
      <CheckoutSteps current={2} />
      <div className='card mx-auto my-4 max-w-2xl bg-base-300'>
        <div className='card-body'>
          <h1 className='card-title text-2xl mb-6'>Choose Payment Method</h1>
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {PAYMENT_METHODS.map((method) => (
                <div key={method.id} className='form-control'>
                  <label className='label cursor-pointer justify-start gap-4 p-4 border-2 border-base-content/10 rounded-lg hover:border-primary/50 transition-colors'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className='radio radio-primary'
                    />
                    <div className='flex items-center gap-3 flex-1'>
                      <span className='text-2xl'>{method.icon}</span>
                      <div className='flex-1'>
                        <div className='font-semibold text-lg'>{method.name}</div>
                        <div className='text-sm text-base-content/70'>{method.description}</div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {selectedPaymentMethod === 'cod' && (
              <div className='alert alert-info mt-4'>
                <span className='text-sm'>
                  💡 Cash on Delivery charges may apply. You can pay in cash when your order arrives.
                </span>
              </div>
            )}

            {selectedPaymentMethod.startsWith('razorpay') && (
              <div className='alert alert-success mt-4'>
                <span className='text-sm'>
                  🔒 Your payment is secured by Razorpay with 256-bit SSL encryption.
                </span>
              </div>
            )}

            <div className='flex gap-4 mt-8'>
              <button
                type='button'
                className='btn btn-outline flex-1'
                onClick={() => router.back()}
              >
                Back
              </button>
              <button 
                type='submit' 
                className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg flex-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!selectedPaymentMethod}
              >
                Continue to Review Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Form;
