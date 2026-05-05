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
import { Heart } from 'lucide-react';

const ProductItem = ({ product }: { product: Product }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, increase } = useCartService();
  const { toggle, exists } = useWishlistService();
  
  const isWishlisted = exists(product.slug);

  const addItemHandler = () => {
    increase({
      ...product,
      qty: 0,
      color: '',
      size: '',
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
      iconTheme: {
        primary: '#fff',
        secondary: '#904917',
      },
    });
  };

  const buyNowHandler = () => {
    // Add to cart if not already present
    const existItem = items.find((x) => x.slug === product.slug);
    if (!existItem) {
      increase({
        ...product,
        qty: 0,
        color: '',
        size: '',
      });
    }
    
    // Proceed to shipping step with a refresh to ensure state sync
    router.refresh();
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/shipping');
    } else {
      router.push('/shipping');
    }
  };

  return (
    <article className="group flex flex-col w-full snap-start">
      <div className="relative bg-[#f6f3ee] rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(28,28,25,0.05)] mb-6 aspect-[4/5] z-0">
        <Link href={`/product/${product.slug}`} className="block relative h-full w-full">
          <Image
            src={/^(\/|https?:)/.test(product.image) ? product.image : '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        
        {/* Heritage Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#fbdbb0] text-[#765f3d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {product.category}
          </span>
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
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          suppressHydrationWarning
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-0 lg:translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent z-20">
          <div className="flex gap-2">
            <button 
              onClick={addItemHandler}
              className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 py-2.5 font-body text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-colors active:scale-[0.98]"
              suppressHydrationWarning
            >
              Add to Bag
            </button>
            <button 
              onClick={buyNowHandler}
              className="flex-1 bg-primary text-white py-2.5 font-body text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-opacity-90 transition-colors active:scale-[0.98]"
              suppressHydrationWarning
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-headline text-xl text-[#1c1c19] leading-tight group-hover:text-primary transition-colors">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="text-right shrink-0">
            <span className="block font-body text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="block font-body text-[10px] text-secondary/50 line-through">
              {formatPrice(product.price + 500)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-[#f0ede8] px-2 py-1 rounded text-[10px] text-secondary font-bold uppercase tracking-tighter">
            {product.brand}
          </span>
          <span className="w-1 h-1 rounded-full bg-outline/30"></span>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Ancient Blend</span>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
