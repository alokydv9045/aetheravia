import { cache } from 'react';
import type { Product } from '@/lib/models/ProductModel';

const mockProducts: any[] = [
  {
    _id: "60c72b2f9b1d8b001c8e4a91",
    name: "Vitamin C Brightening Face Wash",
    slug: "vitamin-c-brightening-face-wash",
    category: "Face Wash",
    image: "/images/products/serum-bottle-with-yellow-background.jpg",
    price: 15.5,
    brand: "AETHRAVIA",
    countInStock: 75,
    description: "PHA/AHA blend exfoliator that smooths skin texture and promotes cell turnover with minimal irritation.",
    rating: 4.4,
    numReviews: 48,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "60c72b2f9b1d8b001c8e4a92",
    name: "Overnight Repair Night Cream",
    slug: "overnight-repair-night-cream",
    price: 34.0,
    brand: "AETHRAVIA",
    category: "Night Care",
    image: "/images/products/spa-arrangement-with-cremes.jpg",
    countInStock: 60,
    description: "Rich night cream with peptides and ceramides to support skin recovery while you sleep.",
    rating: 4.7,
    numReviews: 81,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "60c72b2f9b1d8b001c8e4a93",
    name: "Revitalizing Eye Cream",
    slug: "revitalizing-eye-cream",
    price: 22.0,
    brand: "AETHRAVIA",
    category: "Eye Care",
    image: "/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg",
    countInStock: 90,
    description: "Lightweight eye cream to reduce puffiness and brighten dark circles over time.",
    rating: 4.3,
    numReviews: 34,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "60c72b2f9b1d8b001c8e4a94",
    name: "Gentle Exfoliating Gel",
    slug: "gentle-exfoliating-gel",
    price: 18.0,
    brand: "AETHRAVIA",
    category: "Exfoliators",
    image: "/images/products/cosmetics-composition-with-serum-bottles.jpg",
    countInStock: 50,
    description: "Gentle exfoliating gel.",
    rating: 4.5,
    numReviews: 24,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const getLatest = async (): Promise<Product[]> => {
  return mockProducts as unknown as Product[];
};

const getTopRated = cache(async (): Promise<Product[]> => {
  return [...mockProducts].sort((a, b) => b.rating - a.rating) as unknown as Product[];
});

const getFeatured = async (): Promise<Product[]> => {
  return mockProducts.filter((p) => p.isFeatured) as unknown as Product[];
};

const getBySlug = cache(async (slug: string): Promise<Product | null> => {
  const product = mockProducts.find((p) => p.slug === slug);
  return (product || null) as unknown as Product | null;
});

const getByQuery = cache(
  async ({
    q,
    category,
    sort,
    price,
    rating,
    page = '1',
  }: any): Promise<{
    products: Product[];
    countProducts: number;
    page: string;
    pages: number;
    categories: string[];
  }> => {
    let results = [...mockProducts];
    
    if (q && q !== 'all') {
      results = results.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    }
    if (category && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }
    
    return {
      products: results as unknown as Product[],
      countProducts: results.length,
      page: '1',
      pages: 1,
      categories: [...new Set(mockProducts.map((p) => p.category))],
    };
  },
);

const getCategories = cache(async (): Promise<string[]> => {
  const categories = [...new Set(mockProducts.map((p) => p.category))];
  return categories;
});

const productService = {
  getLatest,
  getFeatured,
  getBySlug,
  getByQuery,
  getCategories,
  getTopRated,
};

export default productService;

export const revalidate = 3600;
