const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function deleteProduct() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('products').deleteOne({ slug: 'gentle-hydrating-cleanser' });
    
    if (result.deletedCount === 1) {
      console.log('Successfully deleted Gentle Hydrating Cleanser');
    } else {
      console.log('Product not found or already deleted');
    }
  } catch (err) {
    console.error('Error deleting product:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

deleteProduct();
