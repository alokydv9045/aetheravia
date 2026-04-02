import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { razorpay } from '@/lib/razorpay';

export const POST = auth(async (req: any) => {
  if (!req.auth) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return Response.json(
        { message: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValidSignature = await razorpay.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return Response.json(
        { message: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpay.getPaymentDetails(razorpay_payment_id);

    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      return Response.json(
        { message: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Update order in database
    await dbConnect();
    
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: paymentDetails.status,
      update_time: new Date().toISOString(),
      email_address: paymentDetails.email || '',
    };

    await order.save();

    return Response.json({
      message: 'Payment verified successfully',
      order: order,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return Response.json(
      { message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
});