import { NextResponse } from 'next/server';
import seedAdmin from '@/lib/seedAdmin';

export async function GET() {
  // Guard: only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const admin = await seedAdmin();
    
    return NextResponse.json({
      success: true,
      message: 'Admin user check/creation completed',
      admin: {
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        _id: admin._id.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create/check admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}