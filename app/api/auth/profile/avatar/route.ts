import { v2 as cloudinary } from 'cloudinary';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

export const runtime = 'nodejs';

const toObjectIdString = (val: any) => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val?.toHexString === 'function') return val.toHexString();
  return undefined;
};
const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

export const POST = auth(async (req: any) => {
  try {
    if (!req.auth) {
      return Response.json({ message: 'unauthorized' }, { status: 401 });
    }
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) {
      return Response.json({ message: 'Invalid user id' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ message: 'File is required' }, { status: 400 });
    if (!file.type?.startsWith('image/')) {
      return Response.json({ message: 'Only image files are allowed' }, { status: 400 });
    }
    const maxBytes = 4 * 1024 * 1024; // 4MB
    if (file.size > maxBytes) {
      return Response.json({ message: 'Image must be 4MB or smaller' }, { status: 400 });
    }

    // Configure Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ message: 'Cloudinary not configured' }, { status: 500 });
    }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = () =>
      new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `AetherAvia/avatars/${uid}`,
            resource_type: 'image',
            overwrite: true,
            transformation: [{ width: 512, height: 512, crop: 'limit' }],
          },
          (err, result) => {
            if (err || !result?.secure_url) return reject(err || new Error('Upload failed'));
            resolve({ secure_url: result.secure_url });
          },
        );
        stream.end(buffer);
      });

    const { secure_url } = await upload();

    await dbConnect();
    await UserModel.findByIdAndUpdate(uid, { avatar: secure_url });

    return Response.json({ url: secure_url }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/auth/profile/avatar error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});
