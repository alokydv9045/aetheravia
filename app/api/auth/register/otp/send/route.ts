import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
import RegisterVerificationModel from '@/lib/models/RegisterVerificationModel';
import { emailService } from '@/lib/notifications/email';
import { enhancedSecurity } from '@/lib/enhanced-security';
import RegistrationErrorHandler from '@/lib/registration-errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // 2. Enhanced Security Validation
    if (!enhancedSecurity.validateEmail(email)) {
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatEmailError(),
        success: false 
      }, { status: 400 });
    }

    const passwordValidation = enhancedSecurity.validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        errors: RegistrationErrorHandler.formatPasswordErrors(passwordValidation.errors),
        success: false 
      }, { status: 400 });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatNameError(),
        success: false 
      }, { status: 400 });
    }

    await dbConnect();

    // 3. Check if user already exists in main UserModel
    const existingUser = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatExistingUserError(),
        success: false 
      }, { status: 409 });
    }

    // 4. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 12);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 5. Save to temporary RegisterVerificationModel
    // Upsert behavior: if an entry for this email exists, update it
    await RegisterVerificationModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name: name.trim(),
        password: hashedPassword,
        otp: hashedOtp,
        otpExpiry: otpExpiry,
      },
      { upsert: true, new: true }
    );

    // 6. Send OTP Email
    await emailService.sendRegisterOtp(email, otp);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error: any) {
    console.error('Registration OTP Send Error:', error);
    return NextResponse.json(
      { message: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
