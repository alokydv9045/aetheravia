import mongoose from 'mongoose';

const uri = "mongodb://heukcare_db_user:Lp2uMH5s5hINIQ0P@159.41.229.98:27017/test?ssl=true&authSource=admin";

async function test() {
  console.log('Testing direct single node IP connection...');
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected successfully to IP!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}
test();
