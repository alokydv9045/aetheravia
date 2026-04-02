import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '../../../../../lib/models/UserModel';
import Offer from '../../../../../lib/models/OfferModel';
import Coupon from '../../../../../lib/models/CouponModel';
import Order from '../../../../../lib/models/OrderModel';

export async function GET() {
  try {
    await dbConnect();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active offers (within date range)
    const now = new Date();
    const activeOffers = await Offer.countDocuments({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } }
      ]
    });

    // Get coupon statistics
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({
      status: 'active',
      expiryDate: { $gte: now }
    });

    // Get order statistics
    const totalOrders = await Order.countDocuments({ isPaid: true });
    
    // Calculate total revenue
    const revenueAggregation = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;

    // Get loyalty users (users with loyalty points > 0)
    const loyaltyUsers = await User.countDocuments({
      'loyalty.points': { $gt: 0 }
    });

    // Get referral count (users who made referrals)
    const referralCount = await User.countDocuments({
      'referral.referredUsers': { $exists: true, $not: { $size: 0 } }
    });

    return NextResponse.json({
      totalUsers,
      activeOffers,
      totalCoupons,
      activeCoupons,
      totalOrders,
      totalRevenue,
      loyaltyUsers,
      referralCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}