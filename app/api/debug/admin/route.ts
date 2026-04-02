import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

export async function GET() {
  try {
    await dbConnect();
    
    // Check if admin user exists
    const admin = await UserModel.findOne({ email: 'admin@admin.com' });
    
    if (!admin) {
      return NextResponse.json({
        message: 'Admin user not found',
        exists: false
      });
    }
    
    return NextResponse.json({
      message: 'Admin user found',
      exists: true,
      admin: {
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        _id: admin._id.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Database error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}