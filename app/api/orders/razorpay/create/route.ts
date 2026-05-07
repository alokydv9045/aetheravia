import { auth } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';

export const POST = auth(async (req: any) => {
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { amount, orderId, paymentMethod } = await req.json();



    if (!amount || !orderId) {
      return Response.json(
        { message: 'Amount and order ID are required' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.createOrder(amount, {
      notes: {
        orderId,
        paymentMethod: paymentMethod || 'razorpay',
      },
    });



    return Response.json({
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('[RAZORPAY] Order creation failed:', error.message);
    return Response.json(
      { message: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
});