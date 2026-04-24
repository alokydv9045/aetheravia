'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="lg:col-span-5 flex flex-col md:flex-row gap-6 relative">
      {/* Thumbnail Column */}
      <div className="order-2 md:order-1 flex md:flex-col gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx}
            onMouseEnter={() => setActiveImage(img)}
            onClick={() => setActiveImage(img)}
            className={`w-16 h-20 md:w-20 md:h-24 bg-surface-container rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === img ? 'ring-2 ring-primary opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <Image 
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              width={80}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Main Hero Image */}
      <div className="order-1 md:order-2 flex-grow relative">
        <div className="rounded-lg overflow-hidden bg-surface-container-low aspect-[3/4] relative max-w-full">
          <Image 
            src={activeImage}
            alt="Product View"
            fill
            className="w-full h-full object-cover transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
          />
        </div>
        {/* Offset Caption (Editorial Rule) */}
        <div className="absolute -bottom-4 -right-4 md:-right-8 bg-surface-container-lowest p-6 max-w-[240px] shadow-2xl rounded-lg z-10 border border-outline-variant/10">
          <p className="font-headline italic text-primary text-sm leading-tight">
             The art of pure earth and elemental curation.
          </p>
        </div>
      </div>
    </div>
  );
}
