"use client";
import useSWR from 'swr';

type SalesDay = { date: string; revenue: number; orders: number };

type Metrics = {
  salesByDay: SalesDay[];
  ordersByStatus: Record<string, number>;
  topProducts: Array<{ _id: string; name: string; image?: string; qty: number; revenue: number }>;
  lowStock: Array<{ _id: string; name: string; slug: string; countInStock: number }>;
  recentOrders: Array<{ _id: string; totalPrice: number; status: string; createdAt: string; isPaid: boolean }>; 
  newUsers: number;
};

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function AdminDashboardPro() {
  const { data, error, isLoading } = useSWR<Metrics>('/api/admin/dashboard/metrics', fetcher, { refreshInterval: 60_000 });

  if (isLoading) return <div className="p-6">Loading insights…</div>;
  if (error || !data) return <div className="p-6 text-error">Failed to load insights</div>;

  const { salesByDay, ordersByStatus, topProducts, lowStock, recentOrders, newUsers } = data;

  const totalRevenue14 = salesByDay.reduce((s, d) => s + d.revenue, 0);
  const totalOrders14 = salesByDay.reduce((s, d) => s + d.orders, 0);

  return (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-min w-full max-w-[1600px] mx-auto" aria-label="Extended analytics panels">
      {/* Last 14 days */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden xl:col-span-2 md:col-span-2 relative" aria-labelledby="last14-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        <div className="relative">
          <h2 id="last14-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <span className="text-lg opacity-60">📅</span> Last 14 Days
          </h2>
          <div className="text-xs sm:text-sm opacity-70 flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span>Revenue ₹{totalRevenue14.toLocaleString('en-IN')}</span>
            <span>Orders {totalOrders14}</span>
          </div>
          <div className="overflow-x-auto mt-4 rounded-md border border-base-300/40">
            <table className="table table-xs sm:table-sm">
              <caption className="sr-only">Daily revenue and order counts for the last 14 days</caption>
              <thead>
                <tr><th>Date</th><th className="text-right">Revenue (₹)</th><th className="text-right">Orders</th></tr>
              </thead>
              <tbody>
                {salesByDay.map(row => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td className="text-right">{row.revenue.toLocaleString('en-IN')}</td>
                    <td className="text-right">{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Orders by status */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden relative" aria-labelledby="status-heading">
         <div className="absolute inset-0 bg-gradient-to-br from-stone-500/5 to-transparent pointer-events-none"></div>
         <div className="relative">
           <h2 id="status-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <span className="text-lg opacity-60">📦</span> Orders by Status
           </h2>
          <div className="overflow-x-auto mt-2">
            <table className="table table-xs sm:table-sm">
              <caption className="sr-only">Orders grouped by current status</caption>
              <thead>
                <tr>
                  <th>Status</th>
                  <th className="text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ordersByStatus).map(([k, v]) => (
                  <tr key={k}>
                    <td className="capitalize">{k.replaceAll('_', ' ')}</td>
                    <td className="text-right"><span className="badge badge-sm">{v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Top products */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden relative" aria-labelledby="top-products-heading">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
         <div className="relative">
           <h2 id="top-products-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <span className="text-lg opacity-60">🏆</span> Top Products (30d)
           </h2>
          <div className="overflow-x-auto mt-2">
            <table className="table table-xs sm:table-sm">
              <caption className="sr-only">Top performing products by quantity and revenue</caption>
              <thead><tr><th>Product</th><th className="text-right">Qty</th><th className="text-right">Revenue (₹)</th></tr></thead>
              <tbody>
                {topProducts.map(p => (
                  <tr key={p._id}>
                    <td className="truncate max-w-[140px]" title={p.name}>{p.name}</td>
                    <td className="text-right">{p.qty}</td>
                    <td className="text-right">{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Low stock */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden relative" aria-labelledby="low-stock-heading">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
         <div className="relative">
           <h2 id="low-stock-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <span className="text-lg opacity-60">⚠️</span> Low Stock (≤5)
           </h2>
          <ul className="divide-y divide-base-300/40 mt-2">
            {lowStock.length === 0 && <li className="text-xs sm:text-sm opacity-60 py-2">All good 👌</li>}
            {lowStock.map(p => (
              <li key={p._id} className="flex justify-between items-center py-2 text-xs sm:text-sm">
                <span className="truncate max-w-[65%]" title={p.name}>{p.name}</span>
                <span className="badge badge-warning badge-sm">{p.countInStock}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent orders */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden xl:col-span-2 md:col-span-2 relative" aria-labelledby="recent-orders-heading">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
         <div className="relative">
           <h2 id="recent-orders-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <span className="text-lg opacity-60">🧾</span> Recent Orders
           </h2>
          <div className="overflow-x-auto mt-2 rounded-md border border-base-300/40">
            <table className="table table-xs sm:table-sm">
              <caption className="sr-only">Most recent orders with status and payment info</caption>
              <thead><tr><th>Date</th><th>Status</th><th className="hidden sm:table-cell">Paid</th><th className="text-right">Total (₹)</th></tr></thead>
              <tbody>
                {recentOrders.map(o => {
                  const shortDate = new Date(o.createdAt).toLocaleString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={o._id}>
                      <td>{shortDate}</td>
                      <td className="capitalize truncate max-w-[120px]" title={o.status}>{o.status.replaceAll('_',' ')}</td>
                      <td className="hidden sm:table-cell">{o.isPaid ? 'Yes' : 'No'}</td>
                      <td className="text-right">{o.totalPrice.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* New users */}
      <section className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden relative" aria-labelledby="new-users-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <h2 id="new-users-heading" className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="text-lg opacity-60">🫂</span> New Users (7d)
          </h2>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight">{newUsers}</div>
          <div className="text-xs sm:text-sm opacity-70">Registered in the last week</div>
        </div>
      </section>
    </div>
  );
}
