'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/models/ProductModel';
import { formatPrice } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SearchInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: products, isLoading } = useSWR(
    query.length >= 2 ? `/api/products/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  const { data: allProducts } = useSWR(
    query.length >= 2 ? `/api/products/search?q=all` : null,
    fetcher
  );

  const hasResults = products?.products && products.products.length > 0;
  const displayProducts = hasResults ? products.products : (allProducts?.products ? allProducts.products.slice(0, 3) : []);

  // Device detection for responsive UI switching
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Only close on click outside for desktop; mobile uses full-screen overlay
      if (!isMobile) {
        window.addEventListener('mousedown', handleClickOutside);
      }
      if (isMobile) document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  // Shared Results Grid Component for Mobile
  const MobileResults = () => (
    <div className="w-full max-w-6xl pb-24">
      <div className="flex flex-col gap-12">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-[0.4em]">
            {query.length >= 2 ? `Results for "${query}"` : 'Heritage Recommendations'}
          </h3>
          <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
            {displayProducts.length} Treasures found
          </p>
        </div>
        {displayProducts.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {displayProducts.map((product: Product) => (
              <motion.div key={product.slug} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Link href={`/product/${product.slug}`} onClick={() => setIsOpen(false)} className="group flex flex-col gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-low">
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-lg font-headline text-on-surface">{product.name}</h4>
                    <p className="text-xs text-secondary font-bold mt-1">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : <p className="py-12 text-center text-secondary/40 italic">Nothing found in the archive...</p>}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="flex items-center justify-end">
      {/* Container with fixed width on desktop to prevent layout shift */}
      <div 
        className={`${!isMobile ? 'w-[120px]' : ''} relative flex items-center justify-end h-10`}
      >
        <AnimatePresence>
          {!isOpen || isMobile ? (
            /* SEARCH TRIGGER BUTTON */
            <motion.button
              key="search-trigger"
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                handleToggle();
              }}
              className="flex items-center gap-2 text-sm font-bold text-black py-2 px-3 md:px-5 rounded-full hover:text-white hover:bg-primary transition-all duration-300 group whitespace-nowrap"
            >
              <Search size={18} className="transition-colors group-hover:text-white" />
              <span className="hidden md:inline">Search</span>
            </motion.button>
          ) : (
            /* DESKTOP: ZERO-SHIFT INLINE EXPANDING SEARCH */
            <motion.div
              key="desktop-search-input"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22 }}
              className="absolute right-0 flex items-center bg-white rounded-full border border-primary/20 shadow-2xl overflow-hidden h-full z-50 px-1"
            >
              <div className="pl-3 text-primary">
                <Search size={18} />
              </div>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search archive..."
                className="w-full bg-transparent px-3 outline-none text-sm font-medium text-black h-full"
                autoFocus
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }} 
                className="p-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-primary mr-1 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Results Dropdown (Scoped below the search bar) */}
        {!isMobile && (
          <AnimatePresence>
            {query.length >= 2 && isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 right-0 w-[450px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden p-4 z-50"
              >
                <div className="flex items-center justify-between mb-4 px-2 border-b border-gray-50 pb-2">
                   <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Archive Seek Findings</span>
                   {isLoading && <Loader2 size={12} className="animate-spin text-primary" />}
                </div>
                <div className="max-h-[450px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                  {displayProducts.map((product: Product) => (
                    <Link 
                      key={product.slug} 
                      href={`/product/${product.slug}`} 
                      onClick={() => setIsOpen(false)} 
                      className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-primary/5 transition-all group"
                    >
                      <div className="relative w-14 h-14 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-black truncate group-hover:text-primary transition-colors">{product.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{product.category}</p>
                        <p className="text-xs text-primary font-bold">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                  {displayProducts.length === 0 && !isLoading && (
                    <div className="py-12 text-center">
                      <p className="text-xs text-secondary/40 italic">No artifacts found matching your seek...</p>
                    </div>
                  )}
                </div>
                <Link 
                  href={hasResults ? `/shop?q=${encodeURIComponent(query)}` : '/shop'} 
                  onClick={() => setIsOpen(false)} 
                  className="block mt-4 p-4 text-center text-[10px] font-bold text-primary uppercase tracking-[0.2em] border-t border-gray-50 hover:bg-primary/5 transition-colors"
                >
                  Explore all Discoveries
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* MOBILE: Immersive Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-3xl flex flex-col items-center pt-12 px-6 overflow-y-auto"
          >
            <div className="absolute top-8 right-8">
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shadow-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="w-full max-w-4xl text-center mb-16">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] mb-4 block">Archive Discovery</span>
              <input
                id="search-input-mobile"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you seeking?"
                className="w-full bg-transparent border-b-2 border-primary/20 focus:border-primary py-6 text-2xl font-headline outline-none text-center"
                autoFocus
              />
            </div>
            <MobileResults />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
