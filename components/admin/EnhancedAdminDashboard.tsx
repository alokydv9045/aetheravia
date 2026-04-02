'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

import { formatPrice } from '@/lib/utils';

interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RecentOrder {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  status: string;
  totalPrice: number;
  createdAt: string;
  items: Array<{
    name: string;
    qty: number;
  }>;
}

interface OrderAnalytics {
  metrics: OrderMetrics;
  recentOrders: RecentOrder[];
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export default function EnhancedAdminDashboard() {
  const { data: analytics, error, mutate } = useSWR<OrderAnalytics>('/api/admin/analytics/orders');
  const [isRealTime, setIsRealTime] = useState(true);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      mutate();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime, mutate]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-warning',
      confirmed: 'text-info',
      processing: 'text-primary',
      shipped: 'text-accent',
      out_for_delivery: 'text-secondary',
      delivered: 'text-success',
      cancelled: 'text-error',
      returned: 'text-neutral',
    };
    return colors[status] || 'text-neutral';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-primary',
      shipped: 'badge-accent',
      out_for_delivery: 'badge-secondary',
      delivered: 'badge-success',
      cancelled: 'badge-error',
      returned: 'badge-neutral',
    };
    return badges[status] || 'badge-neutral';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Failed to load dashboard data</span>
          <button onClick={() => mutate()} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Management Dashboard</h1>
          <p className="text-base-content/70">
            Real-time overview of your order management system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Real-time updates</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isRealTime}
                onChange={(e) => setIsRealTime(e.target.checked)}
              />
            </label>
          </div>
          <button
            onClick={() => mutate()}
            className="btn btn-outline btn-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-primary">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-primary">{analytics.metrics.totalOrders}</div>
          <div className="stat-desc">All time orders</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-success">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-success">{formatPrice(analytics.metrics.totalRevenue)}</div>
          <div className="stat-desc">All time revenue</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-warning">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-title">Today&apos;s Orders</div>
          <div className="stat-value text-warning">{analytics.metrics.todayOrders}</div>
          <div className="stat-desc">{formatPrice(analytics.metrics.todayRevenue)} revenue</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-info">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Delivered</div>
          <div className="stat-value text-info">{analytics.metrics.deliveredOrders}</div>
          <div className="stat-desc">Successfully completed</div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Order Status Distribution</h2>
            <div className="space-y-4">
              {analytics.statusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`badge ${getStatusBadge(status.status)} badge-sm`}>
                      {status.status.replace('_', ' ')}
                    </div>
                    <span className="text-sm">{status.count} orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-base-300 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-base-content/60 w-10 text-right">
                      {status.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/orders" className="btn btn-primary btn-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View All Orders
              </Link>
              <Link href="/admin/orders?status=pending" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pending ({analytics.metrics.pendingOrders})
              </Link>
              <Link href="/admin/orders?status=processing" className="btn btn-info btn-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Processing
              </Link>
              <Link href="/admin/orders?status=shipped" className="btn btn-accent btn-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                </svg>
                Shipped
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Recent Orders</h2>
            <Link href="/admin/orders" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          {analytics.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No recent orders
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.slice(0, 10).map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-mono text-sm">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{order.user?.name || 'Guest'}</div>
                          <div className="text-sm text-base-content/60">
                            {order.user?.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index}>
                              {item.name} (×{item.qty})
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-base-content/60">
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${getStatusBadge(order.status)} badge-sm`}>
                          {order.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="font-semibold">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Daily Stats Chart */}
      {analytics.dailyStats.length > 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Daily Performance (Last 7 Days)</h2>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {analytics.dailyStats.map((day, index) => {
                const maxOrders = Math.max(...analytics.dailyStats.map(d => d.orders));
                const height = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
                
                return (
                  <div key={index} className="text-center">
                    <div className="h-24 flex flex-col justify-end mb-2">
                      <div
                        className="bg-primary rounded-t w-full transition-all duration-300"
                        style={{ height: `${height}%` }}
                        title={`${day.orders} orders, ${formatPrice(day.revenue)}`}
                      ></div>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs font-medium">{day.orders}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}