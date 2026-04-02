import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// Simple delivery partner assignment
const DELIVERY_PARTNERS = {
  shippo: {
    name: 'Shippo',
    estimatedDays: '3-5',
  },
  delivery_com: {
    name: 'Delivery.com',
    estimatedDays: '1-2',
  },
  ecart: {
    name: 'eCart',
    estimatedDays: '2-4',
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider is required' },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    let selectedProvider = provider;

    if (provider === 'auto') {
      // Auto-select best provider based on order value
      const totalPrice = order.totalPrice || 0;
      if (totalPrice > 5000) {
        selectedProvider = 'shippo'; // Premium for high-value orders
      } else if (totalPrice > 1000) {
        selectedProvider = 'delivery_com'; // Fast for medium orders
      } else {
        selectedProvider = 'ecart'; // Cost-effective for small orders
      }
    }

    // Generate delivery partner info
    const partnerInfo = DELIVERY_PARTNERS[selectedProvider as keyof typeof DELIVERY_PARTNERS];
    const trackingId = `${selectedProvider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + parseInt(partnerInfo?.estimatedDays?.split('-')[0] || '3'));

    const deliveryPartner = {
      provider: selectedProvider,
      trackingId,
      estimatedDelivery: estimatedDelivery.toISOString(),
      assignedAt: new Date(),
      courierName: partnerInfo?.name || selectedProvider,
    };

    // Update order with delivery partner info
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          deliveryPartner,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Delivery partner assigned successfully',
      deliveryPartner,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error assigning delivery partner:', error);
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