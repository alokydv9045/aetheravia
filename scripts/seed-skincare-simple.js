// Lightweight seed script (CommonJS) designed to work without importing project TypeScript models.
// Usage: node -r dotenv/config scripts/seed-skincare-simple.js

const mongoose = require('mongoose');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Products to seed
  const products = [
    {
      name: 'Gentle Hydrating Cleanser',
      slug: 'gentle-hydrating-cleanser',
      price: 12.99,
      brand: 'Aetheravia',
      category: 'Cleansers',
      image: '/images/products/natural-cosmetic-products-arrangement.jpg',
      countInStock: 120,
      description: "A sulfate-free, cream cleanser that removes impurities while preserving the skin's natural moisture barrier.",
      rating: 4.6,
      numReviews: 142,
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Vitamin C Brightening Serum',
      slug: 'vitamin-c-brightening-serum',
      price: 29.5,
      brand: 'Aetheravia',
      category: 'Serums',
      image: '/images/products/serum-bottle-with-yellow-background.jpg',
      countInStock: 80,
      description: 'Stabilized vitamin C serum that reduces dark spots, improves radiance, and evens skin tone.',
      rating: 4.8,
      numReviews: 210,
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Hydrating Hyaluronic Moisturizer',
      slug: 'hydrating-hyaluronic-moisturizer',
      price: 24.0,
      brand: 'Aetheravia',
      category: 'Moisturizers',
      image: '/images/products/spa-arrangement-with-cremes.jpg',
      countInStock: 200,
      description: 'Lightweight daily moisturizer with hyaluronic acid to boost hydration and plump fine lines.',
      rating: 4.7,
      numReviews: 95,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Daily Mineral Sunscreen SPF 50',
      slug: 'daily-mineral-sunscreen-spf50',
      price: 19.99,
      brand: 'Aetheravia',
      category: 'Sunscreen',
      image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
      countInStock: 140,
      description: 'Broad-spectrum mineral sunscreen that provides high protection without leaving a white cast.',
      rating: 4.5,
      numReviews: 68,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Gentle Exfoliating Gel',
      slug: 'gentle-exfoliating-gel',
      price: 15.5,
      brand: 'Aetheravia',
      category: 'Exfoliators',
      image: '/images/products/cosmetics-composition-with-serum-bottles.jpg',
      countInStock: 75,
      description: 'PHA/AHA blend exfoliator that smooths skin texture and promotes cell turnover with minimal irritation.',
      rating: 4.4,
      numReviews: 48,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Overnight Repair Night Cream',
      slug: 'overnight-repair-night-cream',
      price: 34.0,
      brand: 'Aetheravia',
      category: 'Night Care',
      image: '/images/products/spa-arrangement-with-cremes.jpg',
      countInStock: 60,
      description: 'Rich night cream with peptides and ceramides to support skin recovery while you sleep.',
      rating: 4.7,
      numReviews: 81,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Revitalizing Eye Cream',
      slug: 'revitalizing-eye-cream',
      price: 22.0,
      brand: 'Aetheravia',
      category: 'Eye Care',
      image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
      countInStock: 90,
      description: 'Lightweight eye cream to reduce puffiness and brighten dark circles over time.',
      rating: 4.3,
      numReviews: 34,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const coupons = [
    {
      code: 'AETHERAVIA50',
      name: '50% Off Exclusive',
      type: 'percentage',
      value: 50,
      expiryDate: new Date('2025-12-31'),
      startDate: new Date(),
      status: 'active',
      minimumOrderAmount: 0,
      usagePerUser: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'WELCOME10',
      name: '10% Off Welcome',
      type: 'percentage',
      value: 10,
      expiryDate: new Date('2025-12-31'),
      startDate: new Date(),
      status: 'active',
      minimumOrderAmount: 0,
      usagePerUser: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const offers = [
    {
      title: 'Summer Sale!',
      description: 'Get 20% off sitewide on skincare essentials.',
      type: 'popup',
      isActive: true,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-10'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Free Shipping',
      description: 'On orders over $50.',
      type: 'banner',
      isActive: true,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Flash Sale: Skincare',
      description: 'Limited time markdowns on premium serums.',
      type: 'flashSale',
      isActive: true,
      startDate: new Date('2025-06-05T12:00:00Z'),
      endDate: new Date('2025-06-05T18:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    // Upsert products by slug
    for (const p of products) {
      await db.collection('products').updateOne(
        { slug: p.slug },
        { $set: p },
        { upsert: true }
      );
      console.log('Upserted product', p.slug);
    }

    // Upsert coupons by code
    for (const c of coupons) {
      await db.collection('coupons').updateOne({ code: c.code }, { $set: c }, { upsert: true });
      console.log('Upserted coupon', c.code);
    }

    // Upsert offers by title
    for (const o of offers) {
      await db.collection('offers').updateOne({ title: o.title }, { $set: o }, { upsert: true });
      console.log('Upserted offer', o.title);
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
