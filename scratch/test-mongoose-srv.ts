import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const uri = "mongodb+srv://heukcare_db_user:Lp2uMH5s5hINIQ0P@cluster0.bghvakr.mongodb.net/?appName=Cluster0";

async function test() {
  console.log('Testing Mongoose with SRV URI directly...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log('✅ Connected successfully to SRV!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}
test();
