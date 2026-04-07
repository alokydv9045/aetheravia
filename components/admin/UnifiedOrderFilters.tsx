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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UnifiedOrderFiltersProps {
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
  { value: 'user.name', label: 'Customer Name' },
];

export default function UnifiedOrderFilters({
  onFiltersChange,
  totalOrders = 0,
  currentPage = 1,
  isLoading = false,
}: UnifiedOrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: undefined,
    maxAmount: undefined,
    paymentMethod: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  // Initialize filters from URL params
  useEffect(() => {
    if (searchParams) {
      const urlFilters: OrderFilters = {
        search: searchParams?.get('search') ?? '',
        status: searchParams?.get('status') ?? '',
        dateFrom: searchParams?.get('dateFrom') ?? '',
        dateTo: searchParams?.get('dateTo') ?? '',
        minAmount: searchParams?.get('minAmount') ? Number(searchParams?.get('minAmount')) : undefined,
        maxAmount: searchParams?.get('maxAmount') ? Number(searchParams?.get('maxAmount')) : undefined,
        paymentMethod: searchParams?.get('paymentMethod') ?? '',
        sortBy: searchParams?.get('sortBy') ?? 'createdAt',
        sortOrder: (searchParams?.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
        page: Number(searchParams?.get('page') ?? '1') || 1,
        limit: Number(searchParams?.get('limit') ?? '20') || 20,
      };
      setLocalFilters(urlFilters);
    }
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof OrderFilters, value: any) => {
    const updatedFilters = {
      ...localFilters,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when changing filters
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [localFilters, onFiltersChange]);

  // Handle reset filters
  const handleReset = useCallback(() => {
    const resetFilters: OrderFilters = {
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: undefined,
      maxAmount: undefined,
      paymentMethod: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  }, [onFiltersChange]);

  // Check if any advanced filters are active
  const hasAdvancedFilters = !!(localFilters.dateFrom || localFilters.dateTo || 
    localFilters.minAmount || localFilters.maxAmount || 
    localFilters.paymentMethod);

  useEffect(() => {
    if (hasAdvancedFilters) {
      setShowAdvanced(true);
    }
  }, [hasAdvancedFilters]);

  return (
    <div className="bg-base-100 rounded-lg shadow p-6 mb-6">
      {/* Basic Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Search</span>
          </label>
          <input
            type="text"
            placeholder="Order ID, customer name, email..."
            className="input input-bordered"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Status</span>
          </label>
          <select
            className="select select-bordered"
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Sort By</span>
          </label>
          <select
            className="select select-bordered"
            value={localFilters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Order</span>
          </label>
          <select
            className="select select-bordered"
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>Advanced Filters</span>
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Date From</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Date To</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* Amount Range */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Min Amount</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="input input-bordered"
                value={localFilters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Max Amount</span>
              </label>
              <input
                type="number"
                placeholder="10000"
                className="input input-bordered"
                value={localFilters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Payment Method */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Payment Method</span>
              </label>
              <select
                className="select select-bordered"
                value={localFilters.paymentMethod || ''}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-base-content/70">
        <span>
          {isLoading ? (
            <span className="loading loading-spinner loading-sm mr-2"></span>
          ) : null}
          Showing results for {totalOrders} orders
        </span>
        <span>Page {currentPage}</span>
      </div>
    </div>
  );
}