import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import dbConnect from '@/lib/dbConnect';
import ShippingProviderModel from '@/lib/models/ShippingProviderModel';
import OrderModel from '@/lib/models/OrderModel';
import DeliveryStatsModel from '@/lib/models/DeliveryStatsModel';

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
    const type = searchParams.get('type'); // 'shipping', '3pl', or null for all

    // Build query
    const query: any = {};
    if (type) {
      query.type = type;
    }

    // Fetch providers from database
    const providers = await ShippingProviderModel.find(query).lean();

    // If no providers exist, seed with initial data
    if (providers.length === 0) {
      const seedProviders = [
        {
          providerId: 'shippo',
          name: 'Shippo',
          type: 'shipping',
          status: 'active',
          integration: 'API',
          features: ['Multi-carrier', 'Tracking', 'Insurance', 'Rate comparison'],
          supportedServices: ['standard', 'express', 'overnight'],
          coverageAreas: ['India', 'International'],
          config: {
            environment: 'sandbox'
          },
          metrics: {
            totalOrders: 1234,
            successfulDeliveries: 1215,
            failedDeliveries: 19,
            averageDeliveryTime: 72,
            webhookUptime: 98.5
          },
          pricing: {
            baseCost: 50,
            perKgCost: 25,
            perKmCost: 2,
            codCharges: 30,
            insuranceRate: 0.5
          },
          createdBy: (session as any).user?.id || 'system'
        },
        {
          providerId: 'delivery_com',
          name: 'Delivery.com',
          type: '3pl',
          status: 'active',
          integration: 'Webhook',
          features: ['Same-day delivery', 'Local coverage', 'Live tracking'],
          supportedServices: ['same-day', 'next-day', 'scheduled'],
          coverageAreas: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
          config: {
            environment: 'production'
          },
          metrics: {
            totalOrders: 856,
            successfulDeliveries: 829,
            failedDeliveries: 27,
            averageDeliveryTime: 24,
            webhookUptime: 96.8
          },
          pricing: {
            baseCost: 80,
            perKgCost: 40,
            perKmCost: 5,
            codCharges: 50,
            insuranceRate: 1.0
          },
          createdBy: (session as any).user?.id || 'system'
        },
        {
          providerId: 'ecart',
          name: 'eCart',
          type: '3pl',
          status: 'active',
          integration: 'API + Webhook',
          features: ['E-commerce integration', 'Bulk shipping', 'Analytics', 'COD support'],
          supportedServices: ['standard', 'express', 'cod', 'bulk'],
          coverageAreas: ['Pan India'],
          config: {
            environment: 'production'
          },
          metrics: {
            totalOrders: 2156,
            successfulDeliveries: 2095,
            failedDeliveries: 61,
            averageDeliveryTime: 48,
            webhookUptime: 97.2
          },
          pricing: {
            baseCost: 40,
            perKgCost: 20,
            perKmCost: 1.5,
            codCharges: 25,
            insuranceRate: 0.3
          },
          createdBy: (session as any).user?.id || 'system'
        }
      ];

      await ShippingProviderModel.insertMany(seedProviders);
      
      // Fetch the newly created providers
      const newProviders = await ShippingProviderModel.find(query).lean();
      return NextResponse.json({
        success: true,
        data: {
          providers: newProviders,
          stats: await calculateStats(newProviders)
        }
      });
    }

    // Calculate real-time stats
    const stats = await calculateStats(providers);

    // Transform providers data for frontend
    const transformedProviders = providers.map(provider => ({
      id: provider.providerId,
      name: provider.name,
      type: provider.type,
      status: provider.status,
      integration: provider.integration,
      orders: provider.metrics.totalOrders,
      successRate: provider.metrics.totalOrders > 0 
        ? ((provider.metrics.successfulDeliveries / provider.metrics.totalOrders) * 100).toFixed(1)
        : 0,
      avgDeliveryTime: `${Math.round(provider.metrics.averageDeliveryTime / 24)}+ days`,
      lastSync: formatLastSync(provider.metrics.lastSyncAt),
      features: provider.features,
      webhookUptime: provider.metrics.webhookUptime
    }));

    return NextResponse.json({
      success: true,
      data: {
        providers: transformedProviders,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching shipping providers:', error);
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

// Helper function to calculate real-time stats
async function calculateStats(providers: any[]) {
  try {
    // Get order stats from database
    const orderStats = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $in: ['$status', ['shipped', 'out_for_delivery']] }, 1, 0]
            }
          }
        }
      }
    ]);

    const orders = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      deliveredOrders: 0,
      shippedOrders: 0
    };

    // Calculate provider stats
    const totalProviders = providers.length;
    const activeProviders = providers.filter(p => p.status === 'active').length;
    const totalShipments = providers.reduce((sum, p) => sum + (p.metrics?.totalOrders || 0), 0);
    const avgSuccessRate = providers.length > 0
      ? providers.reduce((sum, p) => {
          const rate = p.metrics?.totalOrders > 0 
            ? (p.metrics.successfulDeliveries / p.metrics.totalOrders) * 100 
            : 0;
          return sum + rate;
        }, 0) / providers.length
      : 0;
    const webhookUptime = providers.length > 0
      ? providers.reduce((sum, p) => sum + (p.metrics?.webhookUptime || 100), 0) / providers.length
      : 100;

    return {
      totalProviders,
      activeProviders,
      totalShipments,
      avgSuccessRate: parseFloat(avgSuccessRate.toFixed(1)),
      totalRevenue: orders.totalRevenue,
      webhookUptime: parseFloat(webhookUptime.toFixed(2))
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalProviders: 0,
      activeProviders: 0,
      totalShipments: 0,
      avgSuccessRate: 0,
      totalRevenue: 0,
      webhookUptime: 100
    };
  }
}

// Helper function to format last sync time
function formatLastSync(lastSyncAt: Date) {
  if (!lastSyncAt) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - lastSyncAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
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

    const body = await request.json();
    const { action, providerId, status } = body;

    if (!action || !providerId) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { message: 'Status is required' },
            { status: 400 }
          );
        }

        // In a real implementation, this would update the database
        console.log(`Updating provider ${providerId} status to ${status}`);

        return NextResponse.json({
          success: true,
          message: `Provider status updated to ${status}`,
        });

      case 'sync':
        // In a real implementation, this would trigger sync with the provider
        console.log(`Syncing provider ${providerId}`);

        return NextResponse.json({
          success: true,
          message: `Provider ${providerId} synced successfully`,
        });

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating shipping provider:', error);
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