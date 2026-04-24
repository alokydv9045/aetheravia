"use client";
import useSWR from "swr";
import Link from "next/link";
import { useMemo } from "react";
import { 
  TrendingUp, 
  Target, 
  Share2, 
  BarChart3, 
  Calendar, 
  Package, 
  AlertTriangle, 
  Trophy, 
  FileText,
  LucideIcon
} from "lucide-react";

// Primary stats endpoint shape
interface DashboardStats {
  totalUsers: number;
  activeOffers: number;
  totalCoupons: number;
  activeCoupons: number;
  totalOrders: number;
  totalRevenue: number;
  loyaltyUsers: number;
  referralCount: number;
}

// Extended metrics endpoint (optional + defensive)
interface ExtendedMetrics {
  salesByDay: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ _id: string; name: string; qty: number; revenue: number }>;
  lowStock: Array<{ _id: string; name: string; countInStock: number }>;
  recentOrders: Array<{ _id: string; totalPrice: number; status: string; createdAt: string; isPaid: boolean }>;
  ordersByStatus: Record<string, number>;
  newUsers?: number;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error("Failed fetch " + url);
  return r.json();
});

export default function AdminDashboard() {
  // Base stats (fast, lightweight)
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR<DashboardStats>("/api/admin/dashboard/stats", fetcher, { refreshInterval: 60_000 });
  // Extended metrics (lazy; only run after stats present)
  const { data: ext, error: extError } = useSWR<ExtendedMetrics>(stats ? "/api/admin/dashboard/metrics" : null, fetcher, { refreshInterval: 120_000 });

  const safeStats = stats ?? { totalUsers:0, activeOffers:0, totalCoupons:0, activeCoupons:0, totalOrders:0, totalRevenue:0, loyaltyUsers:0, referralCount:0 };
  const avgOrderValueTemp = safeStats.totalOrders > 0 ? Math.round(safeStats.totalRevenue / safeStats.totalOrders) : 0;
  
  const keyPerformance = useMemo(() => ([
    { key: 'aov', title: 'Average Order Value', icon: TrendingUp, color: 'text-primary', value: avgOrderValueTemp ? `₹${avgOrderValueTemp.toLocaleString('en-IN')}` : '—', desc: 'Efficiency measure' },
    { key: 'engagement', title: 'Loyalty Engagement', icon: Target, color: 'text-[#C5A059]', value: safeStats.totalUsers ? `${Math.round((safeStats.loyaltyUsers / safeStats.totalUsers) * 100)}%` : '0%', desc: 'Brand affinity' },
    { key: 'referrals', title: 'Referral Pipeline', icon: Share2, color: 'text-[#2D4B3C]', value: safeStats.totalUsers ? `${Math.round((safeStats.referralCount / safeStats.totalUsers) * 100)}%` : '0%', desc: 'Organic growth' }
  ]), [avgOrderValueTemp, safeStats.loyaltyUsers, safeStats.totalUsers, safeStats.referralCount]);


  /* ================= Skeleton / Error States ================= */
  if (statsLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-8 w-full">
        <HeaderSkeleton />
        <SectionShell title="Performance Metrics" description="Loading data...">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-soft animate-pulse p-4 w-full">
                <div className="h-3 w-2/3 bg-muted rounded mb-3" />
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-3 mt-3 w-1/3 bg-muted/70 rounded" />
              </div>
            ))}
          </div>
        </SectionShell>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-soft animate-pulse p-5">
              <div className="h-4 w-1/2 bg-muted rounded mb-4" />
              <div className="h-6 w-1/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="p-4 sm:p-6 w-full">
        <div className="card-soft p-4 border border-error/30 text-error bg-error/10">
          Failed to load dashboard statistics.
        </div>
      </div>
    );
  }

  /* ================= Derived Values ================= */
  // (Derived values previously calculated but not used have been removed for cleanliness)

  const dailyTotals = ext?.salesByDay ?? [];
  const totalRevenue14 = dailyTotals.reduce((s, d) => s + d.revenue, 0);
  const totalOrders14 = dailyTotals.reduce((s, d) => s + d.orders, 0);

  const topProducts = ext?.topProducts ?? [];
  const lowStock = ext?.lowStock ?? [];
  const recentOrders = ext?.recentOrders ?? [];
  const ordersByStatus = ext?.ordersByStatus ?? {};


  const secondaryStats = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString('en-IN'), tone: 'primary' },
    { label: 'Order Volume', value: stats.totalOrders.toLocaleString('en-IN'), tone: 'primary' },
    { label: 'Gross Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, tone: 'primary' },
    { label: 'Active Offers', value: stats.activeOffers.toString(), tone: 'primary' },
    { label: 'Coupon Ratio', value: `${stats.activeCoupons}/${stats.totalCoupons}`, tone: 'primary' },
  ];

  /* ================= Render ================= */
  return (
  <div className="p-4 sm:p-6 space-y-12 w-full max-w-[1600px] mx-auto" data-dashboard-root>
      <Header stats={stats} />

      {/* Key Performance */}
      <SectionShell id="performance" title="Performance Metrics" description="Core commerce efficiency indicators" icon={BarChart3}>
        <HorizontalMetricScroller metrics={keyPerformance} />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mt-6">
          {secondaryStats.map(s => (
            <div key={s.label} className="bg-white/40 backdrop-blur-md border border-primary/5 shadow-sm rounded-2xl p-4 transition-all hover:bg-white/70 text-center group">
              <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1 group-hover:text-primary/40 transition-colors">{s.label}</div>
              <div className="text-lg font-bold text-primary">{s.value}</div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Sales & Orders (extended) */}
      <SectionShell id="sales" title="Recent Sales Window" description="Last 14 days order & revenue distribution" icon={Calendar} loading={!ext && !extError}>
        {dailyTotals.length === 0 ? (
          <EmptyState message={extError ? 'Failed to load sales data' : 'No recent sales data'} />
        ) : (
          <>
            {/* Table (>=sm) */}
            <div className="overflow-x-auto rounded-lg border border-base-300/50 hidden sm:block">
              <table className="table table-xs sm:table-sm text-xs sm:text-sm">
                <caption className="sr-only">Daily revenue and order counts for the last 14 days</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-right">Revenue (₹)</th>
                    <th className="text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTotals.map(d => (
                    <tr key={d.date}>
                      <td className="whitespace-nowrap">{d.date}</td>
                      <td className="text-right">{d.revenue.toLocaleString('en-IN')}</td>
                      <td className="text-right">{d.orders}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td>Total (14d)</td>
                    <td className="text-right">{totalRevenue14.toLocaleString('en-IN')}</td>
                    <td className="text-right">{totalOrders14}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Mobile cards (<sm) */}
            <ul className="sm:hidden grid gap-3" aria-label="Daily revenue & orders (last 14 days)">
              {dailyTotals.map(d => (
                <li key={d.date} className="p-3 rounded-lg border border-base-300/60 bg-base-100 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-medium">{d.date}</div>
                    <div className="flex gap-3 opacity-70">
                      <span>₹{d.revenue.toLocaleString('en-IN')}</span>
                      <span>{d.orders} orders</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] opacity-60">
                    {(Math.round((d.revenue / (totalRevenue14||1))*100))}%
                  </div>
                </li>
              ))}
              <li className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-[11px] font-semibold">
                <span>Total (14d)</span>
                <span className="space-x-2"><span>₹{totalRevenue14.toLocaleString('en-IN')}</span><span>{totalOrders14} orders</span></span>
              </li>
            </ul>
          </>
        )}
      </SectionShell>

      {/* Orders by Status / Low Stock / Top Products */}
  <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-3" data-late-grid>
        <SectionShell id="orders-status" title="Orders by Status" description="Current distribution" icon={Package} className="lg:col-span-1" loading={!ext && !extError}>
          {Object.keys(ordersByStatus).length === 0 ? <EmptyState message="No status data" /> : (
            <ul className="space-y-2 text-xs sm:text-sm">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between bg-base-100/60 rounded px-2 py-1">
                  <span className="capitalize truncate max-w-[60%]" title={status}>{status.replaceAll('_',' ')}</span>
                  <span className="badge badge-sm">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionShell>
        <SectionShell id="low-stock" title="Low Stock" description="Items at or below threshold" icon={AlertTriangle} className="lg:col-span-1" loading={!ext && !extError}>
          {lowStock.length === 0 ? <EmptyState message="Inventory healthy" /> : (
            <ul className="divide-y divide-base-300 text-sm">
              {lowStock.map(p => (
                <li key={p._id} className="flex items-center justify-between py-2">
                  <span className="truncate max-w-[65%]" title={p.name}>{p.name}</span>
                  <span className={"badge badge-sm " + (p.countInStock <= 2 ? 'badge-error' : 'badge-warning')}>{p.countInStock}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionShell>
        <SectionShell id="top-products" title="Top Products" description="Best performers (30d)" icon={Trophy} className="lg:col-span-1" loading={!ext && !extError}>
          {topProducts.length === 0 ? <EmptyState message="No product data" /> : (
            <>
              <div className="overflow-x-auto hidden sm:block">
                <table className="table table-xs sm:table-sm">
                  <caption className="sr-only">Top products ranked by quantity and revenue in last 30 days</caption>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Revenue (₹)</th>
                    </tr>
                  </thead>
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
              <ul className="sm:hidden space-y-3" aria-label="Top products (30 days)">
                {topProducts.map(p => (
                  <li key={p._id} className="p-3 rounded-lg border border-base-300/60 bg-base-100 text-xs flex items-center justify-between gap-3">
                    <span className="truncate font-medium" title={p.name}>{p.name}</span>
                    <span className="flex items-center gap-3 text-[11px] opacity-70"><span>{p.qty}x</span><span>₹{p.revenue.toLocaleString('en-IN')}</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionShell>
      </div>

      {/* Recent Orders */}
      <SectionShell id="recent-orders" title="Recent Orders" description="Latest activity feed" icon={FileText} loading={!ext && !extError}>
        {recentOrders.length === 0 ? <EmptyState message="No recent orders" /> : (
          <>
            <div className="overflow-x-auto rounded-lg border border-base-300/50 hidden sm:block">
              <table className="table table-xs sm:table-sm">
                <caption className="sr-only">Recent orders with status, payment and total amount</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="hidden xs:table-cell">Paid</th>
                    <th className="text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 12).map(o => (
                    <tr key={o._id}>
                      <td className="whitespace-nowrap">{new Date(o.createdAt).toLocaleString(undefined,{ year:'2-digit', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
                      <td className="capitalize truncate max-w-[120px]" title={o.status}>{o.status.replaceAll('_',' ')}</td>
                      <td className="hidden xs:table-cell">{o.isPaid ? 'Yes' : 'No'}</td>
                      <td className="text-right">{o.totalPrice.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="sm:hidden space-y-3" aria-label="Recent orders list">
              {recentOrders.slice(0, 12).map(o => {
                const shortDate = new Date(o.createdAt).toLocaleString(undefined,{ year:'2-digit', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
                return (
                  <li key={o._id} className="p-3 rounded-lg border border-base-300/60 bg-base-100 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                      <span className="badge badge-xs capitalize" title={o.status}>{o.status.replaceAll('_',' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] opacity-70">
                      <span>{shortDate}</span>
                      <span>{o.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </SectionShell>

    </div>
  );
}

/* ================= Supporting Components ================= */

function Header({ stats }: { stats: DashboardStats }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Dashboard header">
      <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-2" aria-live="polite">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
          Live snapshot
        </span>
        <span aria-label="Last updated timestamp">• {new Date().toLocaleString()}</span>
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="h-8 w-40 bg-muted rounded" />
      <div className="h-4 w-52 bg-muted rounded" />
    </div>
  );
}

interface SectionShellProps {
  id?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
}
function SectionShell({ id, title, description, icon: Icon, className = '', loading, children }: SectionShellProps) {
  return (
    <section id={id} aria-labelledby={id ? id + '-title' : undefined} className={"space-y-4 " + className}>
      <div className="flex flex-col xs:flex-row xs:items-end xs:justify-between gap-2">
        <h2 id={id ? id + '-title' : undefined} className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em] flex items-center gap-2">
          {Icon && <Icon size={18} className="opacity-60" aria-hidden="true" />} {title}
        </h2>
        {description && <p className="text-[9px] font-label font-bold text-primary/20 uppercase tracking-wider line-clamp-1">{description}</p>}
      </div>
      <div className="p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        <div className="relative">
          {loading ? <InlineLoader /> : children}
        </div>
      </div>
    </section>
  );
}

function InlineLoader() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-soft animate-pulse p-4 w-full">
          <div className="h-3 w-2/3 bg-muted rounded mb-3" />
          <div className="h-6 w-1/2 bg-muted rounded" />
          <div className="h-3 mt-3 w-1/3 bg-muted/70 rounded" />
        </div>
      ))}
    </div>
  );
}

interface HMProps { metrics: Array<{ key: string; title: string; icon: LucideIcon; color: string; value: string; desc: string }>; }
function HorizontalMetricScroller({ metrics }: HMProps) {
  return (
    <div className="relative group">
      <div
        className="-mx-2 px-2 overflow-x-auto md:overflow-visible scroll-px-4 flex gap-3 md:grid md:grid-cols-3 md:gap-4 snap-x snap-mandatory md:snap-none pb-3 hide-scrollbar motion-safe:scroll-smooth"
        role="list" aria-label="Key performance metrics"
      >
        {metrics.map(m => (
          <div
            key={m.key}
            role="listitem"
            className="group min-w-[78%] xs:min-w-[240px] sm:min-w-[220px] md:min-w-0 snap-start md:snap-none p-6 flex flex-col justify-between bg-white/60 backdrop-blur-md border border-primary/10 rounded-3xl shadow-sm hover:shadow-md transition-all hover:bg-white/80"
            tabIndex={0}
          >
            <div className="flex items-start justify-between mb-4 gap-2">
              <span className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest leading-none group-hover:text-primary/40 transition-colors">{m.title}</span>
              <m.icon size={24} className={`${m.color} transition-transform group-hover:scale-110`} aria-hidden="true" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-primary">{m.value}</div>
            <p className="text-[9px] font-medium text-gray-300 mt-3 uppercase tracking-tight line-clamp-1">{m.desc}</p>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-base-100 to-transparent md:hidden" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-base-100 to-transparent md:hidden" aria-hidden="true" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-xs sm:text-sm opacity-60 italic py-4">{message}</div>;
}

interface QuickLinkProps { href: string; label: string; icon: string; tone?: string; }
function QuickLink({ href, label, icon, tone = 'primary' }: QuickLinkProps) {
  return (
    <Link href={href} className={`btn btn-${tone} btn-sm normal-case flex items-center gap-1`}>{icon}<span className="hidden xs:inline">{label}</span></Link>
  );
}