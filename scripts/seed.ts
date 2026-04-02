import dbConnect from '../lib/dbConnect';
import data from '../lib/data';
import UserModel from '../lib/models/UserModel';
import ProductModel from '../lib/models/ProductModel';

const main = async () => {
  try {
    await dbConnect();
    
    // Delete existing data
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    
    // Insert users
    const insertedUsers = await UserModel.insertMany(data.users);
    console.log(`✓ Inserted ${insertedUsers.length} users`);
    
    // Insert products
    const insertedProducts = await ProductModel.insertMany(data.products);
    console.log(`✓ Inserted ${insertedProducts.length} products`);
    
    // Verify admin user
    const admin = await UserModel.findOne({ email: 'admin@admin.com' });
    console.log(`✓ Admin user exists: ${admin?.name} (isAdmin: ${admin?.isAdmin})`);
    
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

main();