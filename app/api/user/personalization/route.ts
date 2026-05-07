import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { auth } from '@/lib/auth';
import Order from '@/lib/models/OrderModel';
import Product from '@/lib/models/ProductModel';
import Coupon from '@/lib/models/CouponModel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/user/personalization
// Returns personalized recommendations, exclusive coupons, and top deals for the user
export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    // 1. Recommendations (based on user's past purchased items frequency)
    let recommendations: any[] = [];
    if (userId) {
      const orders = await Order.find({ user: userId, isPaid: true })
        .select('items.product')
        .lean();

      const productIds = orders.flatMap((order: any) =>
        (order.items || []).map((item: any) => item.product).filter(Boolean)
      );

      if (productIds.length) {
        const freq: Record<string, number> = {};
        for (const id of productIds) freq[id] = (freq[id] || 0) + 1;
        const topProductIds = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);

        if (topProductIds.length) {
          recommendations = await Product.find({ _id: { $in: topProductIds } })
            .select('name slug image price rating numReviews category isFeatured')
            .lean();
        }
      }

      // Fallback if user history empty
      if (!recommendations.length) {
        recommendations = await Product.find({})
          .sort({ rating: -1, numReviews: -1 })
          .limit(5)
          .select('name slug image price rating numReviews category isFeatured')
          .lean();
      }
    } else {
      // Guest users: show top-rated / most-reviewed products
      recommendations = await Product.find({})
        .sort({ rating: -1, numReviews: -1 })
        .limit(5)
        .select('name slug image price rating numReviews category isFeatured')
        .lean();
    }

    // 2. Exclusive coupons (active & not expired). If user logged in include ones targeted to them OR global (empty allowedUsers array)
    const now = new Date();
    let couponFilter: any = {
      status: 'active',
      expiryDate: { $gte: now },
    };

    if (userId) {
      couponFilter.$or = [
        { allowedUsers: { $exists: false } },
        { allowedUsers: { $size: 0 } },
        { allowedUsers: userId },
      ];
    } else {
      // Guests only get globally available coupons
      couponFilter.$or = [
        { allowedUsers: { $exists: false } },
        { allowedUsers: { $size: 0 } },
      ];
    }

    const coupons = await Coupon.find(couponFilter)
      .limit(5)
      .select('code name description type value expiryDate minimumOrderAmount status')
      .lean();

    // 3. Top deals: use featured or highly-rated products (excluding already recommended ones)
    const recommendedIds = recommendations.map(p => p._id.toString());
    const topDeals = await Product.find({
      _id: { $nin: recommendedIds },
      $or: [
        { isFeatured: true },
        { rating: { $gte: 4.5 } },
      ],
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(5)
      .select('name slug image price rating numReviews category isFeatured')
      .lean();

    return NextResponse.json({
      recommendations,
      coupons,
      topDeals,
      meta: {
        userContext: !!userId,
        counts: {
          recommendations: recommendations.length,
          coupons: coupons.length,
          topDeals: topDeals.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Personalization API error:', error);
    return NextResponse.json(
      { error: 'Failed to load personalization data' },
      { status: 500 },
    );
  }
}
