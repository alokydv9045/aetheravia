import TripCarousel from '@/components/products/TripCarousel';
import ProductItem from '@/components/products/ProductItem';
import productService from '@/lib/services/productService';
import { convertDocToObj } from '@/lib/utils';

const Slider = async () => {
  const topRated = await productService.getTopRated();

  return (
    <div>
      {topRated.length === 0 ? (
        <div className='rounded-lg bg-base-300 p-6 text-center'>No top rated products yet.</div>
      ) : (
        <TripCarousel>
          {topRated.map((product) => (
            <div
              key={product.slug}
              className='shrink-0 w-[260px] sm:w-[280px]'
            >
              <ProductItem product={convertDocToObj(product)} />
            </div>
          ))}
        </TripCarousel>
      )}
    </div>
  );
};

export default Slider;
