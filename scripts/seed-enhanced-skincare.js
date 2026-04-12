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
      name: 'Vitamin C Brightening Face Wash',
      slug: 'vitamin-c-brightening-face-wash',
      category: 'Face Wash',
      image: '/images/products/serum-bottle-with-yellow-background.jpg',
      price: 1299,
      brand: 'AETHRAVIA',
      rating: 4.9,
      numReviews: 67,
      countInStock: 30,
      description: 'Potent vitamin C face wash that brightens skin and reduces dark spots naturally through every cleanse.',
      isFeatured: true,
      skinType: ['All Skin Types', 'Dull Skin'],
      keyBenefits: ['Brightening', 'Deep Cleansing', 'Hydrating'],
      ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Rose Hip Oil', 'Green Tea Extract'],
      certifications: ['Dermatologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Massage onto damp face for 60 seconds. Rinse with lukewarm water.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Hyaluronic Deep Cleansing Face Wash',
      slug: 'hyaluronic-deep-cleansing-face-wash',
      category: 'Face Wash',
      image: '/images/products/spa-arrangement-with-cremes.jpg',
      price: 899,
      brand: 'AETHRAVIA',
      rating: 4.7,
      numReviews: 45,
      countInStock: 40,
      description: 'Ultra-hydrating face wash with hyaluronic acid and natural ceramides for a moisture-rich cleanse.',
      isFeatured: false,
      skinType: ['Dry Skin', 'Normal Skin'],
      keyBenefits: ['Moisture Retention', 'Plumping Cleansing'],
      ingredients: ['Hyaluronic Acid', 'Ceramides', 'Jojoba Oil', 'Niacinamide'],
      certifications: ['Organic', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Apply to damp skin morning and evening. Gentle enough for double cleansing.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Mineral Sun-Protecting Body Wash',
      slug: 'mineral-sun-protecting-body-wash',
      category: 'Body Wash',
      image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
      price: 799,
      brand: 'AETHRAVIA',
      rating: 4.6,
      numReviews: 28,
      countInStock: 35,
      description: 'Broad-spectrum mineral body wash with zinc oxide that leaves a protective layer on the skin.',
      isFeatured: true,
      skinType: ['All Skin Types', 'Sensitive'],
      keyBenefits: ['UV Protection', 'Non-Greasy', 'Reef Safe'],
      ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Aloe Vera', 'Green Tea'],
      certifications: ['Reef Safe', 'Dermatologist Tested'],
      isEcoFriendly: true,
      usageInstructions: 'Lather onto body skin. The zinc-rich formula provides a base layer of mineral protection.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Gentle exfoliating Body Scrub',
      slug: 'gentle-exfoliating-body-scrub',
      category: 'Body Scrub',
      image: '/images/products/cosmetics-composition-with-serum-bottles.jpg',
      price: 649,
      brand: 'AETHRAVIA',
      rating: 4.5,
      numReviews: 23,
      countInStock: 25,
      description: 'Natural papaya enzyme scrub that gently polishes the body for a radiant archive glow.',
      isFeatured: false,
      skinType: ['All Skin Types', 'Dull Skin'],
      keyBenefits: ['Polishing', 'Brightening', 'Gentle'],
      ingredients: ['Papaya Enzyme', 'Lactic Acid', 'Honey', 'Oatmeal'],
      certifications: ['Natural', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Use 2-3 times per week. Massage in circular motions on damp body skin.',
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
      usageInstructions: 'Apply to wet skin, lather, and rinse. The ultimate heritage body cleanse.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Overnight Repair Face Wash',
      slug: 'overnight-repair-face-wash',
      category: 'Face Wash',
      image: '/images/products/spa-arrangement-with-cremes.jpg',
      price: 1099,
      brand: 'AETHRAVIA',
      rating: 4.8,
      numReviews: 41,
      countInStock: 20,
      description: 'Rich night-specific face wash with retinol alternative for overnight skin renewal.',
      isFeatured: true,
      skinType: ['Mature Skin', 'Dry Skin'],
      keyBenefits: ['Anti-Aging', 'Repairing', 'Firming'],
      ingredients: ['Bakuchiol', 'Peptides', 'Rosehip Oil', 'Shea Butter'],
      certifications: ['Organic', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'First step of your night ritual. Massage gently to prepare skin for sleep.',
      isTopDeal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Revitalizing Face Wash',
      slug: 'revitalizing-face-wash',
      category: 'Face Wash',
      image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg',
      price: 999,
      brand: 'AETHRAVIA',
      rating: 4.7,
      numReviews: 19,
      countInStock: 15,
      description: 'Gentle facial cleanser with caffeine and peptides to wake up tired skin instantly.',
      isFeatured: false,
      skinType: ['All Skin Types'],
      keyBenefits: ['Energizing', 'Anti-Aging', 'Hydrating'],
      ingredients: ['Caffeine', 'Peptides', 'Cucumber Extract', 'Vitamin E'],
      certifications: ['Dermatologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Perfect for your morning ritual. Splash face with cold water after cleansing.',
      isTopDeal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Artisanal Archive Ritual Set',
      slug: 'artisanal-archive-ritual-set',
      category: 'Body Scrub',
      image: '/images/products/natural-cosmetic-products-arrangement.jpg',
      price: 2499,
      brand: 'AETHRAVIA',
      rating: 4.9,
      numReviews: 83,
      countInStock: 25,
      description: 'Curated set featuring our signature face wash, body wash, and exfoliating scrub.',
      isFeatured: true,
      skinType: ['All Skin Types'],
      keyBenefits: ['Complete Archive', 'Value Set', 'Heritage Journey'],
      ingredients: ['Diverse Heritage Extracts'],
      certifications: ['Dermatologist Tested', 'Cruelty-Free'],
      isEcoFriendly: true,
      usageInstructions: 'Start with the body wash, follow with the scrub, and finish with the face ritual.',
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