import { Metadata } from 'next';
import { Suspense } from 'react';
import HeroModern from '@/components/home/HeroModern';
import IngredientGallery from '@/components/home/IngredientGallery';
import SkincareRitual from '@/components/home/SkincareRitual';
import Newsletter from '@/components/home/Newsletter';
import Slider from '@/components/slider/Slider';
import ProductItems, { ProductItemsSkeleton } from '@/components/products/ProductItems';
import TrustBarModern from '@/components/home/TrustBarModern';

export const metadata: Metadata = {
  title: 'Aethravia | Artisanal Heritage Body Care',
  description: 'Grounded elegance for the modern heritage seeker. Discover artisanal skin rituals crafted from Multani Mitti, Sandalwood, and Reetha.',
};

const HomePage = () => {
  return (
    <div className='flex flex-col bg-surface'>
      {/* Hero Section: Ancient Wisdom */}
      <HeroModern />

      {/* Key Ingredients: The Elemental Three */}
      <IngredientGallery />

      {/* Artisanal Rituals Section */}
      <SkincareRitual />

      {/* Top Rated Products Section */}
      <section className='pt-24 pb-8 bg-surface'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='font-headline text-4xl md:text-5xl text-primary mb-4'>
              Top Rated Products
            </h2>
            <p className='font-body text-lg text-surface-foreground/60 italic'>
              Highly rated products loved by our customers
            </p>
          </div>
          
          <Suspense fallback={<ProductItemsSkeleton qty={4} name='Top Rated Products' />}>
            <Slider />
          </Suspense>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className='pt-8 pb-24 bg-surface'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='font-headline text-4xl md:text-5xl text-primary mb-4'>
              New Arrivals
            </h2>
            <p className='font-body text-lg text-surface-foreground/60 italic'>
              Discover our latest artisanal formulations
            </p>
          </div>
          <Suspense fallback={<ProductItemsSkeleton qty={8} name='Latest Products' />}>
            <ProductItems />
          </Suspense>
        </div>
      </section>

      {/* Trust & Heritage Values */}
      <TrustBarModern />

      {/* Newsletter / Editorial Section */}
      <Newsletter />
    </div>
  );
};

export default HomePage;
