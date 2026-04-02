import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();
    
    // Mock provider configurations (in real app, this would come from database/config)
    const providers = [
      {
        provider: 'SHIPPO' as const,
        name: 'Shippo',
        isEnabled: true,
        priority: 1,
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        totalShipments: 0, // Would come from database
        successRate: 98.5
      },
      {
        provider: 'DELIVERY_COM' as const,
        name: 'Delivery.com',
        isEnabled: true,
        priority: 2,
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        totalShipments: 0,
        successRate: 95.2
      },
      {
        provider: 'ECART' as const,
        name: 'eCart',
        isEnabled: true,
        priority: 3,
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        totalShipments: 0,
        successRate: 92.8
      }
    ];

    // Get webhook URL from environment variables or fallback to constructed URL
    const webhookUrl = process.env.SHIPPO_WEBHOOK_URL || 
                      `${process.env.NEXTAUTH_URL || 'https://bellamoda.onrender.com'}/api/webhooks/couriers/shippo`;

    const response = {
      activeProvider: 'SHIPPO', // Primary provider
      providers,
      testMode: process.env.NODE_ENV !== 'production',
      webhookUrl
    };

    return Response.json(response);
  } catch (error: any) {
    console.error('Error fetching shipping providers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminSession();
    
    const body = await req.json();
    const { provider, isEnabled } = body;

    if (!provider || typeof isEnabled !== 'boolean') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // In a real app, you would update the provider configuration in database
    // For now, we'll just return success
    console.log(`Provider ${provider} ${isEnabled ? 'enabled' : 'disabled'}`);

    return Response.json({ 
      success: true, 
      message: `Provider ${provider} ${isEnabled ? 'enabled' : 'disabled'}` 
    });
  } catch (error: any) {
    console.error('Error updating shipping provider:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}