"use client";

import Link from "next/link";
import useSWR from "swr";

import { formatPrice } from "@/lib/utils";

type OrderLite = {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' as RequestCredentials });
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
};

export default function OrdersList() {
  const { data, error } = useSWR<OrderLite[]>("/api/orders/mine", fetcher, { shouldRetryOnError: (e) => false });
  if (error) return <p className='text-error'>Failed to load orders.</p>;
  if (!data) return <p className='opacity-70'>Loading...</p>;
  if (Array.isArray(data) && data.length === 0) return <p className='opacity-70'>No orders yet.</p>;
  return (
    <div>
      {/* Mobile Card View */}
      <div className='block md:hidden space-y-3'>
        {data.map((o) => (
          <div key={o._id} className='card bg-base-200 p-4'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <div className='font-semibold'>#{o._id.slice(-8)}</div>
                <div className='text-sm opacity-70'>{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className='text-right'>
                <div className='font-bold'>{formatPrice(o.totalPrice)}</div>
                <div className='text-xs'>
                  <span className={`badge badge-xs ${o.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {o.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  {' '}
                  <span className={`badge badge-xs ${o.isDelivered ? 'badge-success' : 'badge-info'}`}>
                    {o.isDelivered ? 'Delivered' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <Link className='btn btn-sm btn-primary w-full' href={`/order/${o._id}`}>View Details</Link>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='table text-sm' role='table' aria-label='Order history'>
          <thead>
            <tr>
              <th scope='col'>Order</th>
              <th scope='col'>Date</th>
              <th scope='col'>Status</th>
              <th scope='col'>Total</th>
              <th scope='col'>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o._id} className='transition hover:bg-base-200/60'>
                <td>#{o._id.slice(-8)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  {o.isPaid ? 'Paid' : 'Unpaid'} / {o.isDelivered ? 'Delivered' : 'Pending'}
                </td>
                <td>{formatPrice(o.totalPrice)}</td>
                <td><Link className='btn btn-sm btn-ghost' href={`/order/${o._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
