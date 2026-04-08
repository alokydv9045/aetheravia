'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Calendar, ShoppingCart } from 'lucide-react';

import { Product } from '@/lib/models/ProductModel';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ProductItem = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock duration and discount since they are not in the model but in the UI snippet
  const duration = "7 nights / 8 days";
  const originalPrice = product.price + 2000;
  const discount = "₹ 2,000 Off";
  const dates = "Apr 3, Apr 11, Apr 18";

  return (
    <article 
      id={`trip-card-${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col shrink-0 w-full"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden shrink-0 w-full aspect-[4/3]">
        <Link href={`/product/${product.slug}`}>
          <Image 
            alt={product.name} 
            src={/^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 260px, 280px"
          />
        </Link>
        
        {/* Wishlist Button (Added feature) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className='absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100'
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

      </div>

      <div className="flex flex-col justify-center flex-grow p-4 pt-3.5">
        <div className="flex items-center gap-1 text-[12px] mb-1.5" style={{ color: '#5e5e5e', fontFamily: "var(--font-vietnam), 'Be Vietnam Pro', sans-serif" }}>
          <Calendar className="w-3.5 h-3.5 opacity-70" />
          <span>{duration}</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold leading-snug mb-2.5 line-clamp-2 text-[14px] min-h-[40px] hover:text-green-600 transition-colors" style={{ color: '#191c1d', fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[16px] font-extrabold" style={{ color: '#191c1d', fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
            {formatPrice(product.price)}
          </span>
          <span className="text-[12px] line-through" style={{ color: '#9e9e9e' }}>
            {formatPrice(originalPrice)}
          </span>
          <span className="text-[11px] font-bold" style={{ color: '#e65100' }}>
            {discount}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-1.5 text-[11px]" style={{ color: '#5e5e5e', fontFamily: "var(--font-vietnam), 'Be Vietnam Pro', sans-serif" }}>
            <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
            <span className="leading-relaxed">{dates}</span>
          </div>
          
          {/* Add to Cart Button (Added feature) */}
          <Button
            size="sm"
            disabled={product.countInStock === 0}
            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
