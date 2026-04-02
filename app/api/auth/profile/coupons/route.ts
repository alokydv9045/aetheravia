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

export const GET = auth(async (req: any) => {
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    await dbConnect();
    const user = await UserModel.findById(uid).select('savedCoupons');
    return Response.json(user?.savedCoupons || []);
  } catch (err: any) {
    console.error('GET /api/auth/profile/coupons error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req: any) => {
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    const { code } = await req.json();
    const norm = (code || '').toString().trim().toUpperCase();
    if (!norm) return Response.json({ message: 'Coupon code required' }, { status: 400 });
    await dbConnect();
  const user = await UserModel.findById(uid);
  if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
  if (!Array.isArray(user.savedCoupons)) user.savedCoupons = [];
  const set = new Set([...(user.savedCoupons), norm]);
  user.savedCoupons = Array.from(set);
  await user.save();
  return Response.json(user.savedCoupons);
  } catch (err: any) {
    console.error('POST /api/auth/profile/coupons error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = auth(async (req: any) => {
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return Response.json({ message: 'Coupon code required' }, { status: 400 });
    const norm = code.toString().trim().toUpperCase();
    await dbConnect();
  const user = await UserModel.findById(uid);
  if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
  if (!Array.isArray(user.savedCoupons)) user.savedCoupons = [];
  user.savedCoupons = (user.savedCoupons as string[]).filter((c: string) => c !== norm);
  await user.save();
  return Response.json(user.savedCoupons);
  } catch (err: any) {
    console.error('DELETE /api/auth/profile/coupons error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});
