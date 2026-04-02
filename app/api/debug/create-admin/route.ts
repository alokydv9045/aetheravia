import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: {
          name: existingAdmin.name,
          email: existingAdmin.email,
          isAdmin: existingAdmin.isAdmin
        }
      });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await UserModel.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      isAdmin: true
    });
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        _id: admin._id.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}