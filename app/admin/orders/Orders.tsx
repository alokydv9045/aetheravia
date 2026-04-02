'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import { Order } from '@/lib/models/OrderModel';
import { formatPrice } from '@/lib/utils';

export default function Orders() {
  const { data: orders, error, isLoading, mutate } = useSWR<Order[]>('/api/admin/orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    if (!orders) return [] as Order[];
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesQuery = !q || o._id.toLowerCase().includes(q) || (o.user?.name?.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, search]);

  const uniqueStatuses = useMemo(() => {
    if (!orders) return [] as string[];
    return Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  }, [orders]);

  if (error) return <div className="alert alert-error m-4"><span>Error loading orders.</span></div>;

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full" aria-label="Orders management">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Orders Management</h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">Monitor, filter and inspect recent orders.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 max-w-full">
          <div className="flex items-center gap-2">
            <label htmlFor="orders-search" className="sr-only">Search orders</label>
            <input
              id="orders-search"
              type="text"
              placeholder="Search ID or customer"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full sm:w-56"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              className="select select-sm select-bordered w-full sm:w-44"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s.replaceAll('_',' ')}</option>
              ))}
            </select>
          </div>
          <button onClick={() => mutate()} className="btn btn-sm btn-outline" aria-label="Refresh orders">↻ Refresh</button>
        </div>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_,i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-base-100 p-4 space-y-3">
              <div className="h-3 w-1/2 bg-base-300 rounded" />
              <div className="h-3 w-1/3 bg-base-300 rounded" />
              <div className="h-3 w-2/3 bg-base-200 rounded" />
              <div className="h-3 w-1/4 bg-base-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Mobile Card List */}
          <ul className="space-y-3 sm:hidden" aria-label="Orders list (mobile)">
            {filtered.map(o => (
              <li key={o._id} className="rounded-lg border bg-base-100 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] bg-base-200 px-2 py-0.5 rounded">
                    …{o._id.slice(-6)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs flex flex-wrap gap-x-4 gap-y-1">
                  <span>{o.user?.name || 'Deleted user'}</span>
                  <span>{new Date(o.createdAt).toLocaleDateString(undefined,{ month:'short', day:'numeric' })}</span>
                  <span className="font-semibold">{formatPrice(o.totalPrice)}</span>
                </div>
                <div>
                  <Link href={'/order/' + o._id} className="btn btn-xs btn-primary">View</Link>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-center text-xs opacity-60 py-6">No matching orders</li>
            )}
          </ul>

          {/* Desktop Table */}
          <div className="overflow-x-auto bg-base-100 rounded-lg border hidden sm:block">
            <table className="table table-zebra table-xs sm:table-sm md:table-md">
              <caption className="sr-only">Orders table with id, customer, date, total, status and actions</caption>
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Order</th>
                  <th className="whitespace-nowrap">Customer</th>
                  <th className="whitespace-nowrap">Date</th>
                  <th className="text-right whitespace-nowrap">Total</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o._id} className="hover">
                    <td className="font-mono text-xs">…{o._id.slice(-8)}</td>
                    <td className="max-w-[180px] truncate" title={o.user?.name || 'Deleted user'}>{o.user?.name || 'Deleted user'}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString(undefined,{ year:'2-digit', month:'short', day:'numeric' })}</td>
                    <td className="text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-right">
                      <Link href={'/order/' + o._id} className="btn btn-xs btn-outline">View</Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-xs opacity-60 py-6">No matching orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="badge badge-ghost badge-sm">unknown</span>;
  const normalized = status.toLowerCase();
  const map: Record<string, string> = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-accent',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    returned: 'badge-neutral'
  };
  const cls = map[normalized] || 'badge-outline';
  return <span className={`badge badge-sm ${cls}`}>{normalized.replaceAll('_',' ')}</span>;
}
