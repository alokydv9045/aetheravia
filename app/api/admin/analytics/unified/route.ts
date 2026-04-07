// Unified Analytics API for BellaModa Admin Dashboard
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/OrderModel';
import ProductModel from '@/lib/models/ProductModel';
import UserModel from '@/lib/models/UserModel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = auth(async (req: any) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Parallel data fetching for better performance
    const [
      overviewData,
      salesTrends,
      productMetrics,
      customerInsights,
      orderAnalytics,
      marketingMetrics
    ] = await Promise.all([
      getOverviewData(startDate),
      getSalesTrends(startDate),
      getProductMetrics(startDate),
      getCustomerInsights(startDate),
      getOrderAnalytics(startDate),
      getMarketingMetrics(startDate)
    ]);

    const analytics = {
      overview: overviewData,
      salesTrends,
      productMetrics,
      customerInsights,
      orderAnalytics,
      marketingMetrics
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[Unified Analytics API] Error:', error);
    return NextResponse.json(
      { message: 'Failed to load analytics data' },
      { status: 500 }
    );
  }
});

// Core business overview metrics
async function getOverviewData(startDate: Date) {
  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    paidOrders,
    uniqueCustomers
  ] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]).then(r => r[0]?.total || 0),
    
    Order.countDocuments(),
    UserModel.countDocuments(),
    ProductModel.countDocuments(),
    
    Order.find({ isPaid: true, createdAt: { $gte: startDate } }),
    Order.distinct('user', { isPaid: true, createdAt: { $gte: startDate } })
  ]);

  const conversionRate = totalUsers > 0 ? (uniqueCustomers.length / totalUsers) * 100 : 0;
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  
  // Calculate CLV (simplified)
  const customerLifetimeValue = avgOrderValue * 3.5; // Estimated based on repeat purchase rate

  return {
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    conversionRate,
    avgOrderValue,
    customerLifetimeValue
  };
}

// Sales trends over time
async function getSalesTrends(startDate: Date) {
  const trends = await Order.aggregate([
    { 
      $match: { 
        isPaid: true, 
        createdAt: { $gte: startDate } 
      } 
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        users: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        date: '$_id',
        revenue: 1,
        orders: 1,
        users: { $size: '$users' }
      }
    },
    { $sort: { date: 1 } }
  ]);

  return trends;
}

// Product performance metrics
async function getProductMetrics(startDate: Date) {
  const [topProducts, categoryPerformance, lowStock] = await Promise.all([
    // Top performing products
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems._id',
          name: { $first: '$orderItems.name' },
          quantity: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
        }
      },
      {
        $project: {
          name: 1,
          quantity: 1,
          revenue: 1,
          margin: { $multiply: [{ $divide: ['$revenue', { $add: ['$revenue', 100] }] }, 100] } // Simplified margin calculation
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]),

    // Category performance
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.category',
          revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
          count: { $sum: '$orderItems.qty' }
        }
      },
      {
        $project: {
          category: '$_id',
          revenue: 1,
          count: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Low stock products
    ProductModel.find({ countInStock: { $lte: 5 } })
      .select('name countInStock')
      .limit(20)
      .then(products => products.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.countInStock
      })))
  ]);

  return {
    topProducts,
    categoryPerformance,
    lowStock
  };
}

// Customer insights and segmentation
async function getCustomerInsights(startDate: Date) {
  const [
    newCustomers,
    returningCustomers,
    loyaltyUsers,
    referralData,
    customerSegments
  ] = await Promise.all([
    UserModel.countDocuments({ createdAt: { $gte: startDate } }),
    
    Order.distinct('user', { 
      user: { 
        $in: await Order.distinct('user', { 
          createdAt: { $lt: startDate } 
        }) 
      },
      createdAt: { $gte: startDate }
    }).then(users => users.length),

    UserModel.countDocuments({ loyaltyPoints: { $gt: 0 } }),

    // Referral statistics (simplified)
    UserModel.aggregate([
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: { $cond: [{ $gt: ['$referralCode', ''] }, 1, 0] } },
          successfulReferrals: { $sum: { $cond: [{ $gt: ['$referredBy', ''] }, 1, 0] } }
        }
      }
    ]).then(r => ({
      totalReferrals: r[0]?.totalReferrals || 0,
      successfulReferrals: r[0]?.successfulReferrals || 0,
      referralRevenue: r[0]?.successfulReferrals * 500 || 0 // Estimated
    })),

    // Customer segmentation by order value
    Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gt: ['$totalSpent', 10000] }, then: 'VIP' },
                { case: { $gt: ['$totalSpent', 5000] }, then: 'Premium' },
                { case: { $gt: ['$totalSpent', 1000] }, then: 'Regular' }
              ],
              default: 'New'
            }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalSpent' }
        }
      },
      {
        $project: {
          segment: '$_id',
          count: 1,
          revenue: 1
        }
      }
    ])
  ]);

  const totalCustomers = await UserModel.countDocuments();
  const loyaltyEngagement = totalCustomers > 0 ? (loyaltyUsers / totalCustomers) * 100 : 0;

  return {
    newCustomers,
    returningCustomers,
    loyaltyEngagement,
    referralStats: referralData,
    segmentation: customerSegments
  };
}

// Order analytics and processing metrics
async function getOrderAnalytics(startDate: Date) {
  const [statusDistribution, processingTimes, ordersByRegion] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).then(results => {
      const distribution: Record<string, number> = {};
      results.forEach(item => {
        distribution[item._id] = item.count;
      });
      return distribution;
    }),

    // Calculate average processing time (simplified)
    Order.aggregate([
      { $match: { status: { $ne: 'pending' } } },
      {
        $group: {
          _id: null,
          avgTime: { 
            $avg: { 
              $divide: [
                { $subtract: ['$updatedAt', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        }
      }
    ]).then(r => Math.round(r[0]?.avgTime || 24)),

    // Orders by region (simplified - using shipping city as region)
    Order.aggregate([
      { $match: { isPaid: true, shippingAddress: { $exists: true } } },
      {
        $group: {
          _id: '$shippingAddress.city',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          region: '$_id',
          count: 1,
          revenue: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    statusDistribution,
    avgProcessingTime: processingTimes,
    ordersByRegion
  };
}

// Logistics metrics (Deprecated)
async function getLogisticsMetrics(startDate: Date) {
  return {
    totalShipments: 0,
    deliveryRate: 0,
    avgDeliveryTime: 0,
    shippingCosts: 0,
    providerPerformance: [],
    deliveryTrends: []
  };
}

// Marketing and campaign metrics
async function getMarketingMetrics(startDate: Date) {
  try {
    const [offerStats, couponStats, emailStats] = await Promise.all([
      // Simulated offer performance (replace with actual Offer model when available)
      Promise.resolve({
        activeOffers: 5,
        offerRedemption: 150
      }),

      // Simulated coupon usage (replace with actual Coupon model when available)
      Promise.resolve(25),

      // Simulated email metrics (replace with actual email service data)
      {
        sent: 1500,
        opened: 900,
        clicked: 270
      }
    ]);

    // Calculate campaign ROI (simplified)
    const campaignROI = offerStats.offerRedemption > 0 ? 
      (offerStats.offerRedemption * 100) / (offerStats.activeOffers * 50) : 0;

    return {
      activeOffers: offerStats.activeOffers,
      offerRedemption: offerStats.offerRedemption,
      couponUsage: couponStats,
      campaignROI,
      emailMetrics: emailStats
    };
  } catch (error) {
    console.error('Error fetching marketing metrics:', error);
    // Return default values if models don't exist
    return {
      activeOffers: 0,
      offerRedemption: 0,
      couponUsage: 0,
      campaignROI: 0,
      emailMetrics: {
        sent: 0,
        opened: 0,
        clicked: 0
      }
    };
  }
}