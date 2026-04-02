'use client';

import { formatPrice } from '@/lib/utils';
import { Package, DollarSign, BarChart, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsOverviewProps {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    changes: {
      orders: number;
      revenue: number;
    };
  };
  isLoading?: boolean;
}

export default function MetricsOverview({ overview, isLoading = false }: MetricsOverviewProps) {
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-error';
    return 'text-gray-500';
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp />;
    if (value < 0) return <TrendingDown />;
    return <Minus />;
  };

  const metrics = [
    {
      title: 'Total Orders',
      value: overview.totalOrders.toLocaleString(),
      change: overview.changes.orders,
      icon: <Package />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(overview.totalRevenue),
      change: overview.changes.revenue,
      icon: <DollarSign />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(overview.avgOrderValue),
      change: null, // Don't show change for AOV
      icon: <BarChart />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Unique Customers',
      value: overview.uniqueCustomers.toLocaleString(),
      change: null, // Don't show change for customers
      icon: <Users />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow animate-pulse">
            <div className="card-body p-6">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center text-2xl`}>
                {metric.icon}
              </div>
              {metric.change !== null && (
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.change)}`}>
                  <span>{getChangeIcon(metric.change)}</span>
                  <span className="font-medium">{formatPercentage(metric.change)}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>

            {metric.change !== null && (
              <div className="mt-2 text-xs text-gray-500">
                vs previous period
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}