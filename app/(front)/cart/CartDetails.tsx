'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';
import { OrderItem } from '@/lib/models/OrderModel';

type CartItem = OrderItem & {
  category: string;
  brand: string;
  countInStock: number;
};

const CartDetails = () => {
  const { items, itemsPrice, shippingPrice, totalPrice, decrease, increase } = useCartService();
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/products/search?q=all');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleCheckout = () => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to proceed to checkout');
      router.push('/signin?callbackUrl=/shipping');
      return;
    }
    
    if (status === 'loading') {
      toast.error('Please wait while we verify your session');
      return;
    }
    
    router.push('/shipping');
  };

  if (!mounted) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-pulse font-headline italic text-2xl text-primary">Preparing your ritual...</div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-surface flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-primary/20">
          <span className="material-symbols-outlined text-[120px]">shopping_bag</span>
        </div>
        <h1 className="font-headline italic text-4xl md:text-5xl text-primary text-center">Your Bag is Empty</h1>
        <p className="text-secondary mt-4 font-body tracking-wide opacity-80 text-center max-w-md">
          Your ritual awaits. Explore our artisanal collections to find the perfect blend for your journey.
        </p>
        <Link 
          href="/shop" 
          className="mt-10 bg-primary text-on-primary px-10 py-4 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/10"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <main className="pt-20 md:pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto bg-surface">
      <div className="mb-12">
        <h1 className="font-headline italic text-5xl md:text-6xl text-primary tracking-tight">Your Ritual Bag</h1>
        <p className="text-secondary mt-4 font-body tracking-wide opacity-80">
          {items.reduce((acc: number, item: CartItem) => acc + item.qty, 0)} artisanal {items.length === 1 && items[0].qty === 1 ? 'blend' : 'blends'} awaiting their journey to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-12">
          {items.map((item: CartItem) => (
            <div key={item.slug} className="group flex flex-col md:flex-row gap-8 pb-12 items-start border-b border-outline-variant/20">
              <div className="w-full md:w-48 aspect-[4/5] bg-surface-container-low overflow-hidden rounded relative">
                <Image
                  src={/^(\/|https?:)/.test(item.image) ? item.image : '/images/banner/banner0.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between h-full py-2 w-full">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-headline text-2xl text-on-surface">
                      <Link href={`/product/${item.slug}`} className="hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-secondary font-label text-sm mt-1">
                      {item.category} • {item.brand}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                       {item.countInStock > 0 ? (
                         <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                           In Stock
                         </span>
                       ) : (
                         <span className="bg-error-container text-on-error-container px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                           Out of Stock
                         </span>
                       )}
                       {item.price > 1000 && (
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                          Premium Batch
                        </span>
                       )}
                    </div>
                  </div>
                  <p className="font-headline text-xl text-primary whitespace-nowrap">{formatPrice(item.price)}</p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center border border-outline-variant/30 rounded px-3 py-1 gap-6">
                    <button 
                      className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-sm"
                      onClick={() => decrease(item)}
                    >
                      remove
                    </button>
                    <span className="font-label text-on-surface font-semibold w-4 text-center">{item.qty}</span>
                    <button 
                      className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-sm"
                      onClick={() => increase(item)}
                    >
                      add
                    </button>
                  </div>
                  <button 
                    className="text-secondary/60 hover:text-error transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-semibold"
                    onClick={() => decrease({...item, qty: item.qty})}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-surface-container-low p-8 rounded-lg">
            <h2 className="font-headline text-2xl text-secondary border-b border-outline-variant/20 pb-4 mb-6">Summary</h2>
            <div className="space-y-4 font-body">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal ({items.reduce((acc: number, item: CartItem) => acc + item.qty, 0)} items)</span>
                <span className="font-semibold">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span className="font-semibold">{shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant italic">
                <span>Eco-Packaging Contribution</span>
                <span className="font-semibold">₹0</span>
              </div>
              <div className="pt-6 mt-6 border-t border-outline-variant/30 flex justify-between items-baseline">
                <span className="font-headline text-xl">Total</span>
                <span className="font-headline text-3xl text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button 
                className="w-full bg-primary text-on-primary py-5 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                onClick={handleCheckout}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Verifying Ritual...' : 'Secure Checkout'}
              </button>
              <div className="flex items-center justify-center gap-2 text-secondary/60 text-[10px] uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-sm">lock</span>
                Encrypted & Private
              </div>
            </div>

            <div className="mt-10 p-4 bg-surface-container-high/50 rounded flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0">eco</span>
              <div>
                <p className="font-label text-xs font-bold text-secondary uppercase tracking-tighter">Conscious Choice</p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  This order plants one native tree in the Aravalli range through our reforestation initiative.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete the Ritual Section */}
      {recommendations.length > 0 && (
        <section className="mt-32 pt-24 border-t border-outline-variant/20">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl italic text-on-surface">Complete Your Ritual</h2>
            <p className="text-secondary mt-4 font-body tracking-wide opacity-80 max-w-lg mx-auto italic text-sm">
              Elevate your daily discipline with our foundational core collective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recommendations.map((product) => (
              <div key={product.slug} className="group">
                <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden rounded mb-6">
                  <Image
                    src={/^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <Link 
                    href={`/product/${product.slug}`}
                    className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm text-primary py-3 text-center font-label text-[10px] uppercase font-bold tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    View Product
                  </Link>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline text-lg text-on-surface">
                      <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
                        {product.name}
                      </Link>
                    </h4>
                    <p className="text-secondary text-xs mt-1 uppercase tracking-widest font-semibold">
                      {product.category} • {formatPrice(product.price)}
                    </p>
                  </div>
                  <button 
                    className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-2xl"
                    onClick={() => {
                       increase(product);
                       toast.success(`${product.name} added to ritual`);
                    }}
                  >
                    add_circle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CartDetails;
