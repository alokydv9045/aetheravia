import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { sanitizeRequestBody, validateRequiredFields, validateObjectId } from '@/lib/security';

// POST /api/user/referral/track
// Body: { referralCode: string, newUserId: string, newUserEmail: string }
// Called when a new user registers with a referral code
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Sanitize and validate input
    const rawBody = await req.json();
    const body = sanitizeRequestBody(rawBody);
    
    // Validate required fields
    const requiredFieldsCheck = validateRequiredFields(body, ['referralCode', 'newUserId']);
    if (!requiredFieldsCheck.isValid) {
      return NextResponse.json(
        { error: `Missing required fields: ${requiredFieldsCheck.missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    const { referralCode, newUserId, newUserEmail } = body;
    
    // Validate ObjectId format
    if (!validateObjectId(newUserId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    // Validate referral code format (alphanumeric, reasonable length)
    if (typeof referralCode !== 'string' || referralCode.length < 3 || referralCode.length > 20) {
      return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 });
    }
    
    const referrer = await User.findOne({ referralCode });
    const newUser = await User.findById(newUserId);
    
    if (!referrer || !newUser) {
      return NextResponse.json({ error: 'Invalid referral or user' }, { status: 404 });
    }
    
    // Prevent self-referral
    if (referrer._id.equals(newUser._id)) {
      return NextResponse.json({ error: 'Self-referral not allowed' }, { status: 400 });
    }
    
    // Only allow one referral per user
    if (newUser.referredBy) {
      return NextResponse.json({ error: 'User already referred' }, { status: 400 });
    }
    
    newUser.referredBy = referrer.referralCode;
    await newUser.save();
    
    // Optionally, award credits to referrer (e.g., 100 credits)
    referrer.referralCredits = (referrer.referralCredits || 0) + 100;
    referrer.referralHistory.push({
      referredUserId: newUser._id,
      referredUserEmail: newUserEmail,
      reward: 100,
      date: new Date(),
    });
    await referrer.save();
    
    console.log(`[SECURITY] Referral tracked: ${newUserId.substring(0, 8)}*** referred by ${referralCode}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Referral tracking error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process referral tracking' },
      { status: 500 }
    );
  }
}
