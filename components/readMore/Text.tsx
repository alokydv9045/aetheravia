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
        Clean beauty is at the heart of everything we do. Our sustainably sourced
        ingredients and eco-conscious packaging result in powerful, gentle formulations
        that respect both your skin and the environment. Enjoy personalized skincare
        consultations—from skin analysis to custom routine building—designed to make
        every product recommendation perfectly suited to your unique needs.
      </p>

      <p className='mb-4'>
        Join our exclusive skincare community for rewards, early access to new launches,
        and invitations to wellness events. Discover AetherAvia&apos;s curated
        skincare collections, where sustainability, science, and natural beauty
        come together.
      </p>

      <h2 className='mb-2 text-2xl font-semibold'>
        Discover Exclusive Skincare Collections at {BRAND}
      </h2>

      <p className='mb-4'>
        Uncover limited-edition botanical formulations that embody purity and
        effectiveness. Our exclusive collections feature clinically-tested ingredients and
        artisanal blends, offering the ultimate in natural, results-driven skincare.
      </p>

      <p className='mb-4'>
        Through partnerships with renowned botanists and dermatologists, we deliver innovative
        formulations that set the standard for clean beauty. Elevate
        your skincare routine with AetherAvia and enjoy a wellness experience like no
        other.
      </p>

      <p className='mb-4'>
        Join us today and discover your perfect skincare routine for healthy,
        radiant skin.
      </p>
    </div>
  );
};

export default Text;
