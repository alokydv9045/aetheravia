'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01.',
    title: 'Purify with Clay',
    description: 'Apply the Multani Mitti mask to damp skin, allowing the minerals to bind with deep-seated impurities for 10 minutes.'
  },
  {
    number: '02.',
    title: 'Cleanse with Reetha',
    description: 'Rinse with warm water, massaging our Reetha bars to create a light, natural foam that clears the pores.'
  },
  {
    number: '03.',
    title: 'Seal with Sandalwood',
    description: 'Finish with the Chandan body oil to soothe the senses and lock in deep, earthy hydration.'
  }
];

export default function SkincareRitual() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 relative"
        >
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 rounded-lg shadow-2xl overflow-hidden group">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyelmvp6jX7ygHNkfdighXwQQLBbqn1iwQZSllzqgEzVLhDh3rkQ5nay_Owesji7XE0R2x-wL0Kt2oJI_NTUra4-tBNPxhJedZ5WlW3etwzVw1XocYGOc8d9kqxTtisSSG2q_YxQxWxpVJhvnRUE2EgPL8ICf1iBnLI7vpWdlwrmj8QlNaceYXL1CeR-l2hZqcaJeBxctfPUsR_HU_oTMoBTFWGjHxCtTSyL2mtmlHu3oLbhHFUPbtct9eLSoc6x_ctr4fla26E2Mf"
              alt="Artisanal Skincare Ritual"
              width={800}
              height={1000}
              className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-6 -right-2 md:-right-6 bg-surface-container p-6 md:p-8 shadow-xl z-20 hidden sm:block border border-outline-variant/20 rounded-lg backdrop-blur-sm"
          >
            <p className="font-headline italic text-xl md:text-2xl text-secondary leading-snug">
              &quot;The skin is the soul&apos;s <br /> first contact.&quot;
            </p>
          </motion.div>
        </motion.div>

        <div className="w-full md:w-1/2 space-y-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-4xl md:text-5xl text-primary leading-tight"
          >
            The Artisanal <br /> Body Ritual
          </motion.h2>

          <div className="space-y-10">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex gap-6"
              >
                <span className="font-headline text-3xl text-outline-variant/60">{step.number}</span>
                <div>
                  <h4 className="font-body font-bold text-xl text-secondary mb-2">{step.title}</h4>
                  <p className="font-body text-surface-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
