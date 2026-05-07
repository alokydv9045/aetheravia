import { NextRequest, NextResponse } from 'next/server';
import productService from '@/lib/services/productService';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    await dbConnect();
    
    // Extract all search parameters
    const query = {
      q: searchParams.get('q') || 'all',
      category: searchParams.get('category') || 'all',
      price: searchParams.get('price') || 'all',
      rating: searchParams.get('rating') || 'all',
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') || '1',
    };

    const result = await productService.getByQuery(query);
    
    return NextResponse.json({
      products: result.products,
      countProducts: result.countProducts,
      page: result.page,
      pages: result.pages,
      categories: result.categories
    });
  } catch (error: any) {
    console.error('[API_SEARCH_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

