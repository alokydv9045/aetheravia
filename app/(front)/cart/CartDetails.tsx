'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import { motion, AnimatePresence } from 'framer-motion';
import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';
import { OrderItem } from '@/lib/models/OrderModel';

type CartItem = OrderItem & {
  category: string;
  brand: string;
  countInStock: number;
};

const CartDetails = () => {
  const { 
    items: cartItems, 
    itemsPrice, 
    shippingPrice, 
    taxPrice,
    totalPrice, 
    decrease, 
    increase,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getFinalTotal
  } = useCartService();
  const items = cartItems as CartItem[];
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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
        // Filter out items already in cart
        const filtered = data.filter((p: any) => !items.some((i) => i.slug === p.slug));
        setRecommendations(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode: couponCode.trim(), 
          orderValue: itemsPrice, 
          shippingCost: shippingPrice 
        }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon(data);
        toast.success('Coupon applied to your ritual');
        setCouponCode('');
      } else {
        toast.error(data.message || 'This code does not match our records');
      }
    } catch (error) {
      toast.error('Failed to validate coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      toast.error('Please sign in to proceed to checkout');
      // Using a full URL to ensure the query param is fresh and not cached by the router
      router.push('/signin?callbackUrl=/shipping');
      return;
    }
    
    // Ensure cart is synced before moving
    router.refresh();
    router.push('/shipping');
  };

  if (!mounted) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-pulse font-headline italic text-2xl text-primary">Preparing your ritual...</div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface px-4 py-32 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-8 text-primary/10 flex justify-center">
            <span className="material-symbols-outlined text-[160px] font-thin">spa</span>
          </div>
          <h1 className="font-headline italic text-5xl md:text-7xl text-primary tracking-tighter">Empty Vessel</h1>
          <p className="text-secondary mt-6 font-body text-lg tracking-wide opacity-80 leading-relaxed">
            Your ritual bag is awaiting its first selection. Every journey begins with a single choice—explore our curated collectives to begin yours.
          </p>
          <Link 
            href="/shop" 
            className="inline-block mt-12 bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container hover:scale-105 transition-all shadow-2xl shadow-primary/20"
          >
            Enter the Shop
          </Link>
        </motion.div>

        {/* Mini Recommendations for Empty State */}
        <div className="mt-32 w-full max-w-5xl">
          <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-6">
            <h2 className="font-headline text-3xl italic text-on-surface">Curated Essentials</h2>
            <Link href="/shop" className="text-primary font-label text-[10px] uppercase font-bold tracking-widest hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((product, index) => (
              <div key={product.slug} className="group flex gap-6 items-center">
                <div className="w-24 aspect-square relative bg-surface-container-low rounded overflow-hidden">
                  <Image 
                    src={product.image || '/images/banner/banner0.jpg'} 
                    alt={product.name} 
                    fill 
                    className="object-cover grayscale"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>
                <div>
                  <h4 className="font-headline text-lg text-on-surface">
                    <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">{product.name}</Link>
                  </h4>
                  <p className="text-secondary text-[10px] uppercase font-bold tracking-widest mt-1">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-20 md:pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto bg-surface">
      <div className="mb-12">
        <h1 className="font-headline italic text-5xl md:text-6xl text-primary tracking-tight">Your Ritual Bag</h1>
        <p className="text-secondary mt-4 font-body tracking-wide opacity-80">
          {items.reduce((acc, item) => acc + item.qty, 0)} artisanal {items.length === 1 && items[0].qty === 1 ? 'blend' : 'blends'} awaiting their journey to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Cart Items List */}
        <div className="lg:col-span-8">
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {items.map((item: CartItem) => (
                <motion.div 
                  key={item.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col md:flex-row gap-8 pb-12 items-start border-b border-outline-variant/20"
                >
              <div className="w-full md:w-48 aspect-[4/5] bg-surface-container-low overflow-hidden rounded relative">
                <Image
                  src={item.image || '/images/banner/banner0.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                  priority={items.indexOf(item) === 0}
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
                      {(item.color || item.size) && (
                        <span className="ml-2 border-l border-outline-variant/30 pl-2">
                          {item.color && <span className="mr-2">Color: {item.color}</span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </span>
                      )}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                       {item.countInStock > 0 ? (
                         item.qty > item.countInStock ? (
                          <span className="bg-warning-container text-on-warning-container px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                            Only {item.countInStock} available
                          </span>
                         ) : (
                          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                            In Stock
                          </span>
                         )
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
            </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            {/* Free Shipping Progress */}
            {itemsPrice < 2000 && (
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Almost there</span>
                  <span className="text-[10px] font-bold text-secondary">{formatPrice(2000 - itemsPrice)} to Free Shipping</span>
                </div>
                <div className="h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(itemsPrice / 2000) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}

            <div className="bg-surface-container-low p-8 rounded-lg shadow-sm">
              <h2 className="font-headline text-2xl text-secondary border-b border-outline-variant/20 pb-4 mb-6">Summary</h2>
              <div className="space-y-4 font-body">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal ({items.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="font-semibold">{formatPrice(itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-semibold">{formatPrice(taxPrice)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="font-semibold">{shippingPrice === 0 ? 'Complimentary' : formatPrice(shippingPrice)}</span>
                </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-primary font-medium animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">sell</span>
                    <span>Coupon ({appliedCoupon.code})</span>
                  </div>
                  <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-on-surface-variant italic">
                <span>Eco-Packaging Contribution</span>
                <span className="font-semibold">₹0</span>
              </div>
              <div className="pt-6 mt-6 border-t border-outline-variant/30 flex justify-between items-baseline">
                <span className="font-headline text-xl">Total</span>
                <span className="font-headline text-3xl text-primary">{formatPrice(getFinalTotal())}</span>
              </div>
            </div>
            </div>

            <div className="mt-8 space-y-6">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    className="flex-1 bg-surface border border-outline-variant/30 rounded px-4 py-2 text-xs font-label tracking-widest focus:outline-primary focus:border-primary transition-all"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="bg-secondary text-on-secondary px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/10 rounded p-3 flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Code {appliedCoupon.code} active</span>
                  <button 
                    onClick={() => removeCoupon()}
                    className="text-secondary hover:text-error transition-colors text-[10px] font-bold tracking-widest uppercase"
                  >
                    Remove
                  </button>
                </div>
              )}

              <button 
                className="w-full bg-primary text-on-primary py-5 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:grayscale"
                onClick={handleCheckout}
                disabled={status === 'loading' || items.some(item => item.qty > item.countInStock || item.countInStock === 0)}
              >
                {status === 'loading' ? 'Verifying Ritual...' : 
                 items.some(item => item.qty > item.countInStock || item.countInStock === 0) ? 'Items Unavailable' :
                 'Proceed to Shipping'}
              </button>
              
              <Link 
                href="/shop"
                className="block text-center text-secondary/60 hover:text-primary transition-colors text-[10px] font-bold tracking-widest uppercase"
              >
                Continue Exploring
              </Link>
              
              <div className="pt-6 border-t border-outline-variant/10 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-secondary/80">
                  <span className="material-symbols-outlined text-xl">local_shipping</span>
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold uppercase tracking-tighter">Ritual Logistics</p>
                    <p className="opacity-70">Estimated arrival in 3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-secondary/60 text-[10px] uppercase tracking-widest font-bold bg-surface-container-high/30 py-2 rounded">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Encrypted & Private
                </div>
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
                    src={product.image || '/images/banner/banner0.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
