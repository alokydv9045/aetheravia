// Lightweight admin reseed script (CommonJS)
// Usage: node -r dotenv/config scripts/reseed-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  try {
    // Ensure admin user and two sample users
    const usersColl = db.collection('users');

    const emails = ['admin@admin.com', 'user1@example.com', 'user2@example.com'];
    const existing = await usersColl.find({ email: { $in: emails } }).toArray();

    const missing = emails.filter(e => !existing.find(x => x.email === e));

    if (missing.length > 0) {
      const hashed = bcrypt.hashSync('Password123!', 10);
      const toInsert = missing.map((email) => ({
        name: email.split('@')[0],
        email,
        password: hashed,
        isAdmin: email === 'admin@admin.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await usersColl.insertMany(toInsert);
      console.log(`Inserted ${res.insertedCount} users`);
    } else {
      console.log('Sample users already exist');
    }

    const users = await usersColl.find({ email: { $in: emails } }).toArray();
    const user1 = users.find(u => u.email === 'user1@example.com');
    const user2 = users.find(u => u.email === 'user2@example.com');
    const admin = users.find(u => u.email === 'admin@admin.com');

    // Upsert coupons with allowed users
    const couponsColl = db.collection('coupons');
    const coupons = [
      {
        code: 'AetherAvia50',
        name: '50% Off Exclusive',
        type: 'percentage',
        value: 50,
        expiryDate: new Date('2025-12-31'),
        startDate: new Date(),
        status: 'active',
        minimumOrderAmount: 0,
        usagePerUser: 1,
        allowedUsers: [user1?._id, user2?._id].filter(Boolean),
        createdBy: user1?._id || admin?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        allowedUsers: [],
        createdBy: user1?._id || admin?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const c of coupons) {
      await couponsColl.updateOne({ code: c.code }, { $set: c }, { upsert: true });
      console.log('Upserted coupon', c.code);
    }

    console.log('✅ Admin reseed complete');
  } catch (err) {
    console.error('Reseed error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
