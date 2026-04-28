const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/aetheravia'; // Fallback if env missing

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || dbUrl);
    console.log('Connected to DB');
    
    const coupons = await mongoose.connection.db.collection('coupons').find({}).toArray();
    console.log('--- RAW COUPONS ---');
    coupons.forEach(c => {
      console.log(`Code: ${c.code}, Status: ${c.status}, Start: ${c.startDate}, Exp: ${c.expiryDate}, Usage: ${c.usageCount}/${c.usageLimit}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
