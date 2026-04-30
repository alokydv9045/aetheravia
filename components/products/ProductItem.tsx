'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product } from '@/lib/models/ProductModel';
import { formatPrice } from '@/lib/utils';
import useCartService from '@/lib/hooks/useCartStore';
import useWishlistService from '@/lib/hooks/useWishlistStore';
import toast from 'react-hot-toast';
import { Heart, Zap, Ticket } from 'lucide-react';

const ProductItem = ({ product }: { product: Product }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, increase } = useCartService();
  const { toggle, exists } = useWishlistService();
  
  const isWishlisted = exists(product.slug);
  
  // Offer Logic - Explicitly calculate to ensure it's never undefined
  const activeOffer = product.activeOffer;
  const hasOffer = !!(activeOffer && activeOffer.discountPercentage && activeOffer.discountPercentage > 0);
  const discountedPrice = hasOffer 
    ? Math.round(product.price * (1 - activeOffer!.discountPercentage / 100)) 
    : product.price;

  const addItemHandler = () => {
    increase({
      ...product,
      price: discountedPrice, // Ensure cart gets the discounted price
      qty: 0,
      color: '',
      mlQuantity: product.mlQuantity || '',
    });
    toast.success('Added to your bag', {
      style: {
        background: '#904917',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      },
    });
  };

  const buyNowHandler = () => {
    const existItem = items.find((x) => x.slug === product.slug);
    if (!existItem) {
      increase({
        ...product,
        price: discountedPrice,
        qty: 0,
        color: '',
        mlQuantity: product.mlQuantity || '',
      });
    }
    router.refresh();
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/shipping');
    } else {
      router.push('/shipping');
    }
  };

  return (
    <article className="group flex flex-col w-full snap-start relative">
      <div className="relative bg-[#f6f3ee] rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(28,28,25,0.05)] mb-6 aspect-[4/5] z-0">
        <Link href={`/product/${product.slug}`} className="block relative h-full w-full" style={{ position: 'relative' }}>
          <Image
            src={product.image || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="bg-[#fbdbb0] text-[#765f3d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {product.category}
          </span>
          {hasOffer && (
            <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
              <Zap size={10} fill="currentColor" />
              {product.activeOffer?.title}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            const added = toggle(product);
            if (added) toast.success('Added to Archive');
          }}
          className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            isWishlisted 
              ? 'bg-primary text-white scale-110' 
              : 'bg-white/90 text-primary hover:scale-110'
          }`}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-0 lg:translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent z-20">
          <div className="flex gap-2">
            <button onClick={addItemHandler} className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 py-2.5 font-body text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-colors">Add to Bag</button>
            <button onClick={buyNowHandler} className="flex-1 bg-primary text-white py-2.5 font-body text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-opacity-90 transition-colors">Buy Now</button>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl text-[#1c1c19] leading-tight group-hover:text-primary transition-colors truncate">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#f0ede8] px-2 py-0.5 rounded text-[9px] text-secondary font-bold uppercase tracking-widest">
                {product.brand}
              </span>
              {hasOffer && product.activeOffer?.promoCode && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-widest">
                  <Ticket size={10} className="opacity-60" />
                  Code: {product.activeOffer.promoCode}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex flex-col items-end gap-1">
              <span className="block font-body text-2xl font-bold leading-none text-primary">
                {formatPrice(discountedPrice)}
              </span>
              {hasOffer && (
                <>
                  <span className="font-body text-[13px] text-secondary/40 line-through decoration-secondary/30 decoration-[1.5px]">
                    {formatPrice(product.price)}
                  </span>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1">
                    {activeOffer?.discountPercentage}% OFF
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
