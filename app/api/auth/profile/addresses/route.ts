
import { z } from 'zod';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
// import { rateLimit } from '@/lib/rateLimit';
// Zod schema for address validation
const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().optional(),
  phone: z.string().optional(),
});

const toObjectIdString = (val: any) => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val?.toHexString === 'function') return val.toHexString();
  return undefined;
};
const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

export const GET = auth(async (req: any) => {
  // Rate limiting disabled (Upstash Redis not configured)
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    await dbConnect();
    const user = await UserModel.findById(uid).select('savedAddresses');
    return Response.json(user?.savedAddresses || []);
  } catch (err: any) {
    console.error('GET /api/auth/profile/addresses error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req: any) => {
  // Rate limiting disabled (Upstash Redis not configured)
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    const body = await req.json();
    const parseResult = addressSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ message: 'Invalid address input', errors: parseResult.error.flatten() }, { status: 400 });
    }
    const { fullName, address, city, postalCode, country, phone } = parseResult.data;
    await dbConnect();
    const user = await UserModel.findById(uid);
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
    if (!Array.isArray(user.savedAddresses)) user.savedAddresses = [];
    (user as any).savedAddresses.push({ fullName, address, city, postalCode, country, phone });
    await user.save();
    return Response.json(user.savedAddresses);
  } catch (err: any) {
    console.error('POST /api/auth/profile/addresses error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = auth(async (req: any) => {
  // Rate limiting disabled (Upstash Redis not configured)
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    const { searchParams } = new URL(req.url);
    const addrId = searchParams.get('id');
    if (!addrId) return Response.json({ message: 'Address id required' }, { status: 400 });
    await dbConnect();
    const user = await UserModel.findById(uid);
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
    if (!Array.isArray(user.savedAddresses)) user.savedAddresses = [];
    (user as any).savedAddresses = (user as any).savedAddresses.filter((a: any) => a._id.toString() !== addrId);
    await user.save();
    return Response.json(user.savedAddresses);
  } catch (err: any) {
    console.error('DELETE /api/auth/profile/addresses error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const PATCH = auth(async (req: any) => {
  // Rate limiting disabled (Upstash Redis not configured)
  try {
    if (!req.auth) return Response.json({ message: 'unauthorized' }, { status: 401 });
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) return Response.json({ message: 'Invalid user id' }, { status: 400 });
    const { searchParams } = new URL(req.url);
    const addrId = searchParams.get('id');
    if (!addrId) return Response.json({ message: 'Address id required' }, { status: 400 });
    const patch = await req.json();
    // Validate patch input (allow partial update, but only valid fields)
    const patchSchema = addressSchema.partial();
    const patchResult = patchSchema.safeParse(patch);
    if (!patchResult.success) {
      return Response.json({ message: 'Invalid address update', errors: patchResult.error.flatten() }, { status: 400 });
    }
    await dbConnect();
    const user = await UserModel.findById(uid);
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
    const addr: any = (user as any).savedAddresses.id(addrId);
    if (!addr) return Response.json({ message: 'Address not found' }, { status: 404 });
    ['fullName','address','city','postalCode','country','phone'].forEach((k) => {
      if (typeof patch[k] === 'string') addr[k] = patch[k];
    });
    await user.save();
    return Response.json(user.savedAddresses);
  } catch (err: any) {
    console.error('PATCH /api/auth/profile/addresses error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});
