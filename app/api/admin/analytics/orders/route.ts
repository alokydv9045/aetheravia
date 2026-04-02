import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { NextRequest } from 'next/server';

export const GET = auth(async (...args: any) => {
  const [req] = args as [NextRequest];
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    } else {
      const daysAgo = parseInt(period);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysAgo);
      dateFilter = {
        createdAt: { $gte: fromDate }
      };
    }

    // Get current period data with enhanced analytics
    const [
      totalOrdersResult,
      totalRevenueResult,
      ordersByStatusResult,
      ordersByPaymentMethodResult,
      topProductsResult,
      customerMetricsResult,
      dailyOrdersResult,
      averageOrderValueResult,
      recentOrdersResult,
      monthlyTrendsResult,
      statusDistribution,
      todayStatsResult
    ] = await Promise.all([
      // Total orders in period
      OrderModel.countDocuments(dateFilter),

      // Total revenue in period
      OrderModel.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),

      // Orders by status
      OrderModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Orders by payment method
      OrderModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Top selling products
      OrderModel.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.productId',
            name: { $first: '$orderItems.name' },
            totalQuantity: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            avgPrice: { $avg: '$orderItems.price' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]),

      // Customer metrics
      OrderModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            uniqueCustomers: { $addToSet: '$user' },
            totalOrders: { $sum: 1 }
          }
        },
        {
          $project: {
            uniqueCustomers: { $size: '$uniqueCustomers' },
            totalOrders: 1
          }
        }
      ]),

      // Daily orders trend
      OrderModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] } }
          }
        },
        { $sort: { '_id': 1 } },
        { $limit: 30 }
      ]),

      // Average order value
      OrderModel.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, avgOrderValue: { $avg: '$totalPrice' } } }
      ]),

      // Recent orders
      OrderModel.find(dateFilter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Monthly trends (last 6 months)
      OrderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] } },
            avgOrderValue: { $avg: '$totalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Legacy status distribution for compatibility with revenue
      OrderModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] } }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            revenue: 1,
            _id: 0
          }
        }
      ]),

      // Today's stats
      (() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        
        return OrderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfToday,
                $lt: endOfToday
              }
            }
          },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              revenue: { $sum: '$totalPrice' }
            }
          }
        ]);
      })()
    ]);

    // Calculate comparison with previous period
    const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
    const periodDays = parseInt(period);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
    const previousPeriodFilter = {
      createdAt: {
        $gte: previousPeriodStart,
        $lt: dateFilter.createdAt.$gte
      }
    };

    const [previousOrders, previousRevenue] = await Promise.all([
      OrderModel.countDocuments(previousPeriodFilter),
      OrderModel.aggregate([
        { $match: { ...previousPeriodFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    // Calculate percentage changes
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = previousOrders > 0 ? ((totalOrdersResult - previousOrders) / previousOrders) * 100 : 0;

    // Calculate status counts for legacy compatibility
    const statusCounts = statusDistribution.reduce((acc: any, status: any) => {
      acc[status.status] = status.count;
      return acc;
    }, {});

    // Format enhanced analytics response
    const analytics = {
      // Legacy metrics for backward compatibility
      metrics: {
        totalOrders: totalOrdersResult,
        pendingOrders: statusCounts.pending || 0,
        confirmedOrders: statusCounts.confirmed || 0,
        shippedOrders: statusCounts.shipped || 0,
        deliveredOrders: statusCounts.delivered || 0,
        totalRevenue,
        todayOrders: todayStatsResult[0]?.orders || 0,
        todayRevenue: todayStatsResult[0]?.revenue || 0,
      },

      // Enhanced analytics
      overview: {
        totalOrders: totalOrdersResult,
        totalRevenue,
        avgOrderValue: averageOrderValueResult[0]?.avgOrderValue || 0,
        uniqueCustomers: customerMetricsResult[0]?.uniqueCustomers || 0,
        changes: {
          orders: ordersChange,
          revenue: revenueChange
        }
      },
      
      ordersByStatus: ordersByStatusResult.map(item => ({
        status: item._id || 'unknown',
        count: item.count,
        percentage: totalOrdersResult > 0 ? (item.count / totalOrdersResult) * 100 : 0
      })),
      
      ordersByPaymentMethod: ordersByPaymentMethodResult.map(item => ({
        method: item._id || 'unknown',
        count: item.count,
        percentage: totalOrdersResult > 0 ? (item.count / totalOrdersResult) * 100 : 0
      })),
      
      topProducts: topProductsResult.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue,
        avgPrice: item.avgPrice
      })),
      
      dailyTrends: dailyOrdersResult.map(item => ({
        date: item._id,
        orders: item.orders,
        revenue: item.revenue
      })),

      // Legacy format for existing dashboard
      dailyStats: dailyOrdersResult.map(item => ({
        date: item._id,
        orders: item.orders,
        revenue: item.revenue
      })),
      
      monthlyTrends: monthlyTrendsResult.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        orders: item.orders,
        revenue: item.revenue,
        avgOrderValue: item.avgOrderValue
      })),
      
      recentOrders: recentOrdersResult.map((order: any) => ({
        _id: order._id,
        customer: order.user?.name || 'Unknown',
        email: order.user?.email || '',
        user: order.user, // Legacy format
        total: order.totalPrice,
        totalPrice: order.totalPrice, // Legacy format
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.orderItems?.length || 0,
        items: order.orderItems?.map((item: any) => ({
          name: item.name,
          qty: item.quantity
        })) || []
      })),

      // Legacy status distribution
      statusDistribution: statusDistribution.map((status: any) => ({
        _id: status.status || status._id,
        count: status.count,
        revenue: status.revenue || 0,
        percentage: totalOrdersResult > 0 ? (status.count / totalOrdersResult) * 100 : 0
      })),
      
      filters: {
        period,
        startDate: startDate || null,
        endDate: endDate || null,
        dateRange: {
          start: dateFilter.createdAt.$gte,
          end: dateFilter.createdAt.$lte || new Date()
        }
      }
    };

    return Response.json(analytics);

  } catch (error) {
    console.error('Error fetching order analytics:', error);
    return Response.json(
      { message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});