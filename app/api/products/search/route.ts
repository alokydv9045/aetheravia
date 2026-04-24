import { NextRequest, NextResponse } from 'next/server';
import productService from '@/lib/services/productService';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'all';

  try {
    await dbConnect();
    const result = await productService.getByQuery({
      q,
      category: 'all',
      price: 'all',
      rating: 'all',
      sort: 'newest',
      page: '1',
    });
    
    return NextResponse.json(result.products);
  } catch (error: any) {
    console.error('[API_SEARCH_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
