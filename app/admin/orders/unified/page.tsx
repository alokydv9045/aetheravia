'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Update the path below to the correct relative path if the file exists elsewhere, for example:
// Update the import path below to the correct location of UnifiedOrderFilters
// Example if the file exists at src/components/admin/UnifiedOrderFilters.tsx:
import UnifiedOrderFilters, { OrderFilters } from '@/components/admin/UnifiedOrderFilters';
// If the file does not exist, create it at src/components/admin/UnifiedOrderFilters.tsx or the appropriate location.
// Or adjust as needed based on your actual folder structure
import UnifiedOrderList from '@/components/admin/UnifiedOrderList';
import { formatPrice } from '@/lib/utils';

interface Order {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: string;
  status: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  averageOrderValue: number;
}

export default function UnifiedOrderManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Get current filters from URL
  const getCurrentFiltersFromURL = useCallback((): OrderFilters => {
    if (!searchParams) {
      return {
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
    }

    return {
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
  }, [searchParams]);

  // Update URL with filters
  const updateURL = useCallback((filters: OrderFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });

    router.push(`/admin/orders/unified?${params.toString()}`);
  }, [router]);

  // Fetch orders with filters
  const fetchOrders = useCallback(async (filters: OrderFilters) => {
    setLoading(true);
    setError('');

    try {
      const searchParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/orders/unified?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filters change
  const handleFiltersChange = useCallback((filters: OrderFilters) => {
    updateURL(filters);
    fetchOrders(filters);
  }, [updateURL, fetchOrders]);

  // Handle bulk status update
  const handleBulkStatusUpdate = useCallback(async (orderIds: string[], newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulkStatusUpdate',
          orderIds,
          status: newStatus,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      // Clear selection and refresh
      setSelectedOrders(new Set());
      const currentFilters = getCurrentFiltersFromURL();
      await fetchOrders(currentFilters);
      
      alert(`Successfully updated ${data.modifiedCount} orders`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  }, [fetchOrders, getCurrentFiltersFromURL]);


  // Handle bulk export
  const handleBulkExport = useCallback(async (orderIds: string[]) => {
    try {
      const searchParams = new URLSearchParams();
      orderIds.forEach(id => searchParams.append('orderIds[]', id));
      
      const response = await fetch(`/api/admin/analytics/export?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      // Create and download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert(err instanceof Error ? err.message : 'Failed to export orders');
    }
  }, []);

  // Handle individual order status update
  const handleOrderStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      // Update order in local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus, orderStatus: newStatus } : order
      ));
      
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  }, []);


  // Initialize with URL filters
  useEffect(() => {
    const filters = getCurrentFiltersFromURL();
    fetchOrders(filters);
  }, [getCurrentFiltersFromURL, fetchOrders]);

  // Check admin access
  if (!session?.user || !(session.user as any).isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-gray-600">
            Complete order management with advanced filtering and bulk operations.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="stat bg-primary text-primary-content shadow rounded-lg">
            <div className="stat-title text-primary-content/70">Total Orders</div>
            <div className="stat-value text-2xl">{stats.totalOrders}</div>
          </div>
          
          <div className="stat bg-success text-success-content shadow rounded-lg">
            <div className="stat-title text-success-content/70">Total Revenue</div>
            <div className="stat-value text-2xl">{formatPrice(stats.totalRevenue)}</div>
          </div>
          
          <div className="stat bg-warning text-warning-content shadow rounded-lg">
            <div className="stat-title text-warning-content/70">Pending</div>
            <div className="stat-value text-2xl">{stats.pendingOrders}</div>
          </div>
          
          <div className="stat bg-info text-info-content shadow rounded-lg">
            <div className="stat-title text-info-content/70">Delivered</div>
            <div className="stat-value text-2xl">{stats.deliveredOrders}</div>
          </div>
          
          <div className="stat bg-accent text-accent-content shadow rounded-lg">
            <div className="stat-title text-accent-content/70">Avg. Value</div>
            <div className="stat-value text-2xl">{formatPrice(stats.averageOrderValue)}</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Advanced Filters */}
        <UnifiedOrderFilters
          onFiltersChange={handleFiltersChange}
          totalOrders={pagination.totalOrders}
          currentPage={pagination.currentPage}
          isLoading={loading}
        />

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="join">
              <button 
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'cards' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium self-center">
                {selectedOrders.size} selected:
              </span>
              
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                  Update Status
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a onClick={() => handleBulkStatusUpdate(Array.from(selectedOrders), 'processing')}>Processing</a></li>
                  <li><a onClick={() => handleBulkStatusUpdate(Array.from(selectedOrders), 'shipped')}>Shipped</a></li>
                  <li><a onClick={() => handleBulkStatusUpdate(Array.from(selectedOrders), 'delivered')}>Delivered</a></li>
                  <li><a onClick={() => handleBulkStatusUpdate(Array.from(selectedOrders), 'cancelled')}>Cancelled</a></li>
                </ul>
              </div>


              <button 
                className="btn btn-sm btn-outline"
                onClick={() => handleBulkExport(Array.from(selectedOrders))}
              >
                Export
              </button>
            </div>
          )}
        </div>

        {/* Orders List */}
        <UnifiedOrderList
          orders={orders}
          loading={loading}
          viewMode={viewMode}
          selectedOrders={selectedOrders}
          onSelectionChange={setSelectedOrders}
          onStatusUpdate={handleOrderStatusUpdate}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="join">
              <button
                className="join-item btn"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => {
                  const filters = getCurrentFiltersFromURL();
                  handleFiltersChange({ ...filters, page: pagination.currentPage - 1 });
                }}
              >
                « Previous
              </button>
              
              <button className="join-item btn btn-active">
                Page {pagination.currentPage} of {pagination.totalPages}
              </button>
              
              <button
                className="join-item btn"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => {
                  const filters = getCurrentFiltersFromURL();
                  handleFiltersChange({ ...filters, page: pagination.currentPage + 1 });
                }}
              >
                Next »
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}