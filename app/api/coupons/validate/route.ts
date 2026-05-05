import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import CouponModel from '@/lib/models/CouponModel';
import OrderModel from '@/lib/models/OrderModel';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Optional auth
    const session = await auth();
    const userId = session?.user?.id;
    
    const { couponCode, orderValue, shippingCost = 0, items = [] } = await req.json();
    
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

    // Get user's order history if authenticated
    let userOrders = [];
    if (userId) {
      userOrders = await OrderModel.find({ 
        user: userId,
        isPaid: true 
      });
    }

    // Validate coupon
    const validation = coupon.isValidForUser(
      userId, 
      orderValue, 
      userOrders,
      items
    );
    
    if (!validation.valid) {
      return Response.json({
        valid: false,
        message: validation.reason
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderValue, shippingCost, items);
    
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
}