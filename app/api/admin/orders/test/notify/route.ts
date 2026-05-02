import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check notification service configuration
    const emailConfigured = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );

    const smsConfigured = !!process.env.FAST2SMS_API_KEY;

    return NextResponse.json({
      status: 'Configuration check completed',
      services: {
        email: {
          configured: emailConfigured,
          provider: 'SMTP',
          host: process.env.SMTP_HOST || 'Not configured',
          user: process.env.SMTP_USER ? '***configured***' : 'Not configured',
        },
        sms: {
          configured: smsConfigured,
          provider: 'Fast2SMS',
          apiKey: process.env.FAST2SMS_API_KEY ? '***configured***' : 'Not configured',
        },
      },
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not configured',
        NODE_ENV: process.env.NODE_ENV,
      },
    });

  } catch (error) {
    console.error('Notification config check error:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testType, testEmail, testPhone } = await req.json();

    if (testType === 'email') {
      try {
        const { emailService } = await import('@/lib/notifications/email');
        
        const testData = {
          orderId: 'test-order-id',
          orderNumber: 'TEST123',
          customerName: 'Test Customer',
          customerEmail: testEmail || 'test@example.com',
          status: 'shipped' as any,
          totalAmount: 9999,
          items: [
            {
              name: 'Test Product',
              quantity: 1,
              price: 9999,
            }
          ],
          trackingNumber: 'TEST123456789',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          deliveryAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
          },
        };

        const result = await emailService.sendOrderStatusUpdate(testData);
        
        return NextResponse.json({
          success: true,
          message: 'Test email sent successfully',
          result,
        });

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Email test failed',
        }, { status: 400 });
      }
    }

    if (testType === 'sms') {
      try {
        const { smsService } = await import('@/lib/notifications/sms');
        
        const testData = {
          orderId: 'test-order-id',
          orderNumber: 'TEST123',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: testPhone || '+1234567890',
          status: 'shipped' as any,
          totalAmount: 9999,
          items: [
            {
              name: 'Test Product',
              quantity: 1,
              price: 9999,
            }
          ],
          trackingNumber: 'TEST123456789',
        };

        const result = await smsService.sendOrderStatusUpdate(testData);
        
        return NextResponse.json({
          success: true,
          message: 'Test SMS sent successfully',
          result,
        });

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'SMS test failed',
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type. Use "email" or "sms"',
    }, { status: 400 });

  } catch (error) {
    console.error('Notification test error:', error);
    return NextResponse.json(
      { error: 'Failed to run test' },
      { status: 500 }
    );
  }
}