import ProductItem from '@/components/products/ProductItem';
import productService from '@/lib/services/productService';
import { convertDocToObj } from '@/lib/utils';

const Slider = async () => {
  let topRated = [];
  try {
    topRated = await productService.getTopRated();
  } catch (error) {
    console.error('[Slider] Failed to load top rated products:', error);
    topRated = [];
  }

  return (
    <div>
      {topRated.length === 0 ? (
        <div className='rounded-lg bg-base-300 p-6 text-center text-gray-500'>No top rated products yet.</div>
      ) : (
        <div 
          className="flex gap-5 overflow-x-auto pb-6 scroll-smooth scrollbar-hide" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          {topRated.map((product) => (
            <div key={product.slug} className="shrink-0 w-[260px] sm:w-[280px]">
              <ProductItem product={convertDocToObj(product)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
