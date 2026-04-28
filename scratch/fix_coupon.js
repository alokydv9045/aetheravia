const mongoose = require('mongoose');
const dbUrl = 'mongodb://alokyadav83956_db_user:aethera@ac-5cv7upq-shard-00-00.toxa10r.mongodb.net:27017,ac-5cv7upq-shard-00-01.toxa10r.mongodb.net:27017,ac-5cv7upq-shard-00-02.toxa10r.mongodb.net:27017/?ssl=true&replicaSet=atlas-5irjbc-shard-0&authSource=admin&retryWrites=true&w=majority';

async function fix() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to DB');
    
    const result = await mongoose.connection.db.collection('coupons').updateOne(
      { code: 'AETH2026' },
      { $set: { startDate: new Date('2026-04-01') } }
    );
    
    console.log('Fixed coupon AETH2026 start date:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
