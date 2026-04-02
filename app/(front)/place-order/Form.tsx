'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CouponSection from '@/components/checkout/CouponSection';
import PaymentErrorHandler from '@/components/PaymentErrorHandler';
import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  razorpay_upi: 'UPI Payment',
  razorpay_card: 'Credit/Debit Card',
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

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      toast.error('Please sign in to place your order');
      router.push('/signin?callbackUrl=/place-order');
      return;
    }
  }, [status, router]);

  const isCashOnDelivery = paymentMethod === 'cod';
  const isRazorpayPayment = paymentMethod?.startsWith('razorpay');

  // Function to handle Razorpay payment
  const handleRazorpayPayment = async (orderId: string) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/orders/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: totalPrice,
          orderId,
          paymentMethod 
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ message: 'Unknown error' }));
        const error: any = new Error(errorData.message || 'Failed to create payment order');
        error.status = orderResponse.status;
        throw error;
      }

      const { razorpayOrder, razorpayKeyId } = await orderResponse.json();

      // Determine payment methods based on selection
      const paymentMethods = {
        upi: paymentMethod === 'razorpay_upi',
        card: paymentMethod === 'razorpay_card',
        netbanking: paymentMethod === 'razorpay_netbanking',
        wallet: paymentMethod === 'razorpay_wallet',
      };

      // If no specific method selected, enable all
      if (!Object.values(paymentMethods).some(Boolean)) {
        Object.keys(paymentMethods).forEach(key => {
          paymentMethods[key as keyof typeof paymentMethods] = true;
        });
      }

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: process.env.NEXT_PUBLIC_APP_NAME || 'BellaModa',
        description: 'Purchase from BellaModa',
        method: paymentMethods,
        handler: async (response: any) => {
          try {
            // Verify payment
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
              toast.success('Payment successful! Order placed.');
              router.push(`/order/${orderId}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.error('Payment cancelled');
          },
        },
        theme: {
          color: '#3B82F6',
        },
        prefill: {
          name: shippingAddress.fullName,
          email: '',
          contact: '',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setIsProcessingPayment(false);
      setPaymentError(error);
      console.error('[PAYMENT ERROR]:', error);
      toast.error(error.message || 'Failed to initialize payment');
    }
  };

  // mutate data in the backend by calling trigger function
  const { trigger: placeOrder, isMutating: isPlacing } = useSWRMutation(
    `/api/orders/mine`,
    async (url) => {
      const finalAmount = getFinalTotal();
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress,
          items,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice: finalAmount, // Use final amount after discount
          coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            name: appliedCoupon.name,
            type: appliedCoupon.type,
            discountAmount: appliedCoupon.discountAmount,
            originalOrderValue: totalPrice, // Original total before discount
          } : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const orderId = data.order._id;
        
        if (isCashOnDelivery) {
          // For COD, directly redirect to success page
          clear();
          toast.success('Order placed successfully! Pay when delivered.');
          return router.push(`/order/${orderId}`);
        } else if (isRazorpayPayment) {
          // For Razorpay, initiate payment flow
          await handleRazorpayPayment(orderId);
        } else {
          // Fallback for other payment methods
          clear();
          toast.success('Order placed successfully');
          return router.push(`/order/${orderId}`);
        }
      } else {
        toast.error(data.message);
      }
    },
  );

  useEffect(() => {
    if (!paymentMethod) {
      return router.push('/payment');
    }
    if (items.length === 0) {
      return router.push('/');
    }
    
    // Load Razorpay script if needed
    if (isRazorpayPayment && typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, router, isRazorpayPayment]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>Loading...</>;

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
      <CheckoutSteps current={4} />

      <div className='my-4 grid md:grid-cols-4 md:gap-5'>
        <div className='overflow-x-auto md:col-span-3'>
          <div className='card bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.address}, {shippingAddress.city},{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}{' '}
              </p>
              <div>
                <Link className='btn' href='/shipping'>
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <div className='card mt-4 bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Payment Method</h2>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{PAYMENT_METHOD_LABELS[paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || paymentMethod}</span>
                {isCashOnDelivery && <span className='badge badge-warning'>COD</span>}
                {isRazorpayPayment && <span className='badge badge-success'>Secure</span>}
              </div>
              <div>
                <Link className='btn' href='/payment'>
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <div className='card mt-4 bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Items</h2>
              <table className='table'>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.slug}>
                      <td>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={/^(\/|https?:)/.test(item.image) ? item.image : '/images/banner/banner0.jpg'}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className='px-2'>
                            {item.name}({item.color} {item.size})
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span>{item.qty}</span>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link className='btn' href='/cart'>
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Coupon Section */}
          <CouponSection
            orderValue={totalPrice}
            shippingCost={shippingPrice}
            onCouponApplied={applyCoupon}
            onCouponRemoved={removeCoupon}
            appliedCoupon={appliedCoupon}
          />
          
          {/* Order Summary */}
          <div className='card bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Order Summary</h2>
              <ul className='space-y-3'>
                <li>
                  <div className=' flex justify-between'>
                    <div>Items</div>
                    <div>{formatPrice(itemsPrice)}</div>
                  </div>
                </li>
                <li>
                  <div className=' flex justify-between'>
                    <div>Tax</div>
                    <div>{formatPrice(taxPrice)}</div>
                  </div>
                </li>
                <li>
                  <div className=' flex justify-between'>
                    <div>Shipping</div>
                    <div>{formatPrice(shippingPrice)}</div>
                  </div>
                </li>
                
                {appliedCoupon && (
                  <>
                    <li>
                      <div className=' flex justify-between'>
                        <div>Subtotal</div>
                        <div>{formatPrice(totalPrice)}</div>
                      </div>
                    </li>
                    <li>
                      <div className=' flex justify-between text-success'>
                        <div>Discount ({appliedCoupon.code})</div>
                        <div>-{formatPrice(appliedCoupon.discountAmount)}</div>
                      </div>
                    </li>
                  </>
                )}
                
                <li>
                  <div className=' flex justify-between font-bold text-lg border-t pt-2'>
                    <div>Total</div>
                    <div>{formatPrice(getFinalTotal())}</div>
                  </div>
                </li>

                {paymentError && (
                  <li>
                    <PaymentErrorHandler
                      error={paymentError}
                      onRetry={() => {
                        setPaymentError(null);
                        // You can add retry logic here if needed
                      }}
                      onDismiss={() => setPaymentError(null)}
                    />
                  </li>
                )}

                <li>
                  <button
                    onClick={() => placeOrder()}
                    disabled={isPlacing || isProcessingPayment}
                    className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isPlacing && (
                      <span className='loading loading-spinner'></span>
                    )}
                    {isProcessingPayment && 'Processing Payment...'}
                    {!isPlacing && !isProcessingPayment && (
                      isCashOnDelivery ? 'Place Order (COD)' : 
                      isRazorpayPayment ? 'Pay Now' : 'Place Order'
                    )}
                  </button>
                </li>

                {isCashOnDelivery && (
                  <li className='text-sm text-base-content/70 text-center'>
                    💡 You will pay in cash when your order is delivered
                  </li>
                )}

                {isRazorpayPayment && (
                  <li className='text-sm text-base-content/70 text-center'>
                    🔒 Secure payment powered by Razorpay
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
