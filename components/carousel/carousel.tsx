// Server component that prepares carousel items.
// It combines featured product banners (when available) with every image
// under public/images/banner. The actual carousel UI + autoplay lives in
// the client-only component (CarouselClient).

import CarouselClient from './CarouselClient';
import { headers } from 'next/headers';


const Carousel = async () => {
  let items: Array<{ key: string; href: string; src: string; alt: string }> = [];
  let error = null;
  try {
    // Build absolute URL for server-side fetch
    const h = headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;
    const res = await fetch(`${baseUrl}/api/carousel`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch banners');
    items = await res.json();
  } catch (err) {
    error = (err as Error).message;
  }

  if (error) {
    return (
      <div className="flex flex-col h-64 items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-red-500 mb-2">Error loading banners: {error}</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col h-64 items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-gray-400 mb-2">No banners found. Add banners from the admin panel.</span>
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
