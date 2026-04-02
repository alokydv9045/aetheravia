import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';

export const GET = async (req: any) => {
  try {
    await dbConnect();
    const categories = await ProductModel.find().distinct('category');
    return Response.json(categories);
  } catch (err: any) {
    return Response.json({ message: err.message }, { status: 500 });
  }
};
