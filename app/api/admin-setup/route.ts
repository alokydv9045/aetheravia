export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';

// Guard: only allow in development
function assertDevOnly() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This endpoint is disabled in production');
  }
}

export async function POST() {
  try {
    assertDevOnly();
    await dbConnect();
    
    // Delete any existing admin user first
    await UserModel.deleteOne({ email: 'admin@admin.com' });
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await UserModel.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      isAdmin: true
    });
    
    // Verify the created user
    const createdAdmin = await UserModel.findOne({ email: 'admin@admin.com' });
    
    if (!createdAdmin) {
      return NextResponse.json({ success: false, message: 'Admin creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        name: createdAdmin.name,
        email: createdAdmin.email,
        isAdmin: createdAdmin.isAdmin,
        _id: createdAdmin._id.toString()
      }
    });
  } catch (error) {
    const status = (error as Error).message?.includes('disabled') ? 403 : 500;
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create admin user',
    }, { status });
  }
}

export async function GET() {
  try {
    assertDevOnly();
    await dbConnect();
    
    const admin = await UserModel.findOne({ email: 'admin@admin.com' });
    
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin user not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        _id: admin._id.toString()
      }
    });
  } catch (error) {
    const status = (error as Error).message?.includes('disabled') ? 403 : 500;
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to check admin user',
    }, { status });
  }
}