import { NextRequest } from 'next/server';

/**
 * Razorpay Configuration Test API
 * Tests Razorpay API connection and credentials
 * Use: GET /api/test/razorpay (development only)
 */
export async function GET(request: NextRequest) {
  // Guard: only allow in development
  if (process.env.NODE_ENV === 'production') {
    return Response.json(
      { success: false, message: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    // Check environment variables
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    
    const configStatus = {
      keyId: RAZORPAY_KEY_ID ? {
        present: true,
        format: RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'test' : RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'unknown',
        prefix: RAZORPAY_KEY_ID.substring(0, 12) + '...'
      } : { present: false },
      keySecret: RAZORPAY_KEY_SECRET ? {
        present: true,
        length: RAZORPAY_KEY_SECRET.length
      } : { present: false }
    };

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return Response.json({
        success: false,
        error: 'Missing Razorpay credentials',
        config: configStatus,
        recommendations: [
          'Add RAZORPAY_KEY_ID to environment variables',
          'Add RAZORPAY_KEY_SECRET to environment variables',
          'Ensure credentials are from active Razorpay account'
        ]
      }, { status: 400 });
    }

    // Test API connection
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');

    // Create a minimal test order
    const testOrderData = {
      amount: 100, // Re 1.00 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        test: 'configuration_check'
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(testOrderData),
    });

    if (response.ok) {
      const orderData = await response.json();
      
      return Response.json({
        success: true,
        message: 'Razorpay configuration is working correctly',
        config: configStatus,
        testResult: {
          orderCreated: true,
          orderId: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          status: orderData.status
        }
      });
    } else {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return Response.json({
        success: false,
        error: 'Razorpay API connection failed',
        config: configStatus,
        apiError: {
          status: response.status,
          statusText: response.statusText,
          details: errorData
        },
        recommendations: [
          'Verify API keys are correct and active',
          'Check Razorpay account status',
          'Ensure test mode is enabled if using test keys',
          'Verify account has permission to create orders'
        ]
      }, { status: response.status });
    }

  } catch (error: any) {
    return Response.json({
      success: false,
      error: 'Configuration test failed',
      details: error.message,
      recommendations: [
        'Check network connectivity',
        'Verify environment variables are loaded',
        'Check for any firewall or proxy issues'
      ]
    }, { status: 500 });
  }
}