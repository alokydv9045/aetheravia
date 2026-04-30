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
import { motion } from 'framer-motion';
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

const Dashboard = () => {
  const { data: summary, error } = useSWR(`/api/admin/summary`);

  if (error) return <div className="text-error text-sm p-2" role="alert">Failed to load archive: {error.message}</div>;
  if (!summary) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-surface-container-low animate-pulse rounded-2xl border border-outline-variant/10"></div>
      ))}
    </div>
  );

  const salesData = {
    labels: summary.salesData.length > 0 
      ? summary.salesData.map((x: { _id: string }) => x._id.split('-')[1] || x._id)
      : ['Jan', 'Feb', 'Mar'], // Fallback labels
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: summary.salesData.length > 0 
          ? summary.salesData.map((x: { totalSales: number }) => x.totalSales)
          : [0, 0, 0],
        borderColor: '#904917',
        backgroundColor: 'rgba(144, 73, 23, 0.05)',
        pointBackgroundColor: '#904917',
        tension: 0.4,
        borderWidth: 3,
      }
    ],
  };

  const categoryData = {
    labels: summary.productsData.length > 0 
      ? summary.productsData.map((x: { _id: string }) => x._id)
      : ['No Data'],
    datasets: [
      {
        data: summary.productsData.length > 0 
          ? summary.productsData.map((x: { totalProducts: number }) => x.totalProducts)
          : [1],
        backgroundColor: summary.productsData.length > 0 
          ? ['#904917', '#725a39', '#ae602d', '#d4c3b9']
          : ['#f0ede8'],
        borderWidth: 0,
        hoverOffset: 20,
      },
    ],
  };

  // Get total orders count
  const paidOrders = summary.ordersData?.find((o: any) => o._id === true)?.count || 0;
  const pendingOrders = summary.ordersData?.find((o: any) => o._id === false)?.count || 0;

  return (
    <div className="space-y-12">
      {/* Bento Grid - Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Total Revenue" 
          value={formatPrice(summary.ordersPrice)} 
          trend="Live" 
          icon="payments" 
          variant="primary"
        />
        <StatCard 
          label="Total Orders" 
          value={formatNumber(summary.ordersCount)} 
          trend={summary.ordersCount > 0 ? "Tracking" : "Empty"} 
          icon="inventory_2" 
        />
        <StatCard 
          label="Products" 
          value={formatNumber(summary.productsCount)} 
          trend="Active" 
          icon="spa" 
        />
        <StatCard 
          label="Users" 
          value={formatNumber(summary.usersCount)} 
          trend="Growth" 
          icon="group" 
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest p-10 border border-outline-variant/10 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-headline italic font-bold text-on-surface">Revenue Pipeline</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Performance</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              {summary.salesData.length > 0 ? (
                <Line 
                  data={salesData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.02)' }, ticks: { font: { size: 10 } } },
                      x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Manrope' } } }
                    }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                   <span className="material-symbols-outlined text-6xl">analytics</span>
                   <p className="text-xs font-bold uppercase tracking-widest">Awaiting First Transaction</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 flex flex-col">
          <h3 className="text-xl font-headline italic font-bold text-on-surface mb-8">Category Mix</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[240px]">
            <Doughnut 
              data={categoryData}
              options={{
                cutout: '75%',
                plugins: { legend: { display: false } }
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-headline font-bold text-primary">
                {summary.productsCount > 0 ? 'Live' : '0'}
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40">Inventory</p>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {summary.productsData.length > 0 ? (
              summary.productsData.slice(0, 3).map((cat: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryData.datasets[0].backgroundColor[i] }}></div>
                    <span className="text-on-surface/70">{cat._id || 'Uncategorized'}</span>
                  </div>
                  <span className="text-primary">{cat.totalProducts}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-widest">No Products Logged</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="text-2xl font-headline font-bold text-on-surface italic">Recent Onboardings</h3>
            <Link href="/admin/users" className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary hover:tracking-[0.3em] transition-all">Archive</Link>
          </div>
          <div className="space-y-2">
            {summary.latestUsers?.length > 0 ? (
              summary.latestUsers.map((user: any, i: number) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/10">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center font-headline text-primary italic font-bold">
                    {user.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{user.name || 'Anonymous'}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Customer</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-30">
                 <p className="text-xs font-bold uppercase tracking-[0.2em]">No Users Registered Yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 p-10 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-primary/10">
          <div className="absolute -top-12 -right-12 w-48 h-48 opacity-10 rotate-12">
            <span className="material-symbols-outlined text-[12rem] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary mb-4 block">Store Status</span>
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-8 italic leading-tight">
              Operational <br/>Insights
            </h3>
            <div className="flex gap-4 mb-10">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] ${summary.ordersCount > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-gray-100 text-gray-400'}`}>
                {summary.ordersCount > 0 ? 'Sales Active' : 'Staged'}
              </span>
              <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] shadow-lg shadow-primary/20">Production Mode</span>
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
            <MetricsBox label="Paid Orders" value={paidOrders} />
            <MetricsBox label="Pending" value={pendingOrders} />
            <MetricsBox label="Total Value" value={formatPrice(summary.ordersPrice)} primary />
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ label, value, trend, icon, variant }: any) {
  return (
    <div className={`p-8 rounded-2xl border border-outline-variant/10 relative overflow-hidden group transition-all hover:shadow-xl hover:shadow-primary/5 ${variant === 'primary' ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110 ${variant === 'primary' ? 'bg-primary/5' : 'bg-secondary/5'}`}></div>
      <div className="flex flex-col gap-5 relative">
        <span className={`material-symbols-outlined text-2xl ${variant === 'primary' ? 'text-primary' : 'text-secondary/60'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-bold">{label}</h4>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-headline font-bold text-on-surface">{value}</p>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/5 text-primary uppercase tracking-widest">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function MetricsBox({ label, value, primary }: any) {
  return (
    <div className={`flex-1 h-24 rounded-xl p-4 flex flex-col justify-between border ${primary ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
      <p className={`text-[8px] uppercase tracking-widest font-bold ${primary ? 'text-on-primary/60' : 'text-on-surface-variant/40'}`}>{label}</p>
      <p className={`text-xl font-headline font-bold italic ${primary ? 'text-on-primary' : 'text-on-surface'}`}>{value}</p>
    </div>
  );
}

export default Dashboard;
