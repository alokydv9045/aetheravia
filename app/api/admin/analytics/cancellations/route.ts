import { auth } from '@/lib/auth';
import { cancellationAnalytics } from '@/lib/analytics/cancellation';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const GET = auth(async (...request: any) => {
  const [req] = request;
  
  try {
    // Require admin session
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'metrics';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const days = parseInt(searchParams.get('days') || '30');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    let data;

    switch (type) {
      case 'metrics':
        data = await cancellationAnalytics.getCancellationMetrics(start, end);
        break;
      
      case 'summary':
        data = await cancellationAnalytics.getCancellationSummary(days);
        break;
      
      case 'reasons':
        data = await cancellationAnalytics.getCancellationReasonAnalysis(start, end);
        break;
      
      default:
        return Response.json(
          { message: 'Invalid analytics type' },
          { status: 400 }
        );
    }

    return Response.json({
      type,
      data,
      dateRange: {
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
        days
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cancellation analytics API error:', error);
    
    if (error.message === 'Admin access required') {
      return Response.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    return Response.json(
      { message: 'Failed to fetch cancellation analytics' },
      { status: 500 }
    );
  }
});

export const POST = auth(async (...request: any) => {
  const [req] = request;
  
  try {
    // Require admin session
    await requireAdminSession();

    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return Response.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Track the cancellation
    await cancellationAnalytics.trackCancellation(orderId, reason);

    return Response.json({
      message: 'Cancellation tracked successfully',
      orderId,
      reason,
      trackedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Track cancellation API error:', error);
    
    if (error.message === 'Admin access required') {
      return Response.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    return Response.json(
      { message: 'Failed to track cancellation' },
      { status: 500 }
    );
  }
});