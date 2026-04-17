'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import { Order } from '@/lib/models/OrderModel';
import { formatPrice } from '@/lib/utils';
import ReorderButton from '@/components/order/ReorderButton';

const MyOrders = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: orders, error, isLoading } = useSWR(`/api/orders/mine?refresh=${refreshKey}`);

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated' || !session) {
      const msg = 'Please sign in to view your order history';
      toast.error(msg, { id: msg });
      router.push('/signin?callbackUrl=/order-history');
      return;
    }
  }, [status, session, router]);

  const handleReorderSuccess = () => {
    // Optionally refresh orders or show success message
    alert('Items added to cart successfully! Redirecting to cart...');
    router.push('/cart');
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading order history...</span>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Redirecting to sign in...</span>
      </div>
    );
  }

  if (error) return <>An error has occurred</>;
  if (isLoading) return <>Loading...</>;
  if (!orders) return <>No orders...</>;

  return (
    <div className='overflow-x-auto'>
      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>PAID</th>
            <th>DELIVERED</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: Order) => (
            <tr key={order._id}>
              <td>{order._id.substring(20, 24)}</td>
              <td className='whitespace-nowrap'>
                {order.createdAt.substring(0, 10)}
              </td>
              <td>{formatPrice(order.totalPrice)}</td>
              <td>
                {order.isPaid && order.paidAt
                  ? `${order.paidAt.substring(0, 10)}`
                  : 'not paid'}
              </td>
              <td>
                {order.isDelivered && order.deliveredAt
                  ? `${order.deliveredAt.substring(0, 10)}`
                  : 'not delivered'}
              </td>
              <td>
                <span 
                  className={`badge ${
                    (order as any).status === 'delivered' ? 'badge-success' :
                    (order as any).status === 'shipped' ? 'badge-info' :
                    (order as any).status === 'processing' ? 'badge-warning' :
                    (order as any).status === 'cancelled' ? 'badge-error' :
                    'badge-ghost'
                  }`}
                >
                  {(order as any).status || 'pending'}
                </span>
              </td>
              <td>
                <div className="flex gap-2">
                  <Link href={`/order/${order._id}`} className="btn btn-sm btn-outline">
                    Details
                  </Link>
                  <ReorderButton
                    orderId={order._id}
                    orderStatus={(order as any).status}
                    size="sm"
                    variant="primary"
                    onSuccess={handleReorderSuccess}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrders;
