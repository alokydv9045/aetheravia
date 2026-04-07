import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing connection to:', process.env.MONGODB_URI?.replace(/:[^@]+@/, ':***@'));
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}
test();
