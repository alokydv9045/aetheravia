import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { auth } from '@/lib/auth';
import PopupBanner from '@/lib/models/PopupBannerModel';
import Product from '@/lib/models/ProductModel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/user/offers
// Returns active popups, banners, targeted offers, and flash sales for the homepage
export async function GET() {
  await dbConnect();
  const session = await auth();
  const userId = session?.user?.id;
  const now = new Date();

  // Active popups/banners (scheduled, active, and for this audience)
  const popups = await PopupBanner.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $lte: now }, endDate: { $gte: now } },
          { startDate: null, endDate: null },
        ],
      },
      {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: userId ? 'returning' : 'new-users' },
        ],
      },
    ],
  });

  // Flash sales: products with a flashSale flag and active period
  const flashSales = await Product.find({
    flashSale: true,
    flashSaleStart: { $lte: now },
    flashSaleEnd: { $gte: now },
  });

  // Targeted offers: could be extended to use user segments, purchase history, etc.
  // For now, show all active popups/banners and flash sales

  return NextResponse.json({ popups, flashSales });
}
