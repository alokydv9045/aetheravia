import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import productService from '@/lib/services/productService';

export const GET = async (req: any) => {
  try {
    await dbConnect();
    const categories = await productService.getCategories();
    return Response.json(categories);
  } catch (err: any) {
    console.error('[API_CATEGORIES_ERROR]', err);
    return Response.json({ message: err.message }, { status: 500 });
  }
};
