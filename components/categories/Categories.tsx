import fs from 'node:fs';
import path from 'node:path';

import Image from 'next/image';
import Link from 'next/link';

import productService from '@/lib/services/productService';

import Overlay from './Overlay';

const categoriesDir = path.join(process.cwd(), 'public', 'images', 'categories');

function categoryImageSrc(name: string) {
  // Map category names to available images (reusing images for multiple categories)
  const categoryImageMap: { [key: string]: string } = {
    // Image 1: cosmetics-wooden-board.jpg - Used for cleansing products
    'Face Wash': 'cosmetics-wooden-board.jpg',
    'Cleansers': 'cosmetics-wooden-board.jpg',

    // Image 2: high-angle-selection-powders-bowls.jpg - Used for serums and treatments
    'Serums': 'high-angle-selection-powders-bowls.jpg',
    'Exfoliators': 'high-angle-selection-powders-bowls.jpg',

    // Image 3: homemade-remedy-with-cucumber.jpg - Used for body products and natural colour
    'Body Scrub': 'homemade-remedy-with-cucumber.jpg',
    'Body Wash': 'homemade-remedy-with-cucumber.jpg',
    'Night Care': 'homemade-remedy-with-cucumber.jpg',

    // Image 4: top-view-organic-dye-pigment.jpg - Used for moisturizers and protection
    'Moisturizers': 'top-view-organic-dye-pigment.jpg',
    'Sunscreen': 'top-view-organic-dye-pigment.jpg',

    // Image 5: top-view-sour-green-plums-wooden-bowl-sliced-plums-with-kitchen-knife-salt-saucer-rustic-table.jpg - Used for eye care and combos
    'Eye Care': 'top-view-sour-green-plums-wooden-bowl-sliced-plums-with-kitchen-knife-salt-saucer-rustic-table.jpg',
    'Combo Packs': 'top-view-sour-green-plums-wooden-bowl-sliced-plums-with-kitchen-knife-salt-saucer-rustic-table.jpg',
  };

  // Check if we have a direct mapping
  if (categoryImageMap[name]) {
    return `/images/categories/${categoryImageMap[name]}`;
  }

  // Fallback to the old logic for any unmapped categories
  const base = name.replace(/\s+/g, '');
  const webp = path.join(categoriesDir, `${base}.webp`);
  const jpg = path.join(categoriesDir, `${base}.jpg`);
  if (fs.existsSync(webp)) return `/images/categories/${base}.webp`;
  if (fs.existsSync(jpg)) return `/images/categories/${base}.jpg`;

  // Final fallback - use the first available image
  return '/images/categories/cosmetics-wooden-board.jpg';
}

export default async function Categories() {
  let all: unknown = [];
  try {
    all = await productService.getCategories();
  } catch (error) {
    console.error('[Categories] Failed to load categories:', error);
    all = [];
  }
  const allowedCategories = ['Body Scrub', 'Body Wash', 'Face Wash'];
  const categories = Array.isArray(all) 
    ? all.filter(cat => allowedCategories.includes(cat)) 
    : [];
  return (
    <div className='grid auto-rows-[300px] grid-cols-2 gap-4 md:auto-rows-[330px] md:grid-cols-4'>
      {categories.map((cat, idx) => (
        <Link
          key={cat}
          href={`/shop?category=${encodeURIComponent(cat)}`}
          className={`group relative col-span-2 overflow-hidden ${idx === 0 ? 'row-span-1 md:row-span-2' : ''}`}
        >
          <Image
            src={categoryImageSrc(cat)}
            alt={`Collection of ${cat.toLowerCase()}`}
            width={500}
            height={500}
            className='h-full w-full object-cover'
            {...(idx === 0
              ? { priority: true }
              : { loading: 'lazy' })}
          />
          <Overlay category={cat} />
        </Link>
      ))}
      {categories.length === 0 && (
        <div className='col-span-2 rounded-lg bg-base-300 p-8 text-center md:col-span-4'>
          No categories found.
        </div>
      )}
    </div>
  );
}
