import ProductItem from '@/components/products/ProductItem';
import CardSlider from '@/components/slider/CardSlider';
import { CarouselItem } from '@/components/ui/carousel';
import productService from '@/lib/services/productService';
import { convertDocToObj } from '@/lib/utils';

const Slider = async () => {
  const topRated = await productService.getTopRated();

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
            <ProductItem key={product.slug} product={convertDocToObj(product)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
