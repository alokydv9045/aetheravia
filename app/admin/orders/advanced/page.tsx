'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import AdvancedOrderFilters, { OrderFilters } from '@/components/admin/AdvancedOrderFilters';
import BulkOrderList from '@/components/admin/BulkOrderList';

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

export default function AdvancedOrderManagement() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current filters from URL
  const getCurrentFiltersFromURL = useCallback((): OrderFilters => {
    const searchParams = new URLSearchParams(window.location.search);
    
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      paymentMethod: searchParams.get('paymentMethod') || '',
      shippingMethod: searchParams.get('shippingMethod') || '',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };
  }, []);

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

      const response = await fetch(`/api/admin/orders/advanced?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
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

  // Handle bulk status update
  const handleBulkStatusUpdate = useCallback(async (orderIds: string[], newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders/advanced', {
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

      // Refresh the orders list
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

  // Handle bulk delete
  const handleBulkDelete = useCallback(async (orderIds: string[]) => {
    try {
      const response = await fetch('/api/admin/orders/advanced', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulkDelete',
          orderIds,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete orders');
      }

      // Refresh the orders list
      const currentFilters = getCurrentFiltersFromURL();
      await fetchOrders(currentFilters);
      
      alert(`Successfully deleted ${data.deletedCount} orders`);
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete orders');
    }
  }, [fetchOrders, getCurrentFiltersFromURL]);

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
          <h1 className="text-3xl font-bold mb-2">Advanced Order Management</h1>
          <p className="text-gray-600">
            Search, filter, and manage orders with bulk operations
          </p>
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
        <AdvancedOrderFilters
          onFiltersChange={fetchOrders}
          totalOrders={pagination.totalOrders}
          currentPage={pagination.currentPage}
          isLoading={loading}
        />

        {/* Orders List with Bulk Operations */}
        <BulkOrderList
          orders={orders}
          loading={loading}
          onStatusUpdate={handleBulkStatusUpdate}
          onExport={handleBulkExport}
          onDelete={handleBulkDelete}
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
                  fetchOrders({ ...filters, page: pagination.currentPage - 1 });
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
                  fetchOrders({ ...filters, page: pagination.currentPage + 1 });
                }}
              >
                Next »
              </button>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value text-primary">{pagination.totalOrders}</div>
          </div>
          
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Current Page</div>
            <div className="stat-value text-secondary">{pagination.currentPage}</div>
          </div>
          
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Results Per Page</div>
            <div className="stat-value text-accent">{pagination.limit}</div>
          </div>
        </div>
      </div>
    </div>
  );
}