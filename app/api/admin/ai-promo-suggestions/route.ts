export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/OrderModel';
import Product from '@/lib/models/ProductModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// This is a placeholder for AI logic. In production, connect to an AI service or use a local model.
interface ProductType { name: string }
interface PromoArgs {
  topProducts: ProductType[];
  lowStockProducts: ProductType[];
  slowSellers: ProductType[];
}
function generatePromoSuggestions({ topProducts, lowStockProducts, slowSellers }: PromoArgs) {
  const suggestions = [];
  if (topProducts.length > 0) {
    suggestions.push(`Run a flash sale on bestsellers: ${topProducts.map((p: ProductType) => p.name).join(', ')}`);
  }
  if (lowStockProducts.length > 0) {
    suggestions.push(`Restock soon: ${lowStockProducts.map((p: ProductType) => p.name).join(', ')}`);
  }
  if (slowSellers.length > 0) {
    suggestions.push(`Offer discounts on slow-moving items: ${slowSellers.map((p: ProductType) => p.name).join(', ')}`);
  }
  if (suggestions.length === 0) {
    suggestions.push('No urgent promotions needed.');
  }
  return suggestions;
}

// GET /api/admin/ai-promo-suggestions
export async function GET() {
  await dbConnect();
  await requireAdminSession();

  // Top selling products (last 30 days)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: since } } },
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product', qty: { $sum: '$orderItems.qty' } } },
    { $sort: { qty: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    { $replaceRoot: { newRoot: '$productInfo' } },
  ]);

  // Low stock products
  const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } }).limit(5);

  // Slow sellers (not sold in last 30 days)
  const soldProductIds = topProducts.map(p => p._id);
  const slowSellers = await Product.find({ _id: { $nin: soldProductIds } }).limit(5);

  const suggestions = generatePromoSuggestions({ topProducts, lowStockProducts, slowSellers });

  return NextResponse.json({ suggestions, topProducts, lowStockProducts, slowSellers });
}
