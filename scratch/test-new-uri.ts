import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const uri = "mongodb+srv://heukcare_db_user:heukcare1234@cluster0.bghvakr.mongodb.net/aetheravia?retryWrites=true&w=majority";

async function test() {
  console.log('Testing Mongoose with the new URI...');
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected successfully with the new URI!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}
test();
