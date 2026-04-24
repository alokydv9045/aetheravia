import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import CouponModel from '@/lib/models/CouponModel';
import OrderModel from '@/lib/models/OrderModel';

export const POST = auth(async (...request: any) => {
  const [req] = request;
  
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    const { couponCode, orderValue, shippingCost = 0 } = await req.json();
    
    if (!couponCode || orderValue === undefined) {
      return Response.json(
        { message: 'Coupon code and order value are required' },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await CouponModel.findOne({ 
      code: couponCode.toUpperCase() 
    });
    
    if (!coupon) {
      return Response.json(
        { 
          valid: false, 
          message: 'Invalid coupon code' 
        },
        { status: 404 }
      );
    }

    // Get user's order history to check for first-time user restrictions
    const userOrders = await OrderModel.find({ 
      user: req.auth.user.id,
      isPaid: true 
    });

    // Validate coupon for user
    const validation = coupon.isValidForUser(
      req.auth.user.id, 
      orderValue, 
      userOrders
    );
    
    if (!validation.valid) {
      return Response.json({
        valid: false,
        message: validation.reason
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderValue, shippingCost);
    
    return Response.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
      },
      discountAmount,
      finalAmount: Math.max(0, orderValue - discountAmount),
      message: `Coupon applied successfully! You saved ₹${discountAmount.toFixed(2)}`
    });

  } catch (error: any) {
    return Response.json(
      { message: 'Error validating coupon', error: error.message },
      { status: 500 }
    );
  }
});