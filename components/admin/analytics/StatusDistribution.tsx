'use client';

import { useMemo } from 'react';

interface StatusDistributionProps {
  statusBreakdown: Array<{
    _id: string;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280'
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded'
};

export default function StatusDistribution({ statusBreakdown, isLoading = false }: StatusDistributionProps) {
  const total = useMemo(() => {
    return statusBreakdown.reduce((sum, item) => sum + item.count, 0);
  }, [statusBreakdown]);

  const sortedData = useMemo(() => {
    return [...statusBreakdown].sort((a, b) => b.count - a.count);
  }, [statusBreakdown]);

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Order Status Distribution</h3>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Order Status Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title mb-6">Order Status Distribution</h3>
        
        {/* Donut Chart */}
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="20"
              />
              
              {/* Status segments */}
              {sortedData.map((item, index) => {
                const percentage = (item.count / total) * 100;
                const circumference = 2 * Math.PI * 80;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -sortedData
                  .slice(0, index)
                  .reduce((sum, prev) => sum + (prev.count / total) * circumference, 0);

                return (
                  <circle
                    key={item._id}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={STATUS_COLORS[item._id] || '#6b7280'}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-width-[25]"
                    transform="rotate(-90 100 100)"
                  />
                );
              })}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-3">
            {sortedData.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item._id] || '#6b7280' }}
                  />
                  <span className="font-medium">
                    {STATUS_LABELS[item._id] || item._id}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {((item.count / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Completed Orders</div>
            <div className="text-xl font-bold text-green-800">
              {sortedData
                .filter(item => ['delivered', 'shipped'].includes(item._id))
                .reduce((sum, item) => sum + item.count, 0)
                .toLocaleString()
              }
            </div>
            <div className="text-sm text-green-600">
              {(
                (sortedData
                  .filter(item => ['delivered', 'shipped'].includes(item._id))
                  .reduce((sum, item) => sum + item.count, 0) / total) * 100
              ).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-700 mb-1">In Progress</div>
            <div className="text-xl font-bold text-yellow-800">
              {sortedData
                .filter(item => ['pending', 'processing'].includes(item._id))
                .reduce((sum, item) => sum + item.count, 0)
                .toLocaleString()
              }
            </div>
            <div className="text-sm text-yellow-600">
              {(
                (sortedData
                  .filter(item => ['pending', 'processing'].includes(item._id))
                  .reduce((sum, item) => sum + item.count, 0) / total) * 100
              ).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Issues</div>
            <div className="text-xl font-bold text-red-800">
              {sortedData
                .filter(item => ['cancelled', 'refunded'].includes(item._id))
                .reduce((sum, item) => sum + item.count, 0)
                .toLocaleString()
              }
            </div>
            <div className="text-sm text-red-600">
              {(
                (sortedData
                  .filter(item => ['cancelled', 'refunded'].includes(item._id))
                  .reduce((sum, item) => sum + item.count, 0) / total) * 100
              ).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}