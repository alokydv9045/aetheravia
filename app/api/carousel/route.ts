import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannerModel from '@/lib/models/BannerModel';

// Ensure this handler runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs';
// Banners can change frequently; avoid caching at the route level
export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    await dbConnect();
    // Only return active banners, sorted by order and creation date
    const banners = await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    // Map to carousel item shape
    let items = banners.map((banner) => ({
      key: banner._id.toString(),
      href: banner.link || '/shop',
      src: banner.image,
      alt: banner.title || 'Banner',
    }));

    // If no admin banners, use default banner images from public folder
    if (items.length === 0) {
      items = [
        {
          key: 'banner0',
          href: '/shop',
          src: '/images/banner/banner0.jpg',
          alt: 'Aetheravia - Natural Skincare Collection',
        },
        {
          key: 'banner1',
          href: '/about',
          src: '/images/banner/banner1.jpg',
          alt: 'Sustainable Beauty Products',
        },
        {
          key: 'banner2',
          href: '/ingredients',
          src: '/images/banner/banner2.jpg',
          alt: 'Pure Natural Ingredients',
        },
      ];
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[API /api/carousel] Returning banners:', items);
    }
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/carousel] Error:', err?.message || err);
    // Return default banners even on error
    const defaultItems = [
      {
        key: 'banner0',
        href: '/shop',
        src: '/images/banner/banner0.jpg',
        alt: 'Aetheravia - Natural Skincare Collection',
      },
      {
        key: 'banner1',
        href: '/about',
        src: '/images/banner/banner1.jpg',
        alt: 'Sustainable Beauty Products',
      },
      {
        key: 'banner2',
        href: '/ingredients',
        src: '/images/banner/banner2.jpg',
        alt: 'Pure Natural Ingredients',
      },
    ];
    return NextResponse.json(defaultItems, { status: 200 });
  }
};
