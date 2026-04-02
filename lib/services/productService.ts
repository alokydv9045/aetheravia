import { cache } from 'react';

import data from '@/lib/data';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { Product } from '@/lib/models/ProductModel';

const ensureSeeded = async () => {
  try {
    const count = await ProductModel.countDocuments();
    if (count === 0 && process.env.NODE_ENV !== 'production') {
      await ProductModel.insertMany(data.products as any);
    }
  } catch (e) {
    console.warn('ensureSeeded skipped:', (e as any)?.message);
  }
};

// Latest should not be long-lived cached; fetch fresh to reflect new items
const getLatest = async (): Promise<Product[]> => {
  try {
    await dbConnect();
    await ensureSeeded();
    const products = await ProductModel.find({})
      .sort({ _id: -1 })
      .limit(8)
      .lean();
    return products as unknown as Product[];
  } catch (err) {
    console.error('getLatest error:', err);
    return [];
  }
};

const getTopRated = cache(async (): Promise<Product[]> => {
  try {
    await dbConnect();
    await ensureSeeded();
    const products = await ProductModel.find({})
      .sort({ rating: -1 })
      .limit(8)
      .lean();
    return products as unknown as Product[];
  } catch (err) {
    console.error('getTopRated error:', err);
    return [];
  }
});

// intentionally disable Next.js Cache to better demo
const getFeatured = async (): Promise<Product[]> => {
  await dbConnect();
  await ensureSeeded();
  const products = await ProductModel.find({ isFeatured: true })
    .limit(3)
    .lean();
  return products as unknown as Product[];
};

const getBySlug = cache(async (slug: string): Promise<Product | null> => {
  await dbConnect();
  await ensureSeeded();
  const product = await ProductModel.findOne({ slug }).lean();
  return product as unknown as Product | null;
});

const PAGE_SIZE = 3;
const getByQuery = cache(
  async ({
    q,
    category,
    sort,
    price,
    rating,
    page = '1',
  }: {
    q: string;
    category: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }): Promise<{
    products: Product[];
    countProducts: number;
    page: string;
    pages: number;
    categories: string[];
  }> => {
    await dbConnect();
  await ensureSeeded();

    const queryFilter =
      q && q !== 'all'
        ? {
            name: {
              $regex: q,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    // 10-50
    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const order: Record<string, 1 | -1> =
      sort === 'lowest'
        ? { price: 1 }
        : sort === 'highest'
          ? { price: -1 }
          : sort === 'toprated' || sort === 'rating'
            ? { rating: -1 }
            : { _id: -1 };

    const categories = (await ProductModel.find().distinct('category')) as unknown as string[];
    const pageNum = Math.max(1, Number.parseInt(page) || 1);
    const products = await ProductModel.find(
      {
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
      },
      '-reviews',
    )
      .sort(order)
      .skip(PAGE_SIZE * (pageNum - 1))
      .limit(PAGE_SIZE)
      .lean();

    const countProducts = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    return {
      products: products as unknown as Product[],
      countProducts,
      page: String(pageNum),
      pages: Math.max(1, Math.ceil(countProducts / PAGE_SIZE)),
      categories,
    };
  },
);

const getCategories = cache(async (): Promise<string[]> => {
  await dbConnect();
  await ensureSeeded();
  const categories = await ProductModel.find().distinct('category');
  return categories as unknown as string[];
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
