import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

// Simple delivery partner assignment without complex 3PL integration
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

export async function POST(request: NextRequest) {
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
    const { orderIds, provider } = body;

    if (!orderIds || !Array.isArray(orderIds) || !provider) {
      return NextResponse.json(
        { message: 'Invalid request data. OrderIds and provider are required.' },
        { status: 400 }
      );
    }

    let assignedCount = 0;
    const results = [];

    for (const orderId of orderIds) {
      try {
        // Fetch order details
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
          results.push({ orderId, success: false, error: 'Order not found' });
          continue;
        }

        let selectedProvider = provider;
        let deliveryPartner;

        if (provider === 'auto') {
          // Auto-select best provider (simple logic)
          const totalPrice = order.totalPrice || 0;
          if (totalPrice > 5000) {
            selectedProvider = 'shippo'; // Premium for high-value orders
          } else if (totalPrice > 1000) {
            selectedProvider = 'delivery_com'; // Fast for medium orders
          } else {
            selectedProvider = 'ecart'; // Cost-effective for small orders
          }
        }

        // Generate mock tracking ID and delivery info
        const partnerInfo = DELIVERY_PARTNERS[selectedProvider as keyof typeof DELIVERY_PARTNERS];
        const trackingId = `${selectedProvider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + parseInt(partnerInfo?.estimatedDays?.split('-')[0] || '3'));

        deliveryPartner = {
          provider: selectedProvider,
          trackingId,
          estimatedDelivery: estimatedDelivery.toISOString(),
          assignedAt: new Date(),
          courierName: partnerInfo?.name || selectedProvider,
        };

        // Update order with delivery partner info
        await OrderModel.findByIdAndUpdate(orderId, {
          $set: {
            deliveryPartner,
            updatedAt: new Date()
          }
        });

        assignedCount++;
        results.push({ 
          orderId, 
          success: true, 
          provider: selectedProvider,
          trackingId: deliveryPartner.trackingId 
        });

      } catch (error) {
        console.error(`Error assigning delivery partner to order ${orderId}:`, error);
        results.push({ 
          orderId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Assignment failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned delivery partner to ${assignedCount} orders`,
      assignedCount,
      results
    });

  } catch (error) {
    console.error('Error in bulk delivery assignment:', error);
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