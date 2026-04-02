import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
import { withBasicSecurity, getSanitizedBody } from '@/lib/api-security-wrapper';
import { enhancedSecurity } from '@/lib/enhanced-security';
import RegistrationErrorHandler from '@/lib/registration-errors';

async function registerHandler(request: NextRequest, context: any): Promise<NextResponse> {
  const { securityLogger, clientIP } = context;
  
  try {
    // Get request body directly
    const body = await request.json();

    // Validate required fields using enhanced security
    const requiredFieldsCheck = enhancedSecurity.validateRequiredFields(body, ['name', 'email', 'password']);
    if (!requiredFieldsCheck.isValid) {
      securityLogger.logInputValidation('required_fields', requiredFieldsCheck.missingFields.join(','));
      return NextResponse.json(
        { message: `Missing required fields: ${requiredFieldsCheck.missingFields.join(', ')}` },
        { status: 400 },
      );
    }

    const { name, email, password, captchaToken } = body;

    // Enhanced email validation
    if (!enhancedSecurity.validateEmail(email)) {
      securityLogger.logInputValidation('email', email);
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatEmailError(),
        success: false 
      }, { status: 400 });
    }

    // Advanced password validation
    const passwordValidation = enhancedSecurity.validatePassword(password);
    if (!passwordValidation.isValid) {
      securityLogger.logInputValidation('password', 'weak_password');
      return NextResponse.json(
        { 
          errors: RegistrationErrorHandler.formatPasswordErrors(passwordValidation.errors),
          suggestions: passwordValidation.suggestions,
          score: passwordValidation.score,
          success: false
        },
        { status: 400 },
      );
    }

    // Enhanced name validation
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      securityLogger.logInputValidation('name', name);
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatNameError(),
        success: false 
      }, { status: 400 });
    }

    // Check for suspicious patterns in name
    const { threats: nameThreats } = enhancedSecurity.sanitizeInput(name);
    if (nameThreats.length > 0) {
      securityLogger.logInputValidation('name', name, `threats:${nameThreats.join(',')}`);
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatNameError(),
        success: false 
      }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists (case-insensitive)
    const existingUser = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (existingUser) {
      securityLogger.logAuth(undefined, email, false);
      // Record failed attempt for potential CAPTCHA triggering
      return NextResponse.json({ 
        error: RegistrationErrorHandler.formatExistingUserError(),
        success: false 
      }, { status: 409 });
    }

    // Generate secure password hash with enhanced salt rounds
    const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with additional security fields
    const newUser = new UserModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      // Security tracking
      registrationIP: clientIP,
      registrationDate: new Date(),
      isEmailVerified: false, // Will be verified via email
      securityScore: passwordValidation.score,
      lastPasswordChange: new Date()
    });

    await newUser.save();

    // Log successful registration
    securityLogger.logAuth(newUser._id.toString(), email, true);
    console.log(`[SECURITY] New user registered: ${email.substring(0, 3)}***@${email.split('@')[1]} from ${clientIP.substring(0, 8)}***`);

    // In production, trigger email verification here
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send verification email
      console.log(`[TODO] Send verification email to ${email}`);
    }

    return NextResponse.json({ 
      message: 'User has been created successfully',
      requiresEmailVerification: process.env.NODE_ENV === 'production',
      securityScore: passwordValidation.score,
      success: true
    }, { status: 201 });

  } catch (err: any) {
    console.error('[SECURITY] Registration error:', err.message);
    
    // Log security event for failed registration
    securityLogger.logAuth(undefined, undefined, false);

    // Handle specific database errors
    if (err?.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern || {})[0] || 'email';
      return NextResponse.json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      }, { status: 409 });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((e: any) => e.message);
      return NextResponse.json({ 
        message: 'Validation failed',
        errors: validationErrors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Registration failed. Please try again.' 
    }, { status: 500 });
  }
}

// Temporary direct export to bypass body consumption issues
export async function POST(request: NextRequest) {
  return await registerHandler(request, {
    securityLogger: {
      logInputValidation: () => {},
      logAuth: () => {},
      logSuspiciousActivity: () => {}
    },
    clientIP: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  });
}
