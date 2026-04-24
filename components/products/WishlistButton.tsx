'use client';

import { Heart } from 'lucide-react';
import useWishlistService from '@/lib/hooks/useWishlistStore';
import toast from 'react-hot-toast';

export default function WishlistButton({ product }: { product: any }) {
  const { toggle, exists } = useWishlistService();
  const isWishlisted = exists(product.slug);

  return (
    <button
      onClick={() => {
        const added = toggle(product);
        if (added) toast.success('Added to Archive');
      }}
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] border transition-all duration-300 ${
        isWishlisted 
          ? 'bg-primary text-white border-primary shadow-lg scale-105' 
          : 'bg-transparent text-primary border-primary/20 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2.5} />
      {isWishlisted ? 'In Archive' : 'Add to Archive'}
    </button>
  );
}
