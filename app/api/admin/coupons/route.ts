import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import CouponModel from '@/lib/models/CouponModel';

export const GET = auth(async (...request: any) => {
  const [req] = request;
  
  if (!req.auth?.user?.isAdmin) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const coupons = await CouponModel.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return Response.json(coupons);
  } catch (error: any) {
    return Response.json(
      { message: 'Error fetching coupons', error: error.message },
      { status: 500 }
    );
  }
});

export const POST = auth(async (...request: any) => {
  const [req] = request;
  
  if (!req.auth?.user?.isAdmin) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Validate required fields
    const {
      code,
      name,
      type,
      value,
      startDate,
      expiryDate,
      usagePerUser = 1,
      ...rest
    } = body;

    if (!code || !name || !type || value === undefined || !startDate || !expiryDate) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (existingCoupon) {
      return Response.json(
        { message: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    
    if (expiry <= start) {
      return Response.json(
        { message: 'Expiry date must be after start date' },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = new CouponModel({
      code: code.toUpperCase(),
      name,
      type,
      value,
      startDate: start,
      expiryDate: expiry,
      usagePerUser,
      createdBy: req.auth.user.id,
      ...rest,
    });

    await coupon.save();

    return Response.json(
      { message: 'Coupon created successfully', coupon },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return Response.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return Response.json(
      { message: 'Error creating coupon', error: error.message },
      { status: 500 }
    );
  }
});