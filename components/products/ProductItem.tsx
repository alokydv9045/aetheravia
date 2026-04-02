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
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <>
      <div
        className='group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full flex flex-col'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className='absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100'
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        />
      </button>

      {/* Image Container */}
      <figure className='relative aspect-square overflow-hidden bg-gray-50'>
        <Link
          href={`/product/${product.slug}`}
          className='block relative h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
        >
          <Image
            src={/^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg'}
            alt={product.name}
            fill
            className='object-cover transition-transform duration-500 ease-out group-hover:scale-105'
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        </Link>

        {/* Stock Status Badge */}
        {product.countInStock === 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Out of Stock
          </div>
        )}
        {product.countInStock > 0 && product.countInStock <= 5 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Only {product.countInStock} left
          </div>
        )}
      </figure>

      {/* Product Info */}
      <div className='p-4 space-y-3'>
        {/* Brand */}
        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
          {product.brand}
        </p>

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className='font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors cursor-pointer text-sm leading-tight'>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <Rating
          value={product.rating}
          numReviews={product.numReviews}
          isCard={true}
        />

        {/* Price */}
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold text-green-600'>
            {formatPrice(product.price)}
          </span>

          {/* Add to Cart Button */}
          <Button
            size="sm"
            disabled={product.countInStock === 0}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default ProductItem;
