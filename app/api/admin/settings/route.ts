import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import SettingModel from '@/lib/models/SettingModel';

export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user.isAdmin) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const settings = await SettingModel.find();
  return Response.json(settings);
});

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user.isAdmin) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { key, value, description } = await req.json();
  if (!key) {
    return Response.json({ message: 'Key is required' }, { status: 400 });
  }

  await dbConnect();
  const setting = await SettingModel.findOneAndUpdate(
    { key },
    { value, description },
    { upsert: true, new: true }
  );

  return Response.json(setting);
});
