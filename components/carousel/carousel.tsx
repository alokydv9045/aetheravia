// Server component that prepares carousel items.
// It combines featured product banners (when available) with every image
// under public/images/banner. The actual carousel UI + autoplay lives in
// the client-only component (CarouselClient).

import CarouselClient from './CarouselClient';
import dbConnect from '@/lib/dbConnect';
import BannerModel from '@/lib/models/BannerModel';

const Carousel = async () => {
  let items: Array<{ key: string; href: string; src: string; alt: string }> = [];
  let error = null;

  try {
    await dbConnect();
    // Fetch active banners directly from DB instead of using internal HTTP fetch
    const banners = await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    if (banners && banners.length > 0) {
      items = banners.map((banner) => ({
        key: banner._id.toString(),
        href: banner.link || '/shop',
        src: banner.image,
        alt: banner.title || 'Banner',
      }));
    } else {
      // Use default banners if none are found in DB
      items = [
        {
          key: 'banner0',
          href: '/shop',
          src: '/images/banner/banner0.jpg',
          alt: 'Aetheravia - Natural Skincare Collection',
        },
        {
          key: 'banner1',
          href: '/about',
          src: '/images/banner/banner1.jpg',
          alt: 'Sustainable Beauty Products',
        },
        {
          key: 'banner2',
          href: '/ingredients',
          src: '/images/banner/banner2.jpg',
          alt: 'Pure Natural Ingredients',
        },
      ];
    }
  } catch (err) {
    error = (err as Error).message;
    console.error('[Carousel] Error loading banners:', error);
  }

  if (error) {
    return (
      <div className="flex flex-col h-64 items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-red-500 mb-2">Error loading banners. Using default view.</span>
      </div>
    );
  }

  return <CarouselClient items={items} />;
};

export default Carousel;

export const CarouselSkeleton = () => {
  // Lightweight skeleton used as a Suspense fallback while server data is loading.
  return <div className='skeleton h-[304px] w-full rounded-lg lg:h-[536px]' />;
};
