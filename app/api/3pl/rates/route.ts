// API Route for Calculating Shipping Rates
import { NextRequest, NextResponse } from 'next/server';
import { Courier3PLManager } from '@/lib/3pl/manager';

// Initialize 3PL Manager
const courier3PL = new Courier3PLManager({
  shippo: {
    apiKey: process.env.SHIPPO_API_KEY || '',
    baseUrl: process.env.SHIPPO_BASE_URL || 'https://api.goshippo.com',
    environment: (process.env.NODE_ENV === 'production' ? 'live' : 'test') as 'test' | 'live',
  },
  deliveryCom: {
    apiKey: process.env.DELIVERY_COM_API_KEY || '',
    baseUrl: process.env.DELIVERY_COM_BASE_URL || 'https://api.delivery.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
  eCart: {
    apiKey: process.env.ECART_API_KEY || '',
    secretKey: process.env.ECART_SECRET_KEY || '',
    baseUrl: process.env.ECART_BASE_URL || 'https://api.ecart.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
});

// POST /api/3pl/rates - Calculate shipping rates
export async function POST(request: NextRequest) {
  try {
    const rateData = await request.json();

    // Validate required fields
    if (!rateData.customerDetails?.pincode || !rateData.orderDetails?.totalWeight) {
      return NextResponse.json(
        { error: 'Missing required fields: customer pincode, order weight' },
        { status: 400 }
      );
    }

    // Set default pickup details if not provided
    if (!rateData.pickupDetails) {
      rateData.pickupDetails = {
        name: process.env.COMPANY_NAME || 'Aetheravia',
        address: process.env.PICKUP_ADDRESS || 'Near Pal Petrol pump, Bisalpur',
        city: process.env.PICKUP_CITY || 'Pilibhit',
        state: process.env.PICKUP_STATE || 'Uttar Pradesh',
        pincode: process.env.PICKUP_PINCODE || '262201',
        phone: process.env.PICKUP_PHONE || '9999999999',
      };
    }

    // Get rates from all providers
    const ratesResult = await courier3PL.getBestRates(rateData);

    if (ratesResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          rates: ratesResult.rates,
          pickup: rateData.pickupDetails,
          delivery: rateData.customerDetails,
          requestedAt: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { error: ratesResult.error || 'Failed to calculate rates' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Rate calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}