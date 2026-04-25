'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface ChartData {
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
  isLoading: boolean;
  showMonthly: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={`${entry.name}-${entry.value}`} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name.includes('Revenue') ? `₹${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnhancedOrdersChart({ dailyTrends, monthlyTrends, isLoading, showMonthly }: ChartData) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Trigger animation when data changes
    setAnimationKey(prev => prev + 1);
  }, [dailyTrends, monthlyTrends, showMonthly]);

  const data = showMonthly ? monthlyTrends : dailyTrends;
  const dateKey = showMonthly ? 'month' : 'date';

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-semibold">No data available</p>
              <p className="text-sm">Data will appear here once orders are placed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: data as any[],
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const xAxisProps = {
      dataKey: dateKey,
      tick: { fontSize: 12 },
      stroke: "#666",
    };

    const yAxisProps = {
      yAxisId: "left",
      tick: { fontSize: 12 },
      stroke: "#666",
    };

    const revenueYAxisProps = {
      yAxisId: "right",
      orientation: "right" as const,
      tick: { fontSize: 12 },
      stroke: "#666",
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} key={animationKey}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis key="xaxis" {...xAxisProps} />
            <YAxis key="yaxis-left" {...yAxisProps} />
            <YAxis key="yaxis-right" {...revenueYAxisProps} />
            <Tooltip key="tooltip" content={<CustomTooltip />} />
            <Legend key="legend" />
            <Line
              key="line-orders"
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Orders"
              animationDuration={1000}
            />
            <Line
              key="line-revenue"
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (₹)"
              animationDuration={1000}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} key={animationKey}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis key="xaxis" {...xAxisProps} />
            <YAxis key="yaxis-left" {...yAxisProps} />
            <YAxis key="yaxis-right" {...revenueYAxisProps} />
            <Tooltip key="tooltip" content={<CustomTooltip />} />
            <Legend key="legend" />
            <Bar
              key="bar-orders"
              yAxisId="left"
              dataKey="orders"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Orders"
              animationDuration={1000}
            />
            <Bar
              key="bar-revenue"
              yAxisId="right"
              dataKey="revenue"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              name="Revenue (₹)"
              animationDuration={1000}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} key={animationKey}>
            <defs key="defs">
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis key="xaxis" {...xAxisProps} />
            <YAxis key="yaxis-left" {...yAxisProps} />
            <YAxis key="yaxis-right" {...revenueYAxisProps} />
            <Tooltip key="tooltip" content={<CustomTooltip />} />
            <Legend key="legend" />
            <Area
              key="area-orders"
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorOrders)"
              name="Orders"
              animationDuration={1000}
            />
            <Area
              key="area-revenue"
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue (₹)"
              animationDuration={1000}
            />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps} key={animationKey}>
            <defs key="defs">
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis key="xaxis" {...xAxisProps} />
            <YAxis key="yaxis-left" {...yAxisProps} />
            <YAxis key="yaxis-right" {...revenueYAxisProps} />
            <Tooltip key="tooltip" content={<CustomTooltip />} />
            <Legend key="legend" />
            <Area
              key="area-orders"
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              fill="url(#colorOrders)"
              stroke="#3b82f6"
              name="Orders"
              animationDuration={1000}
            />
            <Line
              key="line-revenue"
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Revenue (₹)"
              animationDuration={1000}
            />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Orders & Revenue Trends
            <div className="badge badge-primary">Real-time</div>
          </h2>
          <div className="flex gap-2">
            <button
              className={`btn btn-xs ${chartType === 'composed' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setChartType('composed')}
              title="Combined View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </button>
            <button
              className={`btn btn-xs ${chartType === 'line' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" />
              </svg>
            </button>
            <button
              className={`btn btn-xs ${chartType === 'bar' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              className={`btn btn-xs ${chartType === 'area' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="stat p-3 bg-blue-50 rounded-lg">
            <div className="stat-title text-xs">Total Orders</div>
            <div className="stat-value text-2xl text-blue-600">
              {data.reduce((sum, item) => sum + item.orders, 0)}
            </div>
          </div>
          <div className="stat p-3 bg-green-50 rounded-lg">
            <div className="stat-title text-xs">Total Revenue</div>
            <div className="stat-value text-2xl text-green-600">
              ₹{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
          </div>
          <div className="stat p-3 bg-purple-50 rounded-lg">
            <div className="stat-title text-xs">Avg Orders/Day</div>
            <div className="stat-value text-2xl text-purple-600">
              {(data.reduce((sum, item) => sum + item.orders, 0) / (data.length || 1)).toFixed(1)}
            </div>
          </div>
          <div className="stat p-3 bg-orange-50 rounded-lg">
            <div className="stat-title text-xs">Avg Revenue/Day</div>
            <div className="stat-value text-2xl text-orange-600">
              ₹{(data.reduce((sum, item) => sum + item.revenue, 0) / (data.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
