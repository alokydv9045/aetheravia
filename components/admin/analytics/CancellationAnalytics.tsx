'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CancellationMetrics {
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

interface CancellationSummary {
  period: string;
  totalCancellations: number;
  totalOrders: number;
  cancellationRate: number;
  revenueLost: number;
}

export default function CancellationAnalytics() {
  const [metrics, setMetrics] = useState<CancellationMetrics | null>(null);
  const [summary, setSummary] = useState<CancellationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  const [timeframe, setTimeframe] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch metrics
      const metricsParams = new URLSearchParams({
        type: 'metrics',
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });

      const metricsResponse = await fetch(`/api/admin/analytics/cancellations?${metricsParams}`);
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
      const metricsData = await metricsResponse.json();

      // Fetch summary
      const summaryParams = new URLSearchParams({
        type: 'summary',
        days: timeframe
      });

      const summaryResponse = await fetch(`/api/admin/analytics/cancellations?${summaryParams}`);
      if (!summaryResponse.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryResponse.json();

      setMetrics(metricsData.data);
      setSummary(summaryData.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load cancellation analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        type: 'reasons',
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });

      const response = await fetch(`/api/admin/analytics/cancellations?${params}`);
      if (!response.ok) throw new Error('Failed to export data');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `cancellation-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <span>Loading cancellation analytics...</span>
        </div>
      </div>
    );
  }

  const recentTrend = summary.slice(-7); // Last 7 days
  const averageCancellationRate = summary.length > 0 
    ? summary.reduce((sum, s) => sum + s.cancellationRate, 0) / summary.length 
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cancellation Analytics</h1>
          <p className="text-muted-foreground">
            Monitor and analyze order cancellation patterns and trends
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cancellations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCancellations}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.cancellationRate.toFixed(1)}% cancellation rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Lost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(metrics.totalRevenueLost)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatPrice(metrics.averageOrderValueCancelled)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cancellationRate.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(metrics.cancellationRate, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rate (Period)</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCancellationRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Last {timeframe} days average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Cancellation Reasons */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Top Cancellation Reasons</CardTitle>
              <CardDescription>
                Most common reasons customers cancel orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCancellationReasons.map((reason, index) => (
                  <div key={reason.reason} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index < 3 ? 'destructive' : 'secondary'}>
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{reason.reason}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{reason.count}</div>
                      <div className="text-sm text-muted-foreground">
                        {reason.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Trend */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Cancellation Trend</CardTitle>
              <CardDescription>
                Cancellations over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.dailyCancellations.slice(-10).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((day.count / Math.max(...metrics.dailyCancellations.map(d => d.count))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold w-8 text-right">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Cancellation Summary */}
      {summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Summary</CardTitle>
            <CardDescription>
              Daily breakdown of cancellations and rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Total Orders</th>
                    <th className="text-right py-2">Cancellations</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Revenue Lost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrend.map((day) => (
                    <tr key={day.period} className="border-b">
                      <td className="py-2">
                        {new Date(day.period).toLocaleDateString()}
                      </td>
                      <td className="text-right py-2">{day.totalOrders}</td>
                      <td className="text-right py-2">{day.totalCancellations}</td>
                      <td className="text-right py-2">
                        <Badge variant={day.cancellationRate > 10 ? 'destructive' : 'secondary'}>
                          {day.cancellationRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right py-2">{formatPrice(day.revenueLost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights and Recommendations */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>
              AI-powered insights based on cancellation patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.cancellationRate > 15 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">High Cancellation Rate Alert</h4>
                  </div>
                  <p className="text-red-700 mt-1">
                    Your cancellation rate of {metrics.cancellationRate.toFixed(1)}% is above the recommended threshold of 15%. 
                    Consider reviewing order fulfillment processes and customer expectations.
                  </p>
                </div>
              )}

              {metrics.topCancellationReasons[0]?.percentage > 30 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">Dominant Cancellation Reason</h4>
                  </div>
                  <p className="text-orange-700 mt-1">
                    &quot;{metrics.topCancellationReasons[0].reason}&quot; accounts for {metrics.topCancellationReasons[0].percentage.toFixed(1)}% 
                    of cancellations. Focus on addressing this specific issue to reduce overall cancellation rate.
                  </p>
                </div>
              )}

              {metrics.totalRevenueLost > 10000 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Revenue Impact</h4>
                  </div>
                  <p className="text-blue-700 mt-1">
                    Significant revenue loss of {formatPrice(metrics.totalRevenueLost)} due to cancellations. 
                    Implementing retention strategies could recover a portion of this lost revenue.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}