'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Clock, CheckCircle, Package, XCircle, Settings, Truck, BarChart } from 'lucide-react';

interface StatusData {
  _id: string;
  count: number;
  percentage: number;
  revenue: number;
  [key: string]: string | number; // Index signature for recharts compatibility
}

interface Props {
  statusBreakdown: StatusData[];
  isLoading: boolean;
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: '#fbbf24', // yellow
  paid: '#10b981', // green
  delivered: '#3b82f6', // blue
  canceled: '#ef4444', // red
  processing: '#8b5cf6', // purple
  shipped: '#06b6d4', // cyan
};

const STATUS_ICONS: { [key: string]: React.ReactNode } = {
  pending: <Clock />,
  paid: <CheckCircle />,
  delivered: <Package />,
  canceled: <XCircle />,
  processing: <Settings />,
  shipped: <Truck />,
};

export default function EnhancedStatusDistribution({ statusBreakdown, isLoading }: Props) {
  const [animationKey, setAnimationKey] = useState(0);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [statusBreakdown]);

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Order Status Distribution</h2>
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!statusBreakdown || statusBreakdown.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Order Status Distribution</h2>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-semibold">No status data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2 capitalize flex items-center gap-2">
            <span>{STATUS_ICONS[data._id] || '📊'}</span>
            {data._id}
          </p>
          <p className="text-sm text-gray-600">Orders: <span className="font-semibold">{data.count}</span></p>
          <p className="text-sm text-gray-600">Percentage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span></p>
          <p className="text-sm text-gray-600">Revenue: <span className="font-semibold">₹{data.revenue.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  const totalOrders = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = statusBreakdown.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          Order Status Distribution
          <div className="badge badge-accent">Live</div>
        </h2>

        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={300} key={animationKey}>
          <PieChart>
            <Pie
              data={statusBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry._id}: ${entry.percentage.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              animationDuration={1000}
            >
              {statusBreakdown.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry._id] || '#94a3b8'}
                  opacity={hoveredStatus === null || hoveredStatus === entry._id ? 1 : 0.5}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Status Cards */}
        <div className="space-y-2 mt-4">
          {statusBreakdown.map((status) => {
            const color = STATUS_COLORS[status._id] || '#94a3b8';
            const isHovered = hoveredStatus === status._id;

            return (
              <div
                key={status._id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'shadow-md scale-105' : 'shadow'
                }`}
                style={{
                  backgroundColor: `${color}15`,
                  borderLeft: `4px solid ${color}`,
                }}
                onMouseEnter={() => setHoveredStatus(status._id)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{STATUS_ICONS[status._id] || '📊'}</span>
                  <div>
                    <p className="font-semibold capitalize text-gray-800">{status._id}</p>
                    <p className="text-sm text-gray-600">
                      ₹{status.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color }}>
                    {status.count}
                  </p>
                  <p className="text-sm text-gray-600">
                    {status.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="stat p-3 bg-blue-50 rounded-lg">
            <div className="stat-title text-xs">Total Orders</div>
            <div className="stat-value text-xl text-blue-600">{totalOrders}</div>
          </div>
          <div className="stat p-3 bg-green-50 rounded-lg">
            <div className="stat-title text-xs">Total Revenue</div>
            <div className="stat-value text-xl text-green-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
