import { Metadata } from 'next';
import { Suspense } from 'react';
import { Leaf, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import Carousel, { CarouselSkeleton } from '@/components/carousel/carousel';
import CategoriesBar from '@/components/categories/CategoriesBar';
import Icons from '@/components/icons/Icons';
import ProductItems, {
  ProductItemsSkeleton,
} from '@/components/products/ProductItems';
import ReadMore from '@/components/readMore/ReadMore';
import Text from '@/components/readMore/Text';
import Slider from '@/components/slider/Slider';
import Testimonials from '@/components/testimonials/Testimonials';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BRAND_NAME || 'Aetheravia',
  description: 'Embrace the Earth: Unveil Your Personality - Premium sustainable skincare and body care products',
};

const HomePage = () => {
  return (
    <div className='flex flex-col'>
      {/* Categories Navigation Bar */}
      <CategoriesBar />
      
      {/* Auto-Sliding Banner Hero Section */}
      <section className='w-full'>
        <Suspense fallback={<CarouselSkeleton />}>
          <Carousel />
        </Suspense>
      </section>

      {/* Main Content Wrapper */}
      <div className='flex flex-col gap-12 md:gap-20'>
        {/* Brand Intro Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Natural Beauty, Sustainable Future
            </h2>
            <p className='text-lg text-gray-700 mb-8'>
              Aetheravia is a skincare/body care brand that promotes sustainable, eco-friendly, 
              cruelty-free, and toxic-free products, catering to health-conscious consumers who 
              seek natural, effective solutions for radiant skin.
            </p>
          </div>
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Leaf className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Eco-Friendly</h3>
              <p className='text-sm text-gray-600'>Sustainably sourced ingredients</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-8 h-8 text-pink-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Cruelty-Free</h3>
              <p className='text-sm text-gray-600'>Never tested on animals</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <ShieldCheck className='w-8 h-8 text-blue-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Toxic-Free</h3>
              <p className='text-sm text-gray-600'>Pure, safe formulations</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Sparkles className='w-8 h-8 text-purple-600' />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Natural</h3>
              <p className='text-sm text-gray-600'>Botanical ingredients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Products Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Top Rated Products
            </h2>
            <p className='text-lg text-gray-600'>
              Highly rated products loved by our customers
            </p>
          </div>
          
          <Suspense fallback={<ProductItemsSkeleton qty={4} name='Top Rated Products' />}>
            <Slider />
          </Suspense>
        </div>
      </section>

      <Icons />

      {/* Latest Products Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <Suspense fallback={<ProductItemsSkeleton qty={8} name='Latest Products' />}>
            <ProductItems />
          </Suspense>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              What Our Customers Say
            </h2>
            <p className='text-lg text-gray-600 mb-8'>
              Real reviews from real customers who love our products
            </p>
          </div>
          <Testimonials />
          <div className='text-center mt-8'>
            <Link href='/testimonials'>
              <Button variant="outline" className='border-green-200 hover:bg-green-50'>
                Read More Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ReadMore>
        <Text />
      </ReadMore>
      </div>
    </div>
  );
};

export default HomePage;
