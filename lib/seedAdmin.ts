import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

export default async function seedAdmin() {
  await dbConnect();
  
  try {
    // 1. Ensure Admin exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@admin.com' });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 12);
      await UserModel.create({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedAdminPassword,
        isAdmin: true
      });
      console.log('Admin user created');
    } else if (!existingAdmin.isAdmin) {
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
    }

    // 2. Ensure Test user exists (test@test.com / test)
    const existingTest = await UserModel.findOne({ email: 'test@test.com' });
    if (!existingTest) {
      const hashedTestPassword = await bcrypt.hash('test', 12);
      await UserModel.create({
        name: 'Test Account',
        email: 'test@test.com',
        password: hashedTestPassword,
        isAdmin: false
      });
      console.log('Test user created');
    }

    return await UserModel.findOne({ email: 'admin@admin.com' });
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}