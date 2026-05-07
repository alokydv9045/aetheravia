import fs from 'node:fs';
import path from 'node:path';

import Image from 'next/image';
import Link from 'next/link';

import productService from '@/lib/services/productService';

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

    // Image 3: homemade-remedy-with-cucumber.jpg - Used for body products and natural care
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

export default async function CategoriesBar() {
  let all: unknown = [];
  try {
    all = await productService.getCategories();
  } catch (error) {
    console.error('[CategoriesBar] Failed to load categories:', error);
    all = [];
  }
  const allowedCategories = ['Body Scrub', 'Body Wash', 'Face Wash'];
  const categories = Array.isArray(all) 
    ? all.filter(cat => allowedCategories.includes(cat)) 
    : [];

  return (
    <nav aria-label="Categories" className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <ul className="flex gap-6 md:gap-8 overflow-x-auto items-center py-3 scrollbar-hide">
          {categories.map((cat) => (
            <li key={cat} className="flex-shrink-0">
              <Link
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center space-y-3 text-center group"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-transparent hover:border-primary-400 transition-all duration-300 group-hover:scale-105 bg-gray-50">
                  <Image
                    src={categoryImageSrc(cat)}
                    alt={cat}
                    fill
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                    className="object-cover"
                  />
                </div>
                <span className="text-sm md:text-base font-medium text-primary group-hover:text-black transition-colors duration-300 max-w-[6rem] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{cat}</span>
              </Link>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-sm text-gray-500 py-8">No categories available</li>
          )}
        </ul>
      </div>
    </nav>
  );
}
