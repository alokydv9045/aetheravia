'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroModern() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2LEby-DgpY40EkgslE_4tps9OT-8d3Z8MyCBFTkaNp3HvXYaYYtrSod8UpqQr24P8HOgbrbal_D4k7ihH4ETeJVkoDOa5UFptj5pDS6a8er5sn1Easr6IRr3UbP19zDT0hiwRdqIFq4E2LYpHr0EIJxDNH4ECk_4DPuMyh3ecQkQey6DYg2thvaHNCkvquAvLNsRJjKT2asWZ2l108CEzNtTZi72njPpLpVxKfmKXZDbFpLsBmJM9SayAeD9tyCjc_o6RrsMbkIkY"
          alt="Ancient Heritage Textures"
          fill
          priority
          className="object-cover brightness-95"
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
