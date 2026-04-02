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
      query.orderStatus = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // End of day
        query.createdAt.$lte = endDate;
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

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(query)
        .populate('user', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

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
        filters: {
          search,
          status,
          dateFrom,
          dateTo,
          minAmount: minAmount ? parseFloat(minAmount) : null,
          maxAmount: maxAmount ? parseFloat(maxAmount) : null,
          paymentMethod,
          sortBy,
          sortOrder,
        }
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { message: 'Error fetching orders' },
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
        { message: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'bulkStatusUpdate':
        if (!status) {
          return NextResponse.json(
            { message: 'Status is required for bulk update' },
            { status: 400 }
          );
        }

        const updateResult = await OrderModel.updateMany(
          { _id: { $in: orderIds } },
          { 
            orderStatus: status,
            updatedAt: new Date()
          }
        );

        return NextResponse.json({
          success: true,
          message: `Successfully updated ${updateResult.modifiedCount} orders`,
          modifiedCount: updateResult.modifiedCount
        });

      case 'bulkDelete':
        const deleteResult = await OrderModel.deleteMany(
          { _id: { $in: orderIds } }
        );

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${deleteResult.deletedCount} orders`,
          deletedCount: deleteResult.deletedCount
        });

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { message: 'Error performing bulk operation' },
      { status: 500 }
    );
  }
}