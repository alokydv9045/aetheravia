'use client';

import { useMemo } from 'react';
import { formatPrice } from '@/lib/utils';

interface OrdersChartProps {
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
  showMonthly?: boolean;
  isLoading?: boolean;
}

export default function OrdersChart({ 
  dailyTrends, 
  monthlyTrends, 
  showMonthly = false, 
  isLoading = false 
}: OrdersChartProps) {
  const data = showMonthly ? monthlyTrends : dailyTrends;
  
  const maxOrders = useMemo(() => {
    return Math.max(...data.map(d => d.orders), 1);
  }, [data]);

  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.revenue), 1);
  }, [data]);

  const formatDate = (dateStr: string) => {
    if (showMonthly) {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      });
    } else {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Orders & Revenue Trends</h3>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Orders & Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Orders & Revenue Trends</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        <div className="relative h-64 overflow-x-auto">
          <div className="flex items-end justify-between h-full min-w-full gap-1" style={{ minWidth: `${data.length * 40}px` }}>
            {data.map((item, index) => {
              const orderHeight = (item.orders / maxOrders) * 100;
              const revenueHeight = (item.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                  {/* Bars Container */}
                  <div className="relative h-48 flex items-end justify-center gap-1 w-full">
                    {/* Orders Bar */}
                    <div className="relative group">
                      <div
                        className="bg-blue-500 hover:bg-blue-600 transition-colors w-6 rounded-t cursor-pointer"
                        style={{ height: `${orderHeight}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {item.orders} orders
                        </div>
                      </div>
                    </div>
                    
                    {/* Revenue Bar */}
                    <div className="relative group">
                      <div
                        className="bg-green-500 hover:bg-green-600 transition-colors w-6 rounded-t cursor-pointer"
                        style={{ height: `${revenueHeight}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {formatPrice(item.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Date Label */}
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    {formatDate(showMonthly ? (item as any).month : (item as any).date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Total Orders</div>
            <div className="font-semibold text-blue-600">
              {data.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Total Revenue</div>
            <div className="font-semibold text-green-600">
              {formatPrice(data.reduce((sum, item) => sum + item.revenue, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Avg Orders/Day</div>
            <div className="font-semibold">
              {(data.reduce((sum, item) => sum + item.orders, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Avg Revenue/Day</div>
            <div className="font-semibold">
              {formatPrice(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}