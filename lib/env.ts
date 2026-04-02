import { z } from 'zod';

// Centralized environment validation & access
// Use a single .env file locally. In production, set the same vars in your platform.

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).optional(),

  // Core required - with better error messages for Render
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required - set this in Render dashboard'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required - set this in Render dashboard'),
  NEXTAUTH_URL: z.string().optional(),

  // Payments (optional for local dev)
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // Cloudinary (optional for local dev)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Branding (public)
  NEXT_PUBLIC_BRAND_NAME: z.string().optional(),
  NEXT_PUBLIC_BRAND_TAGLINE: z.string().optional(),
  NEXT_PUBLIC_SHOP_ADDRESS: z.string().optional(),
});

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_ENV: process.env.APP_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  NEXT_PUBLIC_BRAND_TAGLINE: process.env.NEXT_PUBLIC_BRAND_TAGLINE,
  NEXT_PUBLIC_SHOP_ADDRESS: process.env.NEXT_PUBLIC_SHOP_ADDRESS,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n - ');
  throw new Error(`Invalid environment configuration:\n - ${issues}`);
}

const env = parsed.data;

// Sensible defaults for local dev
if (env.NODE_ENV !== 'production' && !env.NEXTAUTH_URL) {
  env.NEXTAUTH_URL = 'http://localhost:3000';
}

export default env;

