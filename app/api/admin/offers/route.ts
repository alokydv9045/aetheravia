import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '../../../../lib/models/OfferModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// GET: List all offers
export async function GET(request: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (type) {
    filter.type = type;
  }

  const offers = await Offer.find(filter)
    .sort({ isActive: -1, priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Offer.countDocuments(filter);

  return NextResponse.json({
    offers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

// POST: Create a new offer
export async function POST(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const data = await req.json();
  const offer = new Offer(data);
  await offer.save();
  return NextResponse.json(offer);
}

// PUT: Update an offer
export async function PUT(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const { offerId, ...update } = await req.json();
  const offer = await Offer.findByIdAndUpdate(offerId, update, { new: true });
  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  return NextResponse.json(offer);
}

// DELETE: Remove an offer
export async function DELETE(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  const { offerId } = await req.json();
  await Offer.findByIdAndDelete(offerId);
  return NextResponse.json({ success: true });
}
