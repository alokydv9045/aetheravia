'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Heart, X, Star, Plus, Minus } from 'lucide-react';

import { Product } from '@/lib/models/ProductModel';
import { formatPrice } from '@/lib/utils';

import { Rating } from './Rating';
import { Button } from '@/components/ui/button';

const ProductItem = ({ product }: { product: Product }) => {
  return (
    <article 
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col shrink-0 w-[260px] sm:w-[280px]" 
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="relative overflow-hidden shrink-0 w-full aspect-[4/3]">
        <Link href={`/product/${product.slug}`} className="block relative h-full w-full">
          <Image
            src={/^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 260px, 280px"
          />
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-grow p-4 pt-3.5">
        <div className="flex items-center gap-1 text-[12px] mb-1.5 text-gray-500">
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>Natural Collection</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold leading-snug mb-2.5 line-clamp-2 text-[14px] min-h-[40px] text-[#191c1d]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[16px] font-extrabold text-[#191c1d]">
            {formatPrice(product.price)}
          </span>
          <span className="text-[12px] line-through text-gray-400">
            {formatPrice(product.price + 500)}
          </span>
          <span className="text-[11px] font-bold text-orange-600">
            ₹ 500 Off
          </span>
        </div>

        <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="leading-relaxed">Available for next delivery</span>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
