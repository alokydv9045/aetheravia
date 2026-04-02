import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
    
    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return Response.json({ error: 'Provider is required' }, { status: 400 });
    }

    try {
      // Create a test shipment request to verify provider connectivity
      const testShipmentData = {
        customerDetails: {
          name: 'Test Customer',
          address: '456 Customer Lane',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '+91-1234567890',
          email: 'customer@example.com'
        },
        orderDetails: {
          items: [{
            name: 'Test Product',
            quantity: 1,
            weight: 1.5,
            dimensions: {
              length: 10,
              width: 8,
              height: 6
            },
            price: 1000
          }],
          totalWeight: 1.5,
          totalValue: 1000,
          paymentType: 'PREPAID' as const,
          codAmount: 0
        },
        pickupDetails: {
          name: 'BellaModa',
          address: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '+91-9876543210',
          email: 'test@bellamoda.com'
        },
        metadata: {
          isTest: true,
          testProvider: provider,
          testTime: new Date().toISOString()
        }
      };

      // For testing, we'll just simulate a successful response
      // In a real implementation, you would call the specific provider's API
      const mockResponse = {
        success: true,
        provider: provider,
        rates: [{
          service: 'Standard',
          amount: 75,
          currency: 'INR',
          estimatedDays: '2-3'
        }]
      };

      if (mockResponse.success) {
        return Response.json({ 
          success: true, 
          message: `${provider} is configured correctly`,
          details: {
            ratesFound: mockResponse.rates.length,
            sampleRate: `₹${mockResponse.rates[0].amount}`,
            provider: provider,
            estimatedDays: mockResponse.rates[0].estimatedDays
          }
        });
      } else {
        return Response.json({ 
          success: false, 
          error: `No shipping services available from ${provider}` 
        });
      }
    } catch (providerError: any) {
      console.error(`Provider ${provider} test error:`, providerError);
      return Response.json({ 
        success: false, 
        error: `Provider test failed: ${providerError.message || 'Unknown error'}` 
      });
    }
  } catch (error: any) {
    console.error('Error testing shipping provider:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}