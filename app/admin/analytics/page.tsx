'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import MetricsOverview from '@/components/admin/analytics/MetricsOverview';
import OrdersChart from '@/components/admin/analytics/OrdersChart';
import EnhancedOrdersChart from '@/components/admin/analytics/EnhancedOrdersChart';
import StatusDistribution from '@/components/admin/analytics/StatusDistribution';
import EnhancedStatusDistribution from '@/components/admin/analytics/EnhancedStatusDistribution';
import TopProducts from '@/components/admin/analytics/TopProducts';
import EnhancedTopProducts from '@/components/admin/analytics/EnhancedTopProducts';
import toast from 'react-hot-toast';

interface AnalyticsData {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCustomers: number;
    ordersChange: number;
    revenueChange: number;
    aovChange: number;
    customersChange: number;
  };
  dailyTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
  }>;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    _id: string;
    count: number;
    percentage: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    image?: string;
    totalQuantity: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderQuantity: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    orders: number;
  }>;
}

export default function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMonthlyTrends, setShowMonthlyTrends] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalytics = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams((searchParams?.toString() ?? ''));
      const response = await fetch(`/api/admin/analytics/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
      setLastUpdate(new Date());
      
      if (silent) {
        toast.success('Analytics updated', { duration: 2000 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics fetch error:', err);
      if (!silent) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchAnalytics(true); // Silent refresh
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchAnalytics]);

  const handleFiltersChange = useCallback((filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    // The filters are handled via URL params, so just trigger a refresh
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics();
    toast.success('Refreshing analytics...', { duration: 2000 });
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled (30s)', { 
      duration: 2000 
    });
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Error Loading Analytics</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button className="btn btn-sm" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Order Analytics
            {autoRefresh && (
              <span className="inline-flex items-center gap-2 text-sm font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Updates
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time insights into your order performance and trends
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {getTimeSinceUpdate()}
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Auto-refresh Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
            />
            <span className="text-sm font-medium">Auto-refresh (30s)</span>
          </label>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-outline btn-sm gap-2"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Now
          </button>
          
          {/* Export Button */}
          <button className="btn btn-primary btn-sm gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters onFiltersChange={handleFiltersChange} />

      {/* Metrics Overview */}
      <MetricsOverview
        overview={{
          totalOrders: data?.metrics?.totalOrders || 0,
          totalRevenue: data?.metrics?.totalRevenue || 0,
          avgOrderValue: data?.metrics?.averageOrderValue || 0,
          uniqueCustomers: data?.metrics?.totalCustomers || 0,
          changes: {
            orders: data?.metrics?.ordersChange || 0,
            revenue: data?.metrics?.revenueChange || 0,
          }
        }}
        isLoading={isLoading}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders & Revenue Trends */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Trends Analysis</h2>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${!showMonthlyTrends ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setShowMonthlyTrends(false)}
              >
                Daily
              </button>
              <button
                className={`btn btn-sm ${showMonthlyTrends ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setShowMonthlyTrends(true)}
              >
                Monthly
              </button>
            </div>
          </div>
          <EnhancedOrdersChart
            dailyTrends={data?.dailyTrends || []}
            monthlyTrends={data?.monthlyTrends || []}
            showMonthly={showMonthlyTrends}
            isLoading={isLoading}
          />
        </div>

        {/* Status Distribution */}
        <EnhancedStatusDistribution
          statusBreakdown={data?.statusBreakdown || []}
          isLoading={isLoading}
        />

        {/* Top Products */}
        <EnhancedTopProducts
          topProducts={data?.topProducts || []}
          isLoading={isLoading}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Payment Methods</h3>
            {isLoading ? (
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ) : data?.paymentMethods && data.paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {data.paymentMethods.map((method) => (
                  <div key={method._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{method._id}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{method.count}</span>
                      <span className="text-sm text-gray-600">{method.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No payment method data available
              </div>
            )}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Order Distribution by Hour</h3>
            {isLoading ? (
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ) : data?.hourlyDistribution && data.hourlyDistribution.length > 0 ? (
              <div className="relative h-48">
                <div className="flex items-end justify-between h-full gap-1">
                  {data.hourlyDistribution.map((hour) => {
                    const maxOrders = Math.max(...data.hourlyDistribution.map(h => h.orders));
                    const height = (hour.orders / maxOrders) * 100;
                    
                    return (
                      <div key={hour.hour} className="flex flex-col items-center flex-1">
                        <div
                          className="bg-blue-500 hover:bg-blue-600 transition-colors w-full rounded-t"
                          style={{ height: `${height}%` }}
                          title={`${hour.orders} orders at ${hour.hour}:00`}
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          {hour.hour}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No hourly data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4 border-t">
        Analytics data is updated in real-time. Last refreshed: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
