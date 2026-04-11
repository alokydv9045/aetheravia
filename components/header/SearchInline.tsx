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
  
  const { data: products, error, isLoading } = useSWR(
    query.length >= 2 ? `/api/products/search?q=${query}` : null,
    fetcher
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center justify-end">
      <div className="relative">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gray-50 rounded-full border border-gray-200 shadow-lg overflow-hidden z-10"
            >
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=""
                className="w-full bg-transparent py-2 pl-4 pr-10 outline-none text-sm text-black"
                autoComplete="off"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-12 text-gray-400 hover:text-black transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={handleToggle}
                className="absolute right-2 px-3 py-1 flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Toggle search"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-primary" />
                ) : (
                  <Search size={18} className="text-primary" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleToggle}
          animate={{ 
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0.9 : 1
          }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
          className="flex items-center gap-2 text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary group whitespace-nowrap"
          aria-label="Open search"
        >
          <Search size={20} className="transition-colors group-hover:text-white" />
        </motion.button>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (isLoading || (products && products.length >= 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-4 right-0 w-[300px] sm:w-[350px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Searching...</div>
              ) : products && products.length > 0 ? (
                <div className="space-y-1">
                  {products.map((product: Product) => (
                    <Link
                      key={product.slug}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">No products found for "{query}"</p>
                </div>
              )}
            </div>
            
            <Link 
              href={`/search?q=${query}`}
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-xs font-semibold text-primary border-t border-gray-100 hover:bg-primary/5 transition-colors"
            >
              View all results
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
