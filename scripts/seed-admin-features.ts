import 'dotenv/config';
import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect';
import CouponModel from '../lib/models/CouponModel';
import ProductModel from '../lib/models/ProductModel';
import OfferModel from '../lib/models/OfferModel';
import UserModel from '../lib/models/UserModel';

async function seed() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Create sample users if they don't exist
    const sampleUsers = await UserModel.find({ email: { $in: ['user1@example.com', 'user2@example.com'] } });
    
    let user1, user2;
    if (sampleUsers.length === 0) {
      [user1, user2] = await UserModel.create([
        { name: 'User One', email: 'user1@example.com', password: 'hashedpassword' },
        { name: 'User Two', email: 'user2@example.com', password: 'hashedpassword' }
      ]);
    } else {
      user1 = sampleUsers[0];
      user2 = sampleUsers[1] || sampleUsers[0];
    }

    // Create sample products (update existing or create new)
    const productData = [
      {
        name: 'Gentle Hydrating Cleanser',
        slug: 'gentle-hydrating-cleanser',
        price: 12.99,
        brand: 'AetherAvia',
        category: 'Cleansers',
        image: '/images/products/natural-cosmetic-products-arrangement.jpg',
        countInStock: 120,
        description: 'A sulfate-free, cream cleanser that removes impurities while preserving the skin\'s natural moisture barrier.',
        rating: 4.6,
        numReviews: 142,
        isTopDeal: true
      },
      {
        name: 'Vitamin C Brightening Serum',
        slug: 'vitamin-c-brightening-serum',
        price: 29.5,
        brand: 'AetherAvia',
        category: 'Serums',
        image: '/images/products/serum-bottle-with-yellow-background.jpg',
        countInStock: 80,
        description: 'Stabilized vitamin C serum that reduces dark spots, improves radiance, and evens skin tone.',
        rating: 4.8,
        numReviews: 210,
        isTopDeal: true
      },
      {
        name: 'Hydrating Hyaluronic Moisturizer',
        slug: 'hydrating-hyaluronic-moisturizer',
        price: 24.0,
        brand: 'AetherAvia',
        category: 'Moisturizers',
        image: '/images/products/spa-arrangement-with-cremes.jpg',
        countInStock: 200,
        description: 'Lightweight daily moisturizer with hyaluronic acid to boost hydration and plump fine lines.',
        rating: 4.7,
        numReviews: 95
      },
      {
        name: 'Daily Mineral Sunscreen SPF 50',
        slug: 'daily-mineral-sunscreen-spf50',
        price: 19.99,
        brand: 'AetherAvia',
        category: 'Sunscreen',
        image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
        countInStock: 140,
        description: 'Broad-spectrum mineral sunscreen that provides high protection without leaving a white cast.',
        rating: 4.5,
        numReviews: 68
      },
      {
        name: 'Gentle Exfoliating Gel',
        slug: 'gentle-exfoliating-gel',
        price: 15.5,
        brand: 'AetherAvia',
        category: 'Exfoliators',
        image: '/images/products/cosmetics-composition-with-serum-bottles.jpg',
        countInStock: 75,
        description: 'PHA/AHA blend exfoliator that smooths skin texture and promotes cell turnover with minimal irritation.',
        rating: 4.4,
        numReviews: 48
      },
      {
        name: 'Overnight Repair Night Cream',
        slug: 'overnight-repair-night-cream',
        price: 34.0,
        brand: 'AetherAvia',
        category: 'Night Care',
        image: '/images/products/spa-arrangement-with-cremes.jpg',
        countInStock: 60,
        description: 'Rich night cream with peptides and ceramides to support skin recovery while you sleep.',
        rating: 4.7,
        numReviews: 81
      },
      {
        name: 'Revitalizing Eye Cream',
        slug: 'revitalizing-eye-cream',
        price: 22.0,
        brand: 'AetherAvia',
        category: 'Eye Care',
        image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
        countInStock: 90,
        description: 'Lightweight eye cream to reduce puffiness and brighten dark circles over time.',
        rating: 4.3,
        numReviews: 34
      }
    ];

    // Use upsert to update existing products or create new ones
    const products = [];
    for (const productInfo of productData) {
      const product = await ProductModel.findOneAndUpdate(
        { slug: productInfo.slug },
        productInfo,
        { upsert: true, new: true }
      );
      products.push(product);
    }

    console.log('Created products:', products.length);

    // Create sample coupons
  await CouponModel.deleteMany({ code: { $in: ['AETHRAVIA50', 'WELCOME10'] } });
    const coupons = await CouponModel.create([
      {
        code: 'AETHRAVIA50',
        name: '50% Off Exclusive',
        type: 'percentage',
        value: 50,
        allowedUsers: [user1._id, user2._id],
        expiryDate: new Date('2025-12-31'),
        startDate: new Date(),
        status: 'active',
        createdBy: user1._id,
        minimumOrderAmount: 0,
        usagePerUser: 1
      },
      {
        code: 'WELCOME10',
        name: '10% Off Welcome',
        type: 'percentage',
        value: 10,
        allowedUsers: [],
        expiryDate: new Date('2025-12-31'),
        startDate: new Date(),
        status: 'active',
        createdBy: user1._id,
        minimumOrderAmount: 0,
        usagePerUser: 1
      }
    ]);

    console.log('Created coupons:', coupons.length);

    // Create sample offers (popups, banners, flash sales)
    await OfferModel.deleteMany({ title: { $in: ['Summer Sale!', 'Free Shipping', 'Flash Sale: Shoes'] } });
    const offers = await OfferModel.create([
      {
        title: 'Summer Sale!',
        description: 'Get 20% off sitewide.',
        type: 'popup',
        isActive: true,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-10')
      },
      {
        title: 'Free Shipping',
        description: 'On orders over $100.',
        type: 'banner',
        isActive: true,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30')
      },
      {
        title: 'Flash Sale: Shoes',
        description: 'Limited time shoe sale.',
        type: 'flashSale',
        isActive: true,
        startDate: new Date('2025-06-05T12:00:00Z'),
        endDate: new Date('2025-06-05T18:00:00Z'),
        products: [products[2]._id, products[3]._id] // Running shoes and heels
      }
    ]);

    console.log('Created offers:', offers.length);
    console.log('✅ Seeded admin features data successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();