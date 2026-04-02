import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import CouponModel from '@/lib/models/CouponModel';

export const GET = auth(async (...request: any) => {
  const [req, { params }] = request;
  
  if (!req.auth?.user?.isAdmin) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const coupon = await CouponModel.findById(params.id)
      .populate('createdBy', 'name email');

    if (!coupon) {
      return Response.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return Response.json(coupon);
  } catch (error: any) {
    return Response.json(
      { message: 'Error fetching coupon', error: error.message },
      { status: 500 }
    );
  }
});

export const PUT = auth(async (...request: any) => {
  const [req, { params }] = request;
  
  if (!req.auth?.user?.isAdmin) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Find the coupon
    const coupon = await CouponModel.findById(params.id);
    
    if (!coupon) {
      return Response.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if code is being changed and if new code already exists
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await CouponModel.findOne({ 
        code: body.code.toUpperCase(),
        _id: { $ne: params.id }
      });
      
      if (existingCoupon) {
        return Response.json(
          { message: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (body.startDate && body.expiryDate) {
      const start = new Date(body.startDate);
      const expiry = new Date(body.expiryDate);
      
      if (expiry <= start) {
        return Response.json(
          { message: 'Expiry date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Update coupon
    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      params.id,
      {
        ...body,
        code: body.code ? body.code.toUpperCase() : coupon.code,
      },
      { new: true, runValidators: true }
    );

    return Response.json(
      { message: 'Coupon updated successfully', coupon: updatedCoupon }
    );
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return Response.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return Response.json(
      { message: 'Error updating coupon', error: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async (...request: any) => {
  const [req, { params }] = request;
  
  if (!req.auth?.user?.isAdmin) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const coupon = await CouponModel.findById(params.id);
    
    if (!coupon) {
      return Response.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    if (coupon.usageCount > 0) {
      return Response.json(
        { message: 'Cannot delete coupon that has been used. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    await CouponModel.findByIdAndDelete(params.id);

    return Response.json(
      { message: 'Coupon deleted successfully' }
    );
  } catch (error: any) {
    return Response.json(
      { message: 'Error deleting coupon', error: error.message },
      { status: 500 }
    );
  }
});