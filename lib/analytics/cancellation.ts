import dbConnect from '@/lib/dbConnect';
import OrderModel, { ORDER_STATUS } from '@/lib/models/OrderModel';

export interface CancellationMetrics {
  totalCancellations: number;
  cancellationRate: number;
  cancellationsByReason: Record<string, number>;
  averageOrderValueCancelled: number;
  totalRevenueLost: number;
  topCancellationReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  dailyCancellations: Array<{
    date: string;
    count: number;
  }>;
}

export interface CancellationSummary {
  period: string;
  totalCancellations: number;
  totalOrders: number;
  cancellationRate: number;
  revenueLost: number;
}

export class CancellationAnalytics {
  async getCancellationMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<CancellationMetrics> {
    await dbConnect();

    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Get all orders in the date range
    const allOrders = await OrderModel.find(dateFilter).lean();
    
    // Filter cancelled orders
    const cancelledOrders = allOrders.filter(order => order.status === ORDER_STATUS.CANCELLED);

    const totalCancellations = cancelledOrders.length;
    const totalOrders = allOrders.length;
    const cancellationRate = totalOrders > 0 ? (totalCancellations / totalOrders) * 100 : 0;

    // Process cancellation reasons
    const cancellationsByReason = this.groupCancellationsByReason(cancelledOrders);
    const topCancellationReasons = this.getTopCancellationReasons(
      cancellationsByReason, 
      totalCancellations
    );

    // Calculate financial metrics
    const averageOrderValueCancelled = this.calculateAverageOrderValue(cancelledOrders);
    const totalRevenueLost = this.calculateTotalRevenueLost(cancelledOrders);

    // Get daily cancellations for the last 30 days
    const dailyCancellations = await this.getDailyCancellations();

    return {
      totalCancellations,
      cancellationRate,
      cancellationsByReason,
      averageOrderValueCancelled,
      totalRevenueLost,
      topCancellationReasons,
      dailyCancellations
    };
  }

  async getCancellationSummary(days: number = 30): Promise<CancellationSummary[]> {
    await dbConnect();

    const summaries: CancellationSummary[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = await OrderModel.find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).lean();

      const cancelledOrders = dayOrders.filter(order => order.status === ORDER_STATUS.CANCELLED);
      const totalOrders = dayOrders.length;
      const cancellations = cancelledOrders.length;
      const revenueLost = cancelledOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      summaries.push({
        period: startOfDay.toISOString().split('T')[0],
        totalCancellations: cancellations,
        totalOrders,
        cancellationRate: totalOrders > 0 ? (cancellations / totalOrders) * 100 : 0,
        revenueLost
      });
    }

    return summaries;
  }

  async getCancellationReasonAnalysis(
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{
    reason: string;
    count: number;
    percentage: number;
    avgOrderValue: number;
    totalRevenueLost: number;
  }>> {
    await dbConnect();

    const dateFilter = this.buildDateFilter(startDate, endDate);

    const cancelledOrders = await OrderModel.find({
      status: ORDER_STATUS.CANCELLED,
      ...dateFilter
    }).lean();

    const reasonAnalysis = new Map<string, {
      count: number;
      totalRevenue: number;
      orders: any[];
    }>();

    // Group orders by cancellation reason
    cancelledOrders.forEach(order => {
      const reason = this.extractCancellationReason(order);
      
      if (!reasonAnalysis.has(reason)) {
        reasonAnalysis.set(reason, {
          count: 0,
          totalRevenue: 0,
          orders: []
        });
      }

      const data = reasonAnalysis.get(reason)!;
      data.count++;
      data.totalRevenue += order.totalAmount || 0;
      data.orders.push(order);
    });

    const totalCancellations = cancelledOrders.length;

    return Array.from(reasonAnalysis.entries()).map(([reason, data]) => ({
      reason,
      count: data.count,
      percentage: totalCancellations > 0 ? (data.count / totalCancellations) * 100 : 0,
      avgOrderValue: data.totalRevenue / data.count,
      totalRevenueLost: data.totalRevenue
    })).sort((a, b) => b.count - a.count);
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    return filter;
  }

  private groupCancellationsByReason(orders: any[]): Record<string, number> {
    const reasons: Record<string, number> = {};

    orders.forEach(order => {
      const reason = this.extractCancellationReason(order);
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return reasons;
  }

  private extractCancellationReason(order: any): string {
    if (!order.timeline || !Array.isArray(order.timeline)) {
      return 'No reason specified';
    }

    const cancelEvent = order.timeline.find((event: any) => 
      event.status === ORDER_STATUS.CANCELLED
    );

    if (!cancelEvent || !cancelEvent.note) {
      return 'No reason specified';
    }

    const note = cancelEvent.note;
    
    // Extract reason from timeline note
    const reasonMatch = note.match(/Reason: (.+)$/);
    if (reasonMatch) {
      return reasonMatch[1];
    }
    
    // Common patterns
    if (note.includes('Customer request')) return 'Customer request';
    if (note.includes('Wrong item')) return 'Wrong item ordered';
    if (note.includes('Changed mind')) return 'Changed mind';
    if (note.includes('Found better price')) return 'Found better price';
    if (note.includes('Delivery delay')) return 'Delivery delay';
    if (note.includes('Quality issues')) return 'Quality concerns';
    if (note.includes('Size issues')) return 'Size/fit issues';
    
    return note.split('.')[0] || 'Other';
  }

  private async getDailyCancellations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cancelledOrders = await OrderModel.find({
      status: ORDER_STATUS.CANCELLED,
      createdAt: { $gte: thirtyDaysAgo }
    }).lean();

    const dailyCount = new Map<string, number>();

    cancelledOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
    });

    const result: Array<{ date: string; count: number }> = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push({
        date: dateStr,
        count: dailyCount.get(dateStr) || 0
      });
    }

    return result;
  }

  private calculateAverageOrderValue(orders: any[]): number {
    if (orders.length === 0) return 0;
    
    const total = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    return total / orders.length;
  }

  private calculateTotalRevenueLost(orders: any[]): number {
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  private getTopCancellationReasons(
    reasonCounts: Record<string, number>,
    totalCancellations: number
  ) {
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCancellations > 0 ? (count / totalCancellations) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Track a new cancellation for analytics
  async trackCancellation(orderId: string, reason?: string): Promise<void> {
    try {
      await dbConnect();
      
      const order = await OrderModel.findById(orderId);
      if (!order) {
        console.error('Order not found for cancellation tracking:', orderId);
        return;
      }

      // The cancellation is already tracked through the order status change
      // Additional analytics tracking could be added here (e.g., external analytics service)

    } catch (error) {
      console.error('Error tracking cancellation:', error);
    }
  }
}

export const cancellationAnalytics = new CancellationAnalytics();