'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';

const CartDetails = () => {
  const { items, itemsPrice, decrease, increase } = useCartService();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, [items, itemsPrice, decrease, increase]);

  const handleCheckout = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CartDetails] Checkout clicked, session status:', status);
      console.log('[CartDetails] Session data:', session);
    }
    
    if (status === 'unauthenticated') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CartDetails] User not authenticated, redirecting to signin');
      }
      toast.error('Please sign in to proceed to checkout');
      router.push('/signin?callbackUrl=/shipping');
      return;
    }
    
    if (status === 'loading') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CartDetails] Session still loading');
      }
      toast.error('Please wait while we verify your session');
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[CartDetails] User authenticated, proceeding to shipping');
    }
    // If authenticated, proceed to shipping
    router.push('/shipping');
  };

  if (!mounted) return <>Loading...</>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className='py-4 text-4xl font-bold text-gray-900 mb-8'>Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className='text-xl text-gray-600 mb-6'>Your cart is empty</p>
            <Link href='/' className='inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-all'>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className='grid md:grid-cols-4 md:gap-8'>
            <div className='md:col-span-3'>
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Product</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Quantity</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Price</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {items.map((item) => (
                        <tr key={item.slug} className='hover:bg-gray-50 transition-colors'>
                          <td className='px-6 py-4'>
                            <Link
                              href={`/product/${item.slug}`}
                              className='flex items-center gap-4 hover:text-green-600'
                            >
                              <Image
                                src={/^(\/|https?:)/.test(item.image) ? item.image : '/images/banner/banner0.jpg'}
                                alt={item.name}
                                width={60}
                                height={60}
                                className='rounded-md'
                              />
                              <span className='font-medium text-gray-900'>{item.name}</span>
                            </Link>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2'>
                              <button
                                className='w-8 h-8 rounded-md border border-gray-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center text-gray-600 hover:text-green-600 transition-all'
                                type='button'
                                onClick={() => decrease(item)}
                              >
                                −
                              </button>
                              <span className='w-8 text-center font-medium'>{item.qty}</span>
                              <button
                                className='w-8 h-8 rounded-md border border-gray-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center text-gray-600 hover:text-green-600 transition-all'
                                type='button'
                                onClick={() => increase(item)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className='px-6 py-4 font-semibold text-gray-900'>{formatPrice(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className='md:col-span-1'>
              <div className='bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm p-8 sticky top-20'>
                <h3 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h3>
                
                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between text-gray-700'>
                    <span>Items ({items.reduce((acc, item) => acc + item.qty, 0)})</span>
                    <span className='font-semibold'>{formatPrice(itemsPrice)}</span>
                  </div>
                  <div className='flex justify-between text-gray-700'>
                    <span>Shipping</span>
                    <span className='font-semibold text-green-600'>Free</span>
                  </div>
                  <div className='border-t border-gray-200 pt-4 flex justify-between'>
                    <span className='font-bold text-gray-900'>Total</span>
                    <span className='text-xl font-bold text-green-600'>{formatPrice(itemsPrice)}</span>
                  </div>
                </div>

                <button
                  type='button'
                  className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  onClick={handleCheckout}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Verifying...' : 'Proceed to Checkout'}
                </button>

                <Link
                  href='/shop'
                  className='block text-center text-green-600 hover:text-green-700 font-medium mt-4'
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDetails;
