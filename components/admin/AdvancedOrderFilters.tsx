'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface OrderFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface AdvancedOrderFiltersProps {
  onFiltersChange: (filters: OrderFilters) => void;
  totalOrders?: number;
  currentPage?: number;
  isLoading?: boolean;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const paymentMethodOptions = [
  { value: '', label: 'All Payment Methods' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'wallet', label: 'Wallet' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Order Date' },
  { value: 'totalPrice', label: 'Order Amount' },
  { value: 'orderStatus', label: 'Status' },
  { value: 'updatedAt', label: 'Last Updated' },
];

export default function AdvancedOrderFilters({
  onFiltersChange,
  totalOrders = 0,
  currentPage = 1,
  isLoading = false,
}: AdvancedOrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: undefined,
    maxAmount: undefined,
    paymentMethod: '',
    shippingMethod: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: OrderFilters = {
      search: searchParams?.get('search') ?? '',
      status: searchParams?.get('status') ?? '',
      dateFrom: searchParams?.get('dateFrom') ?? '',
      dateTo: searchParams?.get('dateTo') ?? '',
      minAmount: searchParams?.get('minAmount') ? Number(searchParams?.get('minAmount')) : undefined,
      maxAmount: searchParams?.get('maxAmount') ? Number(searchParams?.get('maxAmount')) : undefined,
      paymentMethod: searchParams?.get('paymentMethod') ?? '',
      shippingMethod: searchParams?.get('shippingMethod') ?? '',
      sortBy: searchParams?.get('sortBy') ?? 'createdAt',
      sortOrder: (searchParams?.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
      page: Number(searchParams?.get('page') ?? '1') || 1,
      limit: Number(searchParams?.get('limit') ?? '20') || 20,
    };

    setFilters(initialFilters);
    
    // Count applied filters
    const count = Object.entries(initialFilters).filter(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder' || key === 'page' || key === 'limit') return false;
      return value !== '' && value !== undefined;
    }).length;
    setAppliedFiltersCount(count);
    
    onFiltersChange(initialFilters);
  }, [searchParams, onFiltersChange]);

  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filters change
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const clearFilters = () => {
    const clearedFilters: OrderFilters = {
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: undefined,
      maxAmount: undefined,
      paymentMethod: '',
      shippingMethod: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    };
    setFilters(clearedFilters);
    setAppliedFiltersCount(0);
    router.push(window.location.pathname, { scroll: false });
  };

  const getDatePreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'today':
        return {
          dateFrom: today.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0],
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          dateFrom: yesterday.toISOString().split('T')[0],
          dateTo: yesterday.toISOString().split('T')[0],
        };
      case 'last7days':
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return {
          dateFrom: week.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0],
        };
      case 'last30days':
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return {
          dateFrom: month.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0],
        };
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          dateFrom: monthStart.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0],
        };
      default:
        return { dateFrom: '', dateTo: '' };
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      {/* Quick Search and Basic Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email..."
              className="input input-bordered w-full pl-10"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Filter */}
        <select
          className="select select-bordered min-w-48"
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            className="select select-bordered"
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className={`btn ${filters.sortOrder === 'desc' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => updateFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
          >
            {filters.sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>

        {/* Advanced Toggle */}
        <button
          className={`btn ${showAdvanced ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced
          {appliedFiltersCount > 0 && (
            <span className="badge badge-secondary badge-sm ml-2">
              {appliedFiltersCount}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {appliedFiltersCount > 0 && (
          <button
            className="btn btn-ghost"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Date Range</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input input-bordered input-sm flex-1"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                />
                <input
                  type="date"
                  className="input input-bordered input-sm flex-1"
                  value={filters.dateTo}
                  onChange={(e) => updateFilters({ dateTo: e.target.value })}
                />
              </div>
              
              {/* Date Presets */}
              <div className="flex flex-wrap gap-1">
                {['today', 'yesterday', 'last7days', 'last30days', 'thisMonth'].map(preset => (
                  <button
                    key={preset}
                    className="btn btn-xs btn-outline"
                    onClick={() => updateFilters(getDatePreset(preset))}
                  >
                    {preset === 'last7days' ? 'Last 7 days' : 
                     preset === 'last30days' ? 'Last 30 days' :
                     preset === 'thisMonth' ? 'This month' :
                     preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Amount Range</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  className="input input-bordered input-sm flex-1"
                  value={filters.minAmount || ''}
                  onChange={(e) => updateFilters({ minAmount: e.target.value ? Number(e.target.value) : undefined })}
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  className="input input-bordered input-sm flex-1"
                  value={filters.maxAmount || ''}
                  onChange={(e) => updateFilters({ maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Payment Method</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={filters.paymentMethod}
                onChange={(e) => updateFilters({ paymentMethod: e.target.value })}
              >
                {paymentMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Per Page */}
          <div className="flex items-center gap-4">
            <label className="label">
              <span className="label-text">Results per page:</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filters.limit}
              onChange={(e) => updateFilters({ limit: Number(e.target.value) })}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm mr-2"></span>
          ) : null}
          Showing {totalOrders} orders
          {appliedFiltersCount > 0 && ` (${appliedFiltersCount} filter${appliedFiltersCount > 1 ? 's' : ''} applied)`}
        </div>
        
        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>
      </div>
    </div>
  );
}