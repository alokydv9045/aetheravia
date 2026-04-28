import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import { revalidatePath } from 'next/cache';

export const GET = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  await dbConnect();
  const product = await ProductModel.findById(params.id);
  if (!product) {
    return Response.json(
      { message: 'product not found' },
      {
        status: 404,
      },
    );
  }
  return Response.json(product);
}) as any;

export const PUT = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }

  const {
    name,
    slug,
    price,
    category,
    image,
    images,
    brand,
    countInStock,
    description,
    mlQuantity,
  } = await req.json();

  try {
    await dbConnect();

    const product = await ProductModel.findById(params.id);
    if (product) {
      product.name = name;
      product.slug = slug;
      product.price = price;
      product.category = category;
      product.image = image;
      product.images = images;
      product.brand = brand;
      product.countInStock = countInStock;
      product.description = description;
      product.mlQuantity = mlQuantity;

      const updatedProduct = await product.save();
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/admin/products');
      return Response.json(updatedProduct);
    } else {
      return Response.json(
        { message: 'Product not found' },
        {
          status: 404,
        },
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      },
    );
  }
}) as any;

export const DELETE = auth(async (...args: any) => {
  const [req, { params: paramsPromise }] = args;
  const params = await paramsPromise;

  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }

  try {
    await dbConnect();
    const product = await ProductModel.findById(params.id);
    if (product) {
      await product.deleteOne();
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      return Response.json({ message: 'Product deleted successfully' });
    } else {
      return Response.json(
        { message: 'Product not found' },
        {
          status: 404,
        },
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      },
    );
  }
}) as any;
