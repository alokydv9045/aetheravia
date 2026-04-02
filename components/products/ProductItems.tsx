import productService from '@/lib/services/productService';
import { convertDocToObj } from '@/lib/utils';
import CardSlider from '@/components/slider/CardSlider';
import { CarouselItem } from '@/components/ui/carousel';

import ProductItem from './ProductItem';

const ProductItems = async () => {
  const latestProducts = await productService.getLatest();

  return (
    <div>
      <div className='text-center mb-8'>
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Latest Products</h2>
        <p className='text-lg text-gray-600'>Discover our newest arrivals</p>
      </div>
      {latestProducts.length === 0 ? (
        <div className='rounded-lg bg-base-300 p-6 text-center'>No products yet.</div>
      ) : (
        <CardSlider>
          {latestProducts.map((product) => (
            <CarouselItem
              key={product.slug}
              className='sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
            >
              <ProductItem product={convertDocToObj(product)} />
            </CarouselItem>
          ))}
        </CardSlider>
      )}
    </div>
  );
};

export default ProductItems;

const ProductItemSkeleton = () => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse'>
      <div className='aspect-square bg-gray-200' />
      <div className='p-4 space-y-3'>
        <div className='h-3 bg-gray-200 rounded w-16' />
        <div className='h-4 bg-gray-200 rounded w-full' />
        <div className='h-4 bg-gray-200 rounded w-3/4' />
        <div className='flex items-center justify-between'>
          <div className='h-5 bg-gray-200 rounded w-20' />
          <div className='h-8 bg-gray-200 rounded w-16' />
        </div>
      </div>
    </div>
  );
};

export const ProductItemsSkeleton = ({
  qty,
  name,
}: {
  qty: number;
  name: string;
}) => {
  return (
    <div>
      <div className='text-center mb-8'>
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>{name}</h2>
        <p className='text-lg text-gray-600'>Loading amazing products...</p>
      </div>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        {Array.from({ length: qty }).map((_, i) => {
          return <ProductItemSkeleton key={i} />;
        })}
      </div>
    </div>
  );
};
