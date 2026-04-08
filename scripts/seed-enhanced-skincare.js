// Enhanced seed script with detailed skincare product information
// Usage: node -r dotenv/config scripts/seed-enhanced-skincare.js

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

  // Enhanced products with skincare-specific fields
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
      skinType: ['All Skin Types', 'Sensitive'],
      keyBenefits: ['Hydrating', 'Gentle Cleansing'],
      ingredients: ['Aloe Vera', 'Chamomile', 'Glycerin', 'Coconut Oil'],
      certifications: ['Cruelty-Free', 'Organic'],
      isEcoFriendly: true,
      usageInstructions: 'Apply to damp skin, massage gently, and rinse with lukewarm water. Use morning and evening.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['All Skin Types', 'Dull Skin'],
      keyBenefits: ['Brightening', 'Anti-Aging', 'Hydrating'],
      ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Rose Hip Oil', 'Green Tea Extract'],
      certifications: ['Dermatologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Apply 2-3 drops to clean skin before moisturizer. Use in the morning with sunscreen.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['Dry Skin', 'Normal Skin'],
      keyBenefits: ['Deep Hydration', 'Plumping'],
      ingredients: ['Hyaluronic Acid', 'Ceramides', 'Jojoba Oil', 'Niacinamide'],
      certifications: ['Organic', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Apply to clean skin morning and evening. Can be used under makeup.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['All Skin Types', 'Sensitive'],
      keyBenefits: ['Sun Protection', 'Non-Greasy', 'Reef Safe'],
      ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Aloe Vera', 'Green Tea'],
      certifications: ['Reef Safe', 'Dermatologist Tested'],
      isEcoFriendly: true,
      usageInstructions: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['All Skin Types', 'Dull Skin'],
      keyBenefits: ['Exfoliating', 'Brightening', 'Gentle'],
      ingredients: ['Papaya Enzyme', 'Lactic Acid', 'Honey', 'Oatmeal'],
      certifications: ['Natural', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Use 2-3 times per week on clean skin. Massage gently and rinse thoroughly.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['All Skin Types', 'Dry Skin'],
      keyBenefits: ['Moisturizing', 'Gentle', 'Aromatherapy'],
      ingredients: ['Shea Butter', 'Coconut Oil', 'Lavender Essential Oil', 'Vitamin E'],
      certifications: ['Natural', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Apply to wet skin, lather, and rinse. For best results, follow with body moisturizer.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      skinType: ['Mature Skin', 'Dry Skin'],
      keyBenefits: ['Anti-Aging', 'Repairing', 'Firming'],
      ingredients: ['Bakuchiol', 'Peptides', 'Rosehip Oil', 'Shea Butter'],
      certifications: ['Organic', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Apply to clean skin before bed. Use consistently for best results.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Revitalizing Eye Cream',
      slug: 'revitalizing-eye-cream',
      category: 'Eye Care',
      image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
      price: 999,
      brand: 'AETHRAVIA',
      rating: 4.7,
      numReviews: 19,
      countInStock: 15,
      description: 'Gentle yet effective eye cream with caffeine and peptides to reduce puffiness and fine lines.',
      isFeatured: false,
      skinType: ['All Skin Types'],
      keyBenefits: ['Reduces Puffiness', 'Anti-Aging', 'Hydrating'],
      ingredients: ['Caffeine', 'Peptides', 'Cucumber Extract', 'Vitamin E'],
      certifications: ['Ophthalmologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Gently pat around eye area morning and evening. Use ring finger for application.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Complete Skincare Combo Pack',
      slug: 'complete-skincare-combo-pack',
      category: 'Combo Packs',
      image: '/images/products/natural-cosmetic-products-arrangement.jpg',
      price: 2499,
      brand: 'AETHRAVIA',
      rating: 4.9,
      numReviews: 83,
      countInStock: 25,
      description: 'Complete skincare routine with cleanser, serum, moisturizer, and sunscreen at a special price.',
      isFeatured: true,
      skinType: ['All Skin Types'],
      keyBenefits: ['Complete Routine', 'Value Pack', 'Beginner Friendly'],
      ingredients: ['Multiple Product Combination'],
      certifications: ['Dermatologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Follow individual product instructions. Perfect for establishing a skincare routine.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const coupons = [
    {
      code: 'AETHRAVIA50',
      name: '50% Off Exclusive',
      type: 'percentage',
      value: 50,
      expiryDate: new Date('2025-12-31'),
      startDate: new Date(),
      status: 'active',
      minimumOrderAmount: 0,
      usagePerUser: 1,
      description: 'Exclusive 50% discount on all AETHRAVIA products',
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
      description: 'Welcome discount for new customers',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'SKINCARE20',
      name: '₹200 Off on Skincare',
      type: 'fixed',
      value: 200,
      expiryDate: new Date('2025-12-31'),
      startDate: new Date(),
      status: 'active',
      minimumOrderAmount: 1000,
      usagePerUser: 1,
      description: '₹200 off on orders above ₹1000',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const offers = [
    {
      title: 'Summer Skincare Sale!',
      description: 'Get up to 30% off on skincare essentials. Limited time offer!',
      type: 'popup',
      isActive: true,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹999',
      type: 'banner',
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Flash Sale: Skincare',
      description: 'Limited time flash sale on premium skincare products',
      type: 'flashSale',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    // Clear existing products and seed new enhanced ones
    await db.collection('products').deleteMany({});
    console.log('Cleared existing products');

    // Upsert enhanced products by slug
    for (const p of products) {
      await db.collection('products').updateOne(
        { slug: p.slug },
        { $set: p },
        { upsert: true }
      );
      console.log('Upserted enhanced product', p.slug);
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

    console.log('Enhanced skincare seeding complete for AETHRAVIA');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();