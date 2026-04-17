'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import useCartService from '@/lib/hooks/useCartStore';
import { OrderItem } from '@/lib/models/OrderModel';

const AddToCart = ({ item }: { item: OrderItem }) => {
  const router = useRouter();
  const { items, increase, decrease } = useCartService();
  const [existItem, setExistItem] = useState<OrderItem | undefined>();

  const { data: session } = useSession();

  useEffect(() => {
    setExistItem(items.find((x) => x.slug === item.slug));
  }, [item, items]);

  const addToCartHandler = () => {
    if (!session) {
      router.push('/signin');
      return;
    }
    increase(item);
  };

  const buyNowHandler = () => {
    if (!session) {
      router.push('/signin');
      return;
    }
    increase(item);
    router.push('/shipping');
  };

  const handleIncrease = (itemObj: OrderItem) => {
    if (!session) {
      router.push('/signin');
      return;
    }
    increase(itemObj);
  };

  const handleDecrease = (itemObj: OrderItem) => {
    if (!session) {
      router.push('/signin');
      return;
    }
    decrease(itemObj);
  };

  return existItem ? (
    <div className='flex items-center gap-4 w-full'>
      <div className='flex items-center bg-surface-container rounded-lg p-1 shrink-0'>
        <button 
          className='p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center' 
          type='button' 
          onClick={() => handleDecrease(existItem)}
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className='px-4 font-medium text-sm font-body'>{existItem.qty}</span>
        <button 
          className='p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center' 
          type='button' 
          onClick={() => handleIncrease(existItem)}
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      <button 
        className='flex-grow bg-primary text-on-primary py-4 rounded-lg font-bold tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300'
        type='button' 
        onClick={() => handleIncrease(existItem)}
        style={{ background: 'radial-gradient(circle at center, #904917, #ae602d)' }}
      >
        Add More
        <span className="material-symbols-outlined text-lg">shopping_bag</span>
      </button>
    </div>
  ) : (
    <div className='flex flex-col sm:flex-row gap-3 w-full'>
      <button
        className='flex-grow bg-primary text-on-primary py-4 rounded-lg font-body text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300'
        style={{ background: 'radial-gradient(circle at center, #904917, #ae602d)' }}
        type='button'
        onClick={addToCartHandler}
      >
        Add to Bag
        <span className="material-symbols-outlined text-lg">shopping_bag</span>
      </button>
      <button
        className='flex-grow bg-surface-container-high text-primary border border-primary/20 py-4 rounded-lg font-body text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all duration-300'
        type='button'
        onClick={buyNowHandler}
      >
        Buy Now
        <span className="material-symbols-outlined text-lg">bolt</span>
      </button>
    </div>
  );
};

export default AddToCart;
