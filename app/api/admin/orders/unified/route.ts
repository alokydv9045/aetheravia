import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await requireAdminSession();
    if (!session || !(session as any).user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const deliveryPartner = searchParams.get('deliveryPartner') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { _id: searchRegex },
        { 'user.name': searchRegex },
        { 'user.email': searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.email': searchRegex },
      ];
    }

    // Status filter
    if (status) {
      query.$or = [
        { status: status },
        { orderStatus: status }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalPrice = {};
      if (minAmount) {
        query.totalPrice.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.totalPrice.$lte = parseFloat(maxAmount);
      }
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Delivery partner filter
    if (deliveryPartner) {
      if (deliveryPartner === 'unassigned') {
        query.deliveryPartner = { $exists: false };
      } else {
        query['deliveryPartner.provider'] = deliveryPartner;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(query)
        .populate('user', 'name email')
        .populate('deliveryPartner.assignedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate stats
    const [statsResult] = await OrderModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          pendingOrders: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'pending'] },
                    { $eq: ['$orderStatus', 'pending'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'delivered'] },
                    { $eq: ['$orderStatus', 'delivered'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    const stats = statsResult || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      averageOrderValue: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        stats: {
          totalOrders: stats.totalOrders || 0,
          totalRevenue: stats.totalRevenue || 0,
          pendingOrders: stats.pendingOrders || 0,
          deliveredOrders: stats.deliveredOrders || 0,
          averageOrderValue: stats.averageOrderValue || 0,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching unified orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin session
    const session = await requireAdminSession();
    if (!session || !(session as any).user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { action, orderIds, status } = body;

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'bulkStatusUpdate':
        if (!status) {
          return NextResponse.json(
            { message: 'Status is required for bulk status update' },
            { status: 400 }
          );
        }

        result = await OrderModel.updateMany(
          { _id: { $in: orderIds } },
          { 
            $set: { 
              status: status,
              orderStatus: status,
              updatedAt: new Date()
            }
          }
        );

        return NextResponse.json({
          success: true,
          message: `Successfully updated ${result.modifiedCount} orders`,
          modifiedCount: result.modifiedCount
        });

      case 'bulkDelete':
        result = await OrderModel.deleteMany({
          _id: { $in: orderIds }
        });

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${result.deletedCount} orders`,
          deletedCount: result.deletedCount
        });

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in bulk operations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}