import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { razorpay } from '@/lib/razorpay';
import { awardPointsForOrder } from '@/lib/services/loyaltyService';

export const POST = auth(async (req: any, { params }: any) => {
  const { id } = await params;
  if (!req.auth) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      },
    );
  }
  await dbConnect();
  const order = await OrderModel.findById(id);
  if (order) {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();
      
      const isValidSignature = await razorpay.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );
      
      if (isValidSignature) {
        if (order.isPaid) {
          return Response.json(order);
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: 'completed',
          email_address: req.auth.user?.email || '',
        };
        const updatedOrder = await order.save();
        
        // Award Loyalty Points & Handle Referrals
        try {
          await awardPointsForOrder(order._id.toString(), req.auth.user._id || req.auth.user.id);
        } catch (loyaltyError) {
          console.error('[LOYALTY_ERROR]:', loyaltyError);
          // Don't fail the payment response if loyalty awarding fails
        }

        return Response.json(updatedOrder);
      } else {
        return Response.json(
          { message: 'Invalid payment signature' },
          {
            status: 400,
          },
        );
      }
    } catch (err: any) {
      return Response.json(
        { message: err.message },
        {
          status: 500,
        },
      );
    }
  } else {
    return Response.json(
      { message: 'Order not found' },
      {
        status: 404,
      },
    );
  }
}) as any;
