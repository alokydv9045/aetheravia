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
      <div className='flex flex-col gap-6 md:gap-10'>
        {/* Brand Intro Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-[#2D4B3C] mb-6'>
              Organic Cosmetic, Natural brand
            </h2>
            <p className='text-lg text-[#2D4B3C] mb-8'>
              AETHRAVIA is a skincare/body care brand that promotes sustainable, eco-friendly, 
              cruelty-free, and toxic-free products, catering to health-conscious consumers who 
              seek natural, effective solutions for radiant skin.
            </p>
          </div>
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:bg-[#2D4B3C] group cursor-default shadow-sm border border-gray-100'>
                <Leaf className='w-8 h-8 text-[#2D4B3C] transition-colors group-hover:text-white' />
              </div>
              <h3 className='font-semibold text-[#2D4B3C] mb-2'>Eco-Friendly</h3>
              <p className='text-sm text-[#2D4B3C]'>Sustainably sourced ingredients</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:bg-[#2D4B3C] group cursor-default shadow-sm border border-gray-100'>
                <Heart className='w-8 h-8 text-[#2D4B3C] transition-colors group-hover:text-white' />
              </div>
              <h3 className='font-semibold text-[#2D4B3C] mb-2'>Cruelty-Free</h3>
              <p className='text-sm text-[#2D4B3C]'>Never tested on animals</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:bg-[#2D4B3C] group cursor-default shadow-sm border border-gray-100'>
                <ShieldCheck className='w-8 h-8 text-[#2D4B3C] transition-colors group-hover:text-white' />
              </div>
              <h3 className='font-semibold text-[#2D4B3C] mb-2'>Toxic-Free</h3>
              <p className='text-sm text-[#2D4B3C]'>Pure, safe formulations</p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:bg-[#2D4B3C] group cursor-default shadow-sm border border-gray-100'>
                <Sparkles className='w-8 h-8 text-[#2D4B3C] transition-colors group-hover:text-white' />
              </div>
              <h3 className='font-semibold text-[#2D4B3C] mb-2'>Natural</h3>
              <p className='text-sm text-[#2D4B3C]'>Botanical ingredients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Products Section */}
      <section className='pt-16 pb-0 bg-white'>
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

      {/* Latest Products Section */}
      <section className='pt-0 pb-16 bg-white'>
        <div className='container mx-auto px-4'>
          <Suspense fallback={<ProductItemsSkeleton qty={8} name='Latest Products' />}>
            <ProductItems />
          </Suspense>
        </div>
      </section>

      <Icons />

      {/* Testimonials Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              See How We Earned these Stars
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
