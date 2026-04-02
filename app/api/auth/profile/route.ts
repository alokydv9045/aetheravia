import bcrypt from 'bcryptjs';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

const toObjectIdString = (val: any) => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val?.toHexString === 'function') return val.toHexString();
  return undefined;
};
const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

export const GET = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: 'Not authenticated' }, { status: 401 });
  }
  const { user } = req.auth as any;
  try {
    await dbConnect();
    const userId = toObjectIdString((user as any)?.id || (user as any)?._id);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] GET /api/auth/profile session.user:', (user as any));
      console.log('[DEV] GET /api/auth/profile derived userId:', userId);
    }
    if (!isValidObjectIdString(userId)) {
      return Response.json({ message: 'Invalid user id in session' }, { status: 400 });
    }
    const dbUser = await UserModel.findById(userId).select(
      '_id name email isAdmin avatar createdAt updatedAt',
    );
    if (!dbUser) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }
    return Response.json(dbUser);
  } catch (err: any) {
    console.error('GET /api/auth/profile error:', err);
    return Response.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: 'Not authenticated' }, { status: 401 });
  }
  const { user } = req.auth as any;
  const { name, email, password, avatar } = await req.json();
  try {
    await dbConnect();
    const userId = toObjectIdString((user as any)?.id || (user as any)?._id);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] PUT /api/auth/profile session.user:', (user as any));
      console.log('[DEV] PUT /api/auth/profile derived userId:', userId);
    }
    if (!isValidObjectIdString(userId)) {
      return Response.json({ message: 'Invalid user id in session' }, { status: 400 });
    }
    const dbUser = await UserModel.findById(userId);
    
    if (!dbUser) {
      return Response.json(
        { message: 'User not found' },
        {
          status: 404,
        },
      );  
    }  
    // Only update fields that are provided; validate to avoid empty strings
    if (typeof name !== 'undefined') {
      const n = (name ?? '').toString().trim();
      if (!n) return Response.json({ message: 'Name is required' }, { status: 400 });
      dbUser.name = n;
    }
    if (typeof email !== 'undefined') {
      const e = (email ?? '').toString().trim();
      if (!e) return Response.json({ message: 'Email is required' }, { status: 400 });
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(e)) {
        return Response.json({ message: 'Invalid email format' }, { status: 400 });
      }
      dbUser.email = e;
    }
    if (typeof password === 'string') {
      const p = password.trim();
      if (p) {
        dbUser.password = await bcrypt.hash(p, 5);
      }
    }
    if (typeof avatar === 'string') {
      const a = avatar.trim();
      if (a) dbUser.avatar = a;
    }
    
    await dbUser.save();
    
    return Response.json({ message: 'User has been updated' });
  } catch (err: any) {
    console.error('PUT /api/auth/profile error:', err);
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return Response.json({ message: 'Email already in use' }, { status: 400 });
    }
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});
