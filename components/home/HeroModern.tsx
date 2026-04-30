'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroModern() {
  return (
    <section className="relative h-[calc(100vh-4rem)] min-h-[600px] flex items-center overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0" style={{ position: 'absolute' }}>
        <Image 
          src="/images/hero_hd.png"
          alt="Artisanal Heritage Skincare Textures"
          fill
          priority
          className="object-cover brightness-95"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-surface/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-headline text-5xl md:text-7xl lg:text-[4.5rem] leading-[1.1] text-primary tracking-tight mb-8"
        >
          The Earth’s <br />
          <span className="italic font-normal">Ancient</span> Wisdom.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-body text-lg md:text-xl text-surface-foreground max-w-lg mb-12 leading-relaxed opacity-90"
        >
          Crafted from the raw heritage of Multani Mitti, Sandalwood, and Reetha. 
          A sensory return to the grounded elegance of artisanal skin rituals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link 
            href="/shop"
            className="inline-block px-8 py-4 md:px-10 md:py-5 bg-primary text-white font-label text-sm uppercase tracking-widest rounded-lg transition-all hover:bg-primary-container shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Discover the Earth's Wisdom
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
  );
}
