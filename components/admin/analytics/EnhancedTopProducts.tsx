'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Image from 'next/image';

interface ProductData {
  _id: string;
  name: string;
  image?: string;
  totalQuantity: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderQuantity: number;
}

interface Props {
  topProducts: ProductData[];
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function EnhancedTopProducts({ topProducts, isLoading }: Props) {
  const [animationKey, setAnimationKey] = useState(0);
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue' | 'orders'>('quantity');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [topProducts, sortBy]);

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Top Selling Products</h2>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Top Selling Products</h2>
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg font-semibold">No product data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedProducts = [...topProducts].sort((a, b) => {
    switch (sortBy) {
      case 'quantity':
        return b.totalQuantity - a.totalQuantity;
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'orders':
        return b.totalOrders - a.totalOrders;
      default:
        return 0;
    }
  });

  const chartData = sortedProducts.slice(0, 8).map((product) => ({
    shortName: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    fullName: product.name,
    value: sortBy === 'quantity' ? product.totalQuantity : sortBy === 'revenue' ? product.totalRevenue : product.totalOrders,
    ...product
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{data.totalQuantity}</span></p>
          <p className="text-sm text-gray-600">Revenue: <span className="font-semibold">₹{data.totalRevenue.toLocaleString()}</span></p>
          <p className="text-sm text-gray-600">Orders: <span className="font-semibold">{data.totalOrders}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Top Selling Products
            <div className="badge badge-success">Real-time</div>
          </h2>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-outline gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a onClick={() => setSortBy('quantity')}>Quantity Sold</a></li>
              <li><a onClick={() => setSortBy('revenue')}>Revenue Generated</a></li>
              <li><a onClick={() => setSortBy('orders')}>Number of Orders</a></li>
            </ul>
          </div>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300} key={animationKey}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 11 }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={hoveredProduct === null || hoveredProduct === entry._id ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Product Cards */}
        <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
          {sortedProducts.map((product, index) => {
            const isHovered = hoveredProduct === product._id;
            const bgColor = COLORS[index % COLORS.length];

            return (
              <div
                key={product._id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'shadow-lg scale-105' : 'shadow'
                }`}
                style={{
                  backgroundColor: `${bgColor}10`,
                  borderLeft: `4px solid ${bgColor}`,
                }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {product.image ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Qty: {product.totalQuantity}</span>
                    <span>Orders: {product.totalOrders}</span>
                    <span>Avg: {product.averageOrderQuantity.toFixed(1)}</span>
                  </div>
                </div>

                {/* Revenue */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold" style={{ color: bgColor }}>
                    ₹{product.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>

                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: bgColor }}
                  >
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="stat p-3 bg-blue-50 rounded-lg">
            <div className="stat-title text-xs">Total Units</div>
            <div className="stat-value text-xl text-blue-600">
              {sortedProducts.reduce((sum, p) => sum + p.totalQuantity, 0)}
            </div>
          </div>
          <div className="stat p-3 bg-green-50 rounded-lg">
            <div className="stat-title text-xs">Total Revenue</div>
            <div className="stat-value text-xl text-green-600">
              ₹{sortedProducts.reduce((sum, p) => sum + p.totalRevenue, 0).toLocaleString()}
            </div>
          </div>
          <div className="stat p-3 bg-purple-50 rounded-lg">
            <div className="stat-title text-xs">Total Orders</div>
            <div className="stat-value text-xl text-purple-600">
              {sortedProducts.reduce((sum, p) => sum + p.totalOrders, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
