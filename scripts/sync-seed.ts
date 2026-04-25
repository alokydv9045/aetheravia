import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Fix for Node.js SRV DNS resolution issues on some systems
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

// User Data
const users = [
  {
    name: 'Admin',
    email: 'admin@admin.com',
    password: bcrypt.hashSync('admin123', 12),
    isAdmin: true,
  },
  {
    name: 'Test User',
    email: 'test@test.com',
    password: bcrypt.hashSync('test1234', 12),
    isAdmin: false,
  },
  {
    name: 'Heritage Seeker',
    email: 'user@example.com',
    password: bcrypt.hashSync('user1234', 12),
    isAdmin: false,
  },
];

// Product Data
const products = [
  {
    name: 'Gentle Hydrating Cleanser',
    slug: 'gentle-hydrating-cleanser',
    category: 'Face Wash',
    image: '/images/products/natural-cosmetic-products-arrangement.jpg',
    price: 699,
    brand: 'AETHRAVIA',
    rating: 4.8,
    numReviews: 34,
    countInStock: 50,
    description: 'A gentle, sulfate-free cleanser enriched with aloe vera and chamomile to cleanse without stripping natural oils.',
    isFeatured: true,
    banner: '/images/banners/cleanser-banner.jpg',
  },
  {
    name: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-brightening-serum',
    category: 'Serums',
    image: '/images/products/serum-bottle-with-yellow-background.jpg',
    price: 1299,
    brand: 'AETHRAVIA',
    rating: 4.9,
    numReviews: 67,
    countInStock: 30,
    description: 'Potent vitamin C serum with hyaluronic acid to brighten skin and reduce dark spots naturally.',
    isFeatured: true,
  },
  {
    name: 'Hydrating Hyaluronic Moisturizer',
    slug: 'hydrating-hyaluronic-moisturizer',
    category: 'Moisturizers',
    image: '/images/products/spa-arrangement-with-cremes.jpg',
    price: 899,
    brand: 'AETHRAVIA',
    rating: 4.7,
    numReviews: 45,
    countInStock: 40,
    description: 'Lightweight yet deeply hydrating moisturizer with hyaluronic acid and natural ceramides.',
    isFeatured: false,
  },
  {
    name: 'Daily Mineral Sunscreen SPF 50',
    slug: 'daily-mineral-sunscreen-spf50',
    category: 'Sunscreen',
    image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
    price: 799,
    brand: 'AETHRAVIA',
    rating: 4.6,
    numReviews: 28,
    countInStock: 35,
    description: 'Broad-spectrum mineral sunscreen with zinc oxide and titanium dioxide for sensitive skin.',
    isFeatured: true,
  },
  {
    name: 'Gentle Exfoliating Gel',
    slug: 'gentle-exfoliating-gel',
    category: 'Body Scrub',
    image: '/images/products/cosmetics-composition-with-serum-bottles.jpg',
    price: 649,
    brand: 'AETHRAVIA',
    rating: 4.5,
    numReviews: 23,
    countInStock: 25,
    description: 'Natural papaya enzyme exfoliant that gently removes dead skin cells for a radiant glow.',
    isFeatured: false,
  },
  {
    name: 'Nourishing Body Wash',
    slug: 'nourishing-body-wash',
    category: 'Body Wash',
    image: '/images/products/natural-cosmetic-products-arrangement.jpg',
    price: 549,
    brand: 'AETHRAVIA',
    rating: 4.6,
    numReviews: 52,
    countInStock: 60,
    description: 'Creamy body wash with shea butter and essential oils for soft, fragrant skin.',
    isFeatured: true,
  },
  {
    name: 'Overnight Repair Night Cream',
    slug: 'overnight-repair-night-cream',
    category: 'Night Care',
    image: '/images/products/spa-arrangement-with-cremes.jpg',
    price: 1099,
    brand: 'AETHRAVIA',
    rating: 4.8,
    numReviews: 41,
    countInStock: 20,
    description: 'Rich night cream with retinol alternative and peptides for overnight skin repair and renewal.',
    isFeatured: true,
  }
];

async function main() {
  console.log('🚀 Starting Synchronizable Seeding...');
  
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('❌ Failed to get database object from mongoose connection');
    }

    // 1. Sync Users
    console.log('👤 Syncing Users...');
    for (const user of users) {
      await db.collection('users').updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
      console.log(`   - Synced user: ${user.email}`);
    }

    // 2. Sync Products
    console.log('📦 Syncing Products...');
    for (const product of products) {
      await db.collection('products').updateOne(
        { slug: product.slug },
        { $set: product },
        { upsert: true }
      );
      console.log(`   - Synced product: ${product.slug}`);
    }

    // 3. Sync Coupons (Example)
    console.log('🎫 Syncing Coupons...');
    const coupons = [
      { code: 'WELCOME10', name: 'Welcome 10%', type: 'percentage', value: 10, expiryDate: new Date('2025-12-31'), status: 'active' },
      { code: 'SKIN20', name: 'Skincare 20% Off', type: 'percentage', value: 20, expiryDate: new Date('2025-12-31'), status: 'active' }
    ];
    for (const coupon of coupons) {
      await db.collection('coupons').updateOne(
        { code: coupon.code },
        { $set: coupon },
        { upsert: true }
      );
      console.log(`   - Synced coupon: ${coupon.code}`);
    }

    console.log('✅ Seeding Complete. All data is properly synchronizable.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
