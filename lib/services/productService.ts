import { cache } from 'react';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { Product } from '@/lib/models/ProductModel';

const getLatest = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(8).lean();
  return products as unknown as Product[];
});

const getFeatured = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({ isFeatured: true }).limit(3).lean();
  return products as unknown as Product[];
});

const getBySlug = cache(async (slug: string): Promise<Product | null> => {
  await dbConnect();
  const decodedSlug = decodeURIComponent(slug);
  const product = await ProductModel.findOne({ slug: decodedSlug }).lean();
  return product as unknown as Product | null;
});

const getTopRated = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({}).sort({ rating: -1 }).limit(8).lean();
  return products as unknown as Product[];
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
    await dbConnect();

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
    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};

    const order =
      sort === 'lowest'
        ? { price: 1 }
        : sort === 'highest'
        ? { price: -1 }
        : sort === 'toprated'
        ? { rating: -1 }
        : { createdAt: -1 };

    const pageSize = 12;
    const products = await ProductModel.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(order as any)
      .skip(pageSize * (Number(page) - 1))
      .limit(pageSize)
      .lean();

    const countProducts = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    const categories = await ProductModel.find().distinct('category');

    return {
      products: products as unknown as Product[],
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories: categories as string[],
    };
  }
);

const getCategories = cache(async (): Promise<string[]> => {
  await dbConnect();
  const categories = await ProductModel.find().distinct('category');
  return categories as string[];
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
