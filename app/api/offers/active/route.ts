import { NextResponse } from 'next/server';

// Always resolve at runtime; depends on DB and current date
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Offer from '../../../../lib/models/OfferModel';

export async function GET() {
  try {
    await dbConnect();
    
    const now = new Date();
    
    // Find active offers that are within their date range
    const offers = await Offer.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}