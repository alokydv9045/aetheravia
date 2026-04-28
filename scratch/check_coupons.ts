import dbConnect from './lib/dbConnect';
import CouponModel from './lib/models/CouponModel';
import mongoose from 'mongoose';

async function listCoupons() {
  await dbConnect();
  const coupons = await CouponModel.find({});
  console.log('--- COUPONS IN DATABASE ---');
  coupons.forEach(c => {
    console.log(`Code: ${c.code}, Status: ${c.status}, Type: ${c.type}, Value: ${c.value}, Min: ${c.minimumOrderAmount}, Exp: ${c.expiryDate}, Usage: ${c.usageCount}/${c.usageLimit || 'unlimited'}`);
  });
  process.exit(0);
}

listCoupons().catch(err => {
  console.error(err);
  process.exit(1);
});
