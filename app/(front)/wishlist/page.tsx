'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWishlistService from '@/lib/hooks/useWishlistStore';
import useCartService from '@/lib/hooks/useCartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, toggle, clear } = useWishlistService();
  const { increase } = useCartService();

  const addToCartHandler = (item: any) => {
    increase({
        ...item,
        qty: 0,
        color: '',
        size: ''
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-24">
        <div className="mb-16 text-center md:text-left">
           <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-4">Curated Selections</p>
           <h1 className="font-headline text-5xl md:text-7xl text-on-surface italic mb-6">Your Archive</h1>
           <p className="text-secondary font-body max-w-2xl opacity-70 leading-relaxed">
             A personal sanctuary for the rituals you've seeked. These treasures are held here until you are ready to bring them into your daily heritage.
           </p>
        </div>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-xl"
          >
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8">
              <Heart size={40} className="text-primary/20" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-headline text-on-surface italic mb-4">Your archive is empty</h2>
            <p className="text-secondary font-body mb-8 opacity-60">Begin your journey by discovering our collection.</p>
            <Link 
              href="/shop" 
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary-container transition-all shadow-lg"
            >
              Explore the Collection
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-6">
              <span className="text-sm font-bold text-secondary uppercase tracking-widest">{items.length} Artifacts Saved</span>
              <button 
                onClick={clear}
                className="text-[10px] font-bold text-error uppercase tracking-widest hover:underline flex items-center gap-2"
              >
                <Trash2 size={12} /> Clear Archive
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10 shadow-md hover:shadow-xl transition-all duration-500"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%]" 
                      />
                      <button 
                        onClick={() => toggle(item)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-error shadow-lg hover:scale-110 transition-transform"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-headline text-lg lg:text-xl text-on-surface mb-0.5 truncate">{item.name}</h3>
                      <p className="text-primary font-bold text-sm mb-4">{formatPrice(item.price)}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => addToCartHandler(item)}
                          disabled={item.countInStock === 0}
                          className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md disabled:opacity-50"
                        >
                          <ShoppingBag size={12} />
                          {item.countInStock > 0 ? 'To Bag' : 'Sold'}
                        </button>
                        <Link 
                          href={`/product/${item.slug}`}
                          className="w-10 h-10 border border-outline-variant/30 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-all flex-shrink-0"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
