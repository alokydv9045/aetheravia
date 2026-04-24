import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
import RegisterVerificationModel from '@/lib/models/RegisterVerificationModel';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Find the pending registration
    const pendingUser = await RegisterVerificationModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (!pendingUser) {
      return NextResponse.json(
        { message: 'Verification record not found or expired' },
        { status: 404 }
      );
    }

    // 2. Check expiry
    if (new Date() > pendingUser.otpExpiry) {
      return NextResponse.json(
        { message: 'Verification code has expired' },
        { status: 410 }
      );
    }

    // 3. Verify OTP
    const isMatch = await bcrypt.compare(otp, pendingUser.otp);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // 4. Check if user was created by another process in the meantime
    const existingUser = await UserModel.findOne({ email: pendingUser.email });
    if (existingUser) {
      await RegisterVerificationModel.deleteOne({ _id: pendingUser._id });
      return NextResponse.json(
        { message: 'Account already created. Please sign in.' },
        { status: 409 }
      );
    }

    // 5. Create actual User
    const newUser = new UserModel({
      name: pendingUser.name,
      email: pendingUser.email.toLowerCase(),
      password: pendingUser.password,
      isAdmin: false,
    });

    await newUser.save();

    // 6. Cleanup
    await RegisterVerificationModel.deleteOne({ _id: pendingUser._id });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now sign in.'
    });

  } catch (error: any) {
    console.error('Registration OTP Verify Error:', error);
    return NextResponse.json(
      { message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
