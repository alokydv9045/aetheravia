'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const ingredients = [
  {
    title: 'Multani Mitti',
    subtitle: 'Mineral Purifier',
    description: "Fuller's Earth, the cooling clay that draws out impurities while preserving the skin's natural moisture barrier.",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB47P0KJePXXKyE549X8Gn_fzTbAlm9uwI7_YsFYqQIpvMyKahHnzXInP90AqlWRuNRy3Pvg0p0bURp-pfBPY8C4caJ4yEDy3MtAJJoU7aH8fmLuGr_dBwVTXG1U46kGX1IkPuuq2pTxsM1yV_GK1DQ6B-htRRk1a0BwXbmvQc1Y8BwIt5szEWJCCTYbahfnPppPDjVVuo9HNdJC8kKgzcK_UoZtA6uowhtjMlwRfsWe2yO4dwhg20dTY34nC9p3wiLvaojTSAzFFk5',
    tag: 'Mineral Purifier'
  },
  {
    title: 'Chandan',
    subtitle: 'Sacred Grounding',
    description: 'Sandalwood paste provides a divine, woody scent and potent anti-inflammatory properties for a velvet-smooth finish.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUA9rQ-DIcSzVmk4qjmSFoH5ON0pxjpvCtE-NVqLyNVpP0MthJJD_cRIfRXYaiUNLy7fzlfp6C-rUlUaWPP0XbqgLZzv3GZyH9jGxvqoznq3kE5TFdv5x1-ZU08ue-hqBDwAvVH8hygR4wPz7wHrqMDH0AbXp8dBrxJhBI5XEyccBcnw9ybzZC03_85B1uof8AIvqr5psI6MRSUTQ7sx66Zwzk9RzjosdLzUaAw_cOK8bJC1Dzy5GCHM2La4j6rdJ1X3KBVFCcKe8b',
    tag: 'Sacred Grounding',
    marginTop: true
  },
  {
    title: 'Reetha',
    subtitle: "Nature's Lather",
    description: 'Soapnuts offer a chemical-free, natural surfactant that gently cleanses without stripping the skin\'s essential oils.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC04NUM7hOpQvhNLr_nnqhCZo2UwzQnx2ATVou2KlOFsAbuZjIJrB-_tvwopItVSpr31LKf96EqRCKVNdGeRS0Bo44kELeNSMZlMh3Otm2YQHvZyzB5W_geABAnwXEEVEZP7qQmkDuLBFdVgaVs8pd-Bn2rGVFJPE5t7JJhCVNlbyTD-6Xo4BpHpPnXG5W_63zL5JG0GrhOdQMUrlTW1ZqQR98I906Mk43kXFRpdWwO6MHDbkVS5309-J72XP8VNHzJepqI1BWhXxXP',
    tag: "Nature's Lather"
  }
];

export default function IngredientGallery() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-baseline mb-24 gap-8"
        >
          <h2 className="font-headline text-4xl md:text-5xl text-secondary">The Elemental Three</h2>
          <p className="font-body text-surface-foreground/70 max-w-md italic border-l-2 border-outline-variant pl-6 leading-relaxed">
            We don&apos;t formulate; we curate. Our products are built around the three pillars of Indian heritage body care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {ingredients.map((ing, idx) => (
            <motion.div 
              key={ing.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`group ${ing.marginTop ? 'md:mt-12' : ''}`}
            >
              <div className="mb-8 overflow-hidden rounded-lg bg-surface relative shadow-sm transition-shadow hover:shadow-md">
                <Image 
                  src={ing.image}
                  alt={ing.title}
                  width={600}
                  height={800}
                  className="w-full h-80 lg:h-96 object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute -bottom-4 -right-2 bg-secondary/90 text-white px-6 py-2 rounded-full font-label text-xs uppercase tracking-tighter backdrop-blur-sm shadow-lg">
                  {ing.tag}
                </div>
              </div>
              <h3 className="font-headline text-2xl md:text-3xl text-primary mb-4">{ing.title}</h3>
              <p className="font-body text-surface-foreground/80 leading-relaxed text-sm md:text-base">
                {ing.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
