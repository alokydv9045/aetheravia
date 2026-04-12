'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const products = [
  {
    id: 'earth-mask',
    name: 'The Earth Mask',
    subtitle: 'Multani Mitti & Rose Water',
    price: '₹2,450',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9UJpAid5876tK8sTKFXNRng7ynaxSso8Zg-KoKIgc2ma5ocoMStzjTRJPb_zsYjQS0uE7c05qWRrCbG3vKYTeM3zNzkIrYsFBpHTqqaBVOCwawJhKlMNrFCvQ6uK0MIyJQ9p1XrrjG5HrFXqWrI7dbH2AUQVi__a38ZXw8zCLrCcbFZ1cD2K_uAFxXHby9GVbTJ5NInh2h8060D4_yrjP6ej7uDsZWICNm6YEdw5myH4ZKMppwieTbws_d9_fmZcNW4AcigWi1PxV',
    featured: true
  },
  {
    id: 'reetha-scrub',
    name: 'Reetha Scrub Bar',
    subtitle: 'Daily exfoliating cleanser',
    price: '₹850',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX6msTGrtEwmE9h6SdvRJfV7UXtwGWAtFR2shpObXIe3PZvmCR6ZRCaSTv-XMDaCKpbG3XhQtaKLPcgD6WS3HD5rX2zDtajDxgYVf5KzmsdVddq8ilAoLocDvV4lOiMOhZVp568e-q10VVEnJgJcEyMzHbbDztg5_FScKNE0SswhZIXQhyZ1TwkiWqJNC9PaeuYjeWrvFk2y7rD-fMW7NqafZ5BqoHbsjK0ch9um6INou34jxycJRHqzliVJ1zDzLi8riJ8ITQlEkO'
  },
  {
    id: 'chandan-mist',
    name: 'Chandan Mist',
    price: '₹1,200',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq8MTpOfw3AgWQEiSXX7s7TxXJcSx43e9QTCRbAQbDRdd-tgYrt8h28rwAHtROcCcH3pnfYHququ0NlEiEqg3dJnSJbRVCLVkwZyqVI90Tab8bacTuFR_c4iMc6fLiXGJedeBAvsJwjBSdPz0eIutFdJUZEVUg6uXPtRXimgEutgCm_sIVQ-4lj6oYYUwJpvid1zk-utVXZa37R3SVQrOtjYSoIRUfEiR7b3woY_imExJTTrj8KHTfon62CFS8JIZGlWZW9fZSOKZ6',
    small: true
  }
];

export default function BentoProductGrid() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 bg-surface-container-highest">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="font-headline text-4xl md:text-5xl text-primary mb-6">The Clay Collection</h2>
          <p className="font-body text-surface-foreground/60 tracking-widest uppercase text-xs">
            Curated sets for the modern heritage seeker
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[400px] md:h-[850px]">
          {/* Large Featured Product */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 bg-surface p-8 md:p-12 flex flex-col justify-between group rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5"
          >
            <div className="overflow-hidden mb-8 h-full flex items-center justify-center">
              <Image 
                src={products[0].image}
                alt={products[0].name}
                width={800}
                height={800}
                className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="font-headline text-3xl md:text-4xl text-secondary mb-2">{products[0].name}</h3>
                  <p className="font-label text-primary font-semibold text-sm">{products[0].subtitle}</p>
                </div>
                <span className="font-headline text-2xl text-primary">{products[0].price}</span>
              </div>
              <button className="w-full py-4 bg-primary text-white font-label text-xs uppercase tracking-widest rounded-lg hover:bg-primary-container transition-all shadow-md hover:shadow-lg">
                Add to Bag
              </button>
            </div>
          </motion.div>

          {/* Secondary Product 1 (Wide) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-surface p-8 flex gap-8 items-center rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 border border-black/5"
          >
            <div className="w-1/3 overflow-hidden rounded-lg bg-surface-container-low">
              <Image 
                src={products[1].image}
                alt={products[1].name}
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            <div className="w-2/3">
              <h3 className="font-headline text-2xl text-secondary mb-1">{products[1].name}</h3>
              <p className="font-body text-sm text-surface-foreground/60 mb-4">{products[1].subtitle}</p>
              <p className="font-headline text-lg text-primary mb-6">{products[1].price}</p>
              <Link 
                href="/shop"
                className="inline-block text-xs font-label uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:text-secondary hover:border-secondary transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>

          {/* Secondary Product 3 (Small Vertical/Square) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 bg-surface-container-low p-8 flex flex-col justify-between rounded-xl shadow-sm hover:shadow-lg transition-all border border-black/5"
          >
            <div className="h-40 flex items-center justify-center">
              <Image 
                src={products[2].image}
                alt={products[2].name}
                width={200}
                height={200}
                className="w-auto h-full object-contain hover:rotate-6 transition-transform"
              />
            </div>
            <div>
              <h3 className="font-headline text-xl text-secondary mb-1">{products[2].name}</h3>
              <p className="font-headline text-lg text-primary">{products[2].price}</p>
            </div>
          </motion.div>

          {/* Call to Action Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 bg-primary p-8 flex flex-col justify-center items-center text-center rounded-xl shadow-lg border border-primary-container"
          >
            <Sparkles className="text-white w-12 h-12 mb-6" />
            <h3 className="font-headline text-xl text-white mb-2">Gift the Heritage</h3>
            <p className="text-white/80 font-body text-sm mb-8 leading-relaxed">
              Curated gift boxes wrapped in handcrafted handmade paper.
            </p>
            <Link 
              href="/shop"
              className="bg-white text-primary px-8 py-3 rounded-full font-label text-xs uppercase tracking-widest font-bold hover:bg-surface transition-colors"
            >
              Explore Sets
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
