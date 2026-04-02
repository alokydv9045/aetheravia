'use client';

import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

import {
  Carousel as SCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type Item = { key: string; href: string; src: string; alt: string };

export default function CarouselClient({ items }: { items: Item[] }) {
  return (
    <SCarousel
      opts={{ loop: true, duration: 15 }}
      plugins={[
        Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true }),
      ]}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.key}>
            <div className='w-full overflow-hidden rounded-lg h-[304px] lg:h-[536px]'>
              <Link href={item.href}>
                <Image
                  src={/^(\/|https?:)/.test(item.src) ? item.src : '/images/banner/banner0.jpg'}
                  className='w-full h-full object-cover'
                  width={1500}
                  height={536}
                  alt={item.alt}
                  sizes='(max-width: 1024px) 100vw, 1500px'
                  priority
                  style={{ width: '100%', height: '100%' }}
                />
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='absolute left-4 top-1/2' />
      <CarouselNext className='absolute right-4 top-1/2' />
    </SCarousel>
  );
}
