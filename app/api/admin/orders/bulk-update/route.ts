import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

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