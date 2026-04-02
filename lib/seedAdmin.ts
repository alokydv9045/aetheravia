import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

export default async function seedAdmin() {
  await dbConnect();
  
  try {
    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        isAdmin: existingAdmin.isAdmin
      });
      
      // If admin exists but isAdmin is false, update it
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('Updated admin user with isAdmin: true');
      }
      
      return existingAdmin;
    }
    
    // Create admin user if doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await UserModel.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      isAdmin: true
    });
    
    console.log('Admin user created:', {
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      _id: admin._id.toString()
    });
    
    return admin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}