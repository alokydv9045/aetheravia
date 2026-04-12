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

      {/* Top Rated & New Arrivals Sliders */}
      <section className="py-24 px-4 md:px-12 max-w-screen-2xl mx-auto space-y-32">
        <Suspense fallback={<ProductItemsSkeleton qty={4} layout="slider" />}>
          <ProductItems 
            layout="slider" 
            title="Signature" 
            highlight="Favorites" 
            sort="topRated"
          />
        </Suspense>

        <Suspense fallback={<ProductItemsSkeleton qty={4} layout="slider" />}>
          <ProductItems 
            layout="slider" 
            title="Recent" 
            highlight="Harvest" 
            sort="latest"
          />
        </Suspense>
      </section>

      {/* Trust & Heritage Values */}
      <TrustBarModern />

      {/* Artisanal Rituals Section */}
      <SkincareRitual />

      {/* Newsletter / Editorial Section */}
      <Newsletter />
    </div>
  );
};

export default HomePage;
