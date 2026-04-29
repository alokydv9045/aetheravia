import { cache } from 'react';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { Product } from '@/lib/models/ProductModel';
import OfferModel from '@/lib/models/OfferModel';

export const enhanceWithOffers = async (products: any[]): Promise<Product[]> => {
  const now = new Date();
  const activeOffers = await OfferModel.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).lean();

  return products.map(product => {
    const p = { ...product };
    // Find the offer with highest discount that applies to this product
    const applicableOffers = activeOffers.filter(offer => 
      offer.products?.some((id: any) => id.toString() === product._id.toString())
    );

    if (applicableOffers.length > 0) {
      const bestOffer = applicableOffers.reduce((prev, current) => 
        (prev.discountPercentage || 0) > (current.discountPercentage || 0) ? prev : current
      );
      
      p.activeOffer = {
        title: bestOffer.title,
        discountPercentage: bestOffer.discountPercentage || 0,
        promoCode: bestOffer.promoCode,
      };
    }
    return p as Product;
  });
};

const getLatest = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(8).lean();
  return enhanceWithOffers(products);
});

const getFeatured = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({ isFeatured: true }).limit(3).lean();
  return enhanceWithOffers(products);
});

const getBySlug = cache(async (slug: string): Promise<Product | null> => {
  await dbConnect();
  const decodedSlug = decodeURIComponent(slug);
  const product = await ProductModel.findOne({ slug: decodedSlug }).lean();
  if (!product) return null;
  const enhanced = await enhanceWithOffers([product]);
  return enhanced[0];
});

const getTopRated = cache(async (): Promise<Product[]> => {
  await dbConnect();
  const products = await ProductModel.find({}).sort({ rating: -1 }).limit(8).lean();
  return enhanceWithOffers(products);
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

    const enhancedProducts = await enhanceWithOffers(products);

    const countProducts = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    const categories = await ProductModel.find().distinct('category');

    return {
      products: enhancedProducts,
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
