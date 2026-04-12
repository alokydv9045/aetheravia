'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/models/ProductModel';
import { formatPrice } from '@/lib/utils';
import useCartService from '@/lib/hooks/useCartStore';
import toast from 'react-hot-toast';

const ProductItem = ({ product }: { product: Product }) => {
  const { items, increase } = useCartService();

  const addItemHandler = () => {
    increase({
      ...product,
      qty: 0,
      color: '',
      size: '',
    });
    toast.success('Added to your cart', {
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

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/20 to-transparent z-20">
          <button 
            onClick={addItemHandler}
            className="w-full bg-primary text-white py-3 font-body text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-primary-container transition-colors active:scale-[0.98]"
          >
            Quick Add
          </button>
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
            {product.brand} & Silt
          </span>
          <span className="w-1 h-1 rounded-full bg-outline/30"></span>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Detoxifying</span>
        </div>
      </div>
    </article>
  );
};


export default ProductItem;
