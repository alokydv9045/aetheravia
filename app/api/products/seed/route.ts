import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import data from '@/lib/data';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/lib/models/ProductModel';
import UserModel from '@/lib/models/UserModel';

export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }
  try {
    const { users, products } = data;
    await dbConnect();
    await UserModel.deleteMany();
    await UserModel.insertMany(users);

    await ProductModel.deleteMany();
    await ProductModel.insertMany(products);

    return NextResponse.json({
      message: 'seeded successfully',
      users,
      products,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
});
