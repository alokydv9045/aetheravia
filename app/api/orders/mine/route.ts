import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';

const toObjectIdString = (val: any) => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val?.toHexString === 'function') return val.toHexString();
  if (typeof val?.toString === 'function') return val.toString();
  return undefined;
};

export const GET = auth(async (req: any) => {
  if (!req.auth) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  const { user } = req.auth as any;
  try {
    await dbConnect();
    const userId = toObjectIdString((user as any)?.id || (user as any)?._id);
    if (!userId) {
      return Response.json({ message: 'Invalid user id in session' }, { status: 400 });
    }
    const orders = await OrderModel.find({ user: userId }).sort({ createdAt: -1 });
    return Response.json(orders);
  } catch (err: any) {
    console.error('GET /api/orders/mine error:', err);
    return Response.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
});
