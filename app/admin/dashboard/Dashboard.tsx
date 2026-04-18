'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import Link from 'next/link';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import useSWR from 'swr';

import { formatNumber, formatPrice } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  BarElement,
  ArcElement,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const Dashboard = () => {
  const { data: summary, error } = useSWR(`/api/admin/summary`);

  if (error) return <div className="text-error text-sm p-2" role="alert">Failed to load charts: {error.message}</div>;
  if (!summary) return <div className="text-xs opacity-70 p-2 animate-pulse">Loading charts…</div>;

  const salesData = {
    labels: summary.salesData.map((x: { _id: string }) => x._id),
    datasets: [
      {
        fill: true,
        label: 'Sales',
        data: summary.salesData.map(
          (x: { totalSales: number }) => x.totalSales,
        ),
        borderColor: '#904917',
        backgroundColor: 'rgba(144, 73, 23, 0.1)',
        pointBackgroundColor: '#904917',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const ordersData = {
    labels: summary.salesData.map((x: { _id: string }) => x._id),
    datasets: [
      {
        fill: true,
        label: 'Orders',
        data: summary.salesData.map(
          (x: { totalOrders: number }) => x.totalOrders,
        ),
        borderColor: '#C5A059',
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        pointBackgroundColor: '#C5A059',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const productsData = {
    labels: summary.productsData.map((x: { _id: string }) => x._id), // 2022/01 2022/03
    datasets: [
      {
        label: 'Category',
        data: summary.productsData.map(
          (x: { totalProducts: number }) => x.totalProducts,
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
      },
    ],
  };
  const usersData = {
    labels: summary.usersData.map((x: { _id: string }) => x._id), // 2022/01 2022/03
    datasets: [
      {
        label: 'Users',
        borderColor: '#2D4B3C',
        backgroundColor: 'rgba(45, 75, 60, 0.1)',
        pointBackgroundColor: '#2D4B3C',
        data: summary.usersData.map(
          (x: { totalUsers: number }) => x.totalUsers,
        ),
      },
    ],
  };

  return (
    <div className="space-y-8" aria-label="Charts overview">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" aria-label="Summary stats">
        <StatCard label="Sales" value={formatPrice(summary.ordersPrice)} href="/admin/orders" />
        <StatCard label="Orders" value={formatNumber(summary.ordersCount)} href="/admin/orders" />
        <StatCard label="Products" value={formatNumber(summary.productsCount)} href="/admin/products" />
        <StatCard label="Users" value={formatNumber(summary.usersCount)} href="/admin/users" />
      </div>

      <div className="grid gap-6 md:grid-cols-2" aria-label="Time series charts">
        <ChartCard title="Sales Report">
          <Line data={salesData} />
        </ChartCard>
        <ChartCard title="Orders Report">
          <Line data={ordersData} />
        </ChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2" aria-label="Category and users charts">
        <ChartCard title="Products Report">
          <Doughnut data={productsData} />
        </ChartCard>
        <ChartCard title="Users Report">
          <Bar data={usersData} />
        </ChartCard>
      </div>
    </div>
  );
};

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col p-5 bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl shadow-sm hover:shadow-md transition-all hover:bg-white/60 no-underline group">
      <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1 group-hover:text-primary/40 transition-colors">{label}</div>
      <div className="text-xl font-bold text-primary truncate group-hover:scale-105 transition-transform origin-left">{value}</div>
      <div className="mt-3 text-[9px] font-label font-bold text-primary/30 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Access Data →</div>
    </Link>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2.5rem] shadow-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      <div className="relative">
        <h2 className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
          <span className="text-lg opacity-60" aria-hidden="true">📈</span> {title}
        </h2>
        <div className="relative h-[220px] sm:h-[300px]">{children}</div>
      </div>
    </div>
  );
}

export default Dashboard;
