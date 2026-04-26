import productService from '@/lib/services/productService';
import { convertDocToObj } from '@/lib/utils';
import ProductItem from './ProductItem';
import Link from 'next/link';

const ProductItems = async ({ 
  layout = 'slider',
  title = "Latest",
  highlight = "Products",
  category = 'all',
  sort = 'latest',
  q = 'all'
}: { 
  layout?: 'slider' | 'grid',
  title?: string,
  highlight?: string,
  category?: string,
  sort?: 'latest' | 'topRated',
  q?: string
}) => {
  let products = [];
  
  if (layout === 'grid' || (category && category !== 'all') || (q && q !== 'all')) {
    const res = await productService.getByQuery({
      q: q,
      category: category,
      price: 'all',
      rating: 'all',
      sort: 'newest',
      page: '1'
    });
    products = res.products;
  } else if (sort === 'topRated') {
    products = await productService.getTopRated();
  } else {
    products = await productService.getLatest();
  }

  if (products.length === 0) {
    return (
      <div className='rounded-lg bg-base-300 p-6 text-center text-gray-500'>
        No products yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section - Aligned to standard grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-extrabold tracking-tight text-[#191c1d]">
            {title}<span className="ml-2 text-primary">{highlight}</span>
          </h2>
          <Link 
            href="/shop" 
            className="flex items-center gap-1 text-sm font-semibold text-[#191c1d] hover:text-primary transition-colors group shrink-0"
          >
            View all
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>

      {layout === 'grid' ? (
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductItem key={product.slug} product={convertDocToObj(product)} />
          ))}
        </div>
      ) : (
        <div className="relative group/slider">
          <div 
            className="flex gap-5 overflow-x-auto pb-6 scroll-smooth scrollbar-hide px-4 md:px-8 xl:px-[calc((100vw-1280px)/2+32px)]" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch' 
            }}
          >
            {products.map((product) => (
              <div key={product.slug} className="w-[260px] sm:w-[280px] shrink-0">
                <ProductItem product={convertDocToObj(product)} />
              </div>
            ))}
          </div>
          
          {/* Subtle gradient fades for scroll indication */}
          <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};

export default ProductItems;

export const ProductItemsSkeleton = ({
  qty,
  layout = 'slider',
}: {
  qty: number;
  layout?: 'slider' | 'grid';
}) => {
  const containerClasses = layout === 'grid' 
    ? "max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    : "flex gap-5 overflow-x-auto pb-6 px-4 md:px-8 xl:px-[calc((100vw-1280px)/2+32px)]";

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-10 w-48 bg-surface-container-high rounded-md mb-8 animate-pulse" />
      </div>
      <div className={containerClasses}>
        {Array.from({ length: qty }).map((_, i) => (
          <div 
            key={i} 
            className={`${layout === 'slider' ? 'w-[280px] shrink-0' : ''} aspect-[4/3] bg-surface-container-low rounded-2xl animate-pulse flex flex-col space-y-4 p-4`}
          >
            <div className='w-full aspect-[4/3] bg-primary/5 rounded-xl' />
            <div className='h-6 bg-primary/5 rounded w-3/4' />
            <div className='h-4 bg-primary/5 rounded w-1/4' />
          </div>
        ))}
      </div>
    </div>
  );
};
