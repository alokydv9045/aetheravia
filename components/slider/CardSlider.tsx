'use client';

import { useState, useEffect } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface IProducts {
  children: React.ReactNode;
}

const CardSlider = ({ children }: IProducts) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="group relative">
      <Carousel setApi={setApi} opts={{ loop: true, align: 'start' }}>
        <CarouselContent className="scroll-smooth -ml-2 md:-ml-4">
          {children}
        </CarouselContent>

        {/* Enhanced Navigation Buttons */}
        <CarouselPrevious className="absolute left-2 top-1/2 h-10 w-10 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-200 -translate-y-1/2 opacity-0 group-hover:opacity-100" />
        <CarouselNext className="absolute right-2 top-1/2 h-10 w-10 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-200 -translate-y-1/2 opacity-0 group-hover:opacity-100" />

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                index === current - 1
                  ? 'bg-green-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default CardSlider;
