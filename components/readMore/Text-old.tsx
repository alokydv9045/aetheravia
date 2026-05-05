import React from 'react';

const Text = () => {
  const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'AetherAvia';
  const TAGLINE = process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Embrace the earth, unveil your personality';
  return (
    <div>
      <h1 className='mb-4 text-3xl font-bold'>
        {BRAND}: {TAGLINE}
      </h1>

      <h2 className='mb-2 text-2xl font-semibold'>
        Where Natural Beauty Meets Modern Skincare
      </h2>

      <p className='mb-4'>
        At {BRAND}, we blend nature&apos;s wisdom with cutting-edge skincare science. Our curated
        collection features gentle cleansers, potent serums, nourishing moisturizers, and protective
        sunscreens—each product carefully formulated to reveal your skin&apos;s natural radiance.
        Crafted from ethically sourced botanical ingredients with proven efficacy,
        our formulations offer both luxury and results for every skin type.
      </p>

      <p className='mb-4'>
        Explore our comprehensive skincare collections, from morning essentials to evening rituals,
        all delivered with expert guidance for a personalized skincare journey.
        Stay ahead of skincare innovations with new launches and enjoy priority
        access to limited-edition formulations and exclusive skincare consultations by
        subscribing to our newsletter.
      </p>

      <p className='mb-4 font-medium'>
        AetherAvia: Where earth-inspired formulations meet personalized skincare solutions.
      </p>

      <h2 className='mb-2 text-2xl font-semibold'>
        Why Choose {BRAND}?
      </h2>

      <p className='mb-4'>
        Conscious luxury is at the heart of everything we do. Our ethically
        sourced materials and sustainable practices result in timeless, high-
        quality pieces that transcend trends. Enjoy personalized service—from
        expert styling advice to complimentary alterations—designed to make
        every purchase effortless and memorable.
      </p>

      <p className='mb-4'>
  Join our exclusive VIP membership for rewards, early access to sales,
  and invitations to private events. Discover AetherAvia’s curated
  collections, where sustainability, craftsmanship, and personal style
  come together.
      </p>

      <h2 className='mb-2 text-2xl font-semibold'>
        Discover Exclusive Collections at {BRAND}
      </h2>

      <p className='mb-4'>
        Uncover limited-edition luxury pieces that embody sophistication and
        rarity. Our exclusive collections feature couture-inspired designs and
        bespoke accessories, offering the ultimate in unique, high-end fashion.
      </p>

      <p className='mb-4'>
        Through partnerships with renowned designers, we deliver innovative
        collections that set the standard for contemporary elegance. Elevate
  your personal style with AetherAvia and enjoy a shopping experience like no
  other.
      </p>

      <p className='mb-4'>
        Join us today and discover your perfect expression of luxury and
        confidence.
      </p>
    </div>
  );
};

export default Text;
