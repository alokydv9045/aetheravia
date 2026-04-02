import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { requireAdminSession } from '@/lib/requireAdminSession';
import Order from '@/lib/models/OrderModel';
import AbandonedCart from '@/lib/models/AbandonedCartModel';

// Mark this route as dynamic to handle the headers properly
export const dynamic = 'force-dynamic';

// GET /api/admin/analytics/export?type=csv|pdf&report=sales|revenue|customers|abandoned
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'csv';
    const report = searchParams.get('report') || 'sales';

    let data: any[] = [];
    let filename = `${report}-report.${type}`;

    if (report === 'sales') {
      data = await Order.find({ isPaid: true }).lean();
    } else if (report === 'abandoned') {
      data = await AbandonedCart.find({}).lean();
    } // Add more report types as needed

    if (type === 'csv') {
      // Manual CSV generation to avoid dependency issues
      if (data.length === 0) {
        return NextResponse.json({ error: 'No data found' }, { status: 404 });
      }
      
      const headers = Object.keys(data[0]);
      let csv = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : (value ?? '');
        });
        csv += values.join(',') + '\n';
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (type === 'pdf') {
      // PDF export logic would go here (e.g., using pdfkit or jspdf)
      return NextResponse.json({ error: 'PDF export not implemented in this demo.' }, { status: 501 });
    }

    return NextResponse.json({ error: 'Invalid export type.' }, { status: 400 });

  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to export data. Please try again.' 
    }, { status: 500 });
  }
}
