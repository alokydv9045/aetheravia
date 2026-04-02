'use client';

import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface TopProductsProps {
  topProducts: Array<{
    _id: string;
    name: string;
    image?: string;
    totalQuantity: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderQuantity: number;
  }>;
  isLoading?: boolean;
}

export default function TopProducts({ topProducts, isLoading = false }: TopProductsProps) {
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Top Selling Products</h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-100 rounded animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topProducts.length === 0) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Top Selling Products</h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No product data available
          </div>
        </div>
      </div>
    );
  }

  const maxQuantity = Math.max(...topProducts.map(p => p.totalQuantity));

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title">Top Selling Products</h3>
          <div className="text-sm text-gray-600">
            {topProducts.length} products
          </div>
        </div>

        <div className="space-y-4">
          {topProducts.map((product, index) => {
            const percentage = (product.totalQuantity / maxQuantity) * 100;
            
            return (
              <div key={product._id} className="group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate mb-1">
                      {product.name}
                    </h4>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{product.totalQuantity} units sold</span>
                      <span>•</span>
                      <span>{product.totalOrders} orders</span>
                      <span>•</span>
                      <span>{product.averageOrderQuantity.toFixed(1)} avg/order</span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(product.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Revenue
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {topProducts.reduce((sum, p) => sum + p.totalQuantity, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(topProducts.reduce((sum, p) => sum + p.totalRevenue, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {topProducts.reduce((sum, p) => sum + p.totalOrders, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(topProducts.reduce((sum, p) => sum + p.averageOrderQuantity, 0) / topProducts.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Units/Order</div>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <button className="btn btn-outline btn-sm">
            View All Products Analytics
          </button>
        </div>
      </div>
    </div>
  );
}