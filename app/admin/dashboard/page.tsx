import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminDashboardPro from '@/components/admin/AdminDashboardPro';
import Dashboard from './Dashboard';
import { brandName } from '@/lib/brand';

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_BRAND_NAME || 'Aetheravia'} Admin Dashboard`,
  description: 'Comprehensive admin dashboard with business insights and quick actions'
};

const DashboardPage = () => {
  return (
    <div className="w-full px-3 sm:px-5 lg:px-8 py-6 space-y-14 max-w-[1600px] mx-auto" role="main" aria-label="Admin analytics dashboard">
      {/* Header */}
  <header className="space-y-3 pt-2 pb-4 max-w-4xl mx-auto w-full">
        <h1 className="font-bold tracking-tight text-2xl sm:text-4xl xl:text-5xl leading-tight">
          Welcome to {brandName} Admin
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 max-w-prose">
          Manage your e-commerce operations from this comprehensive dashboard.
        </p>
      </header>

      <section aria-labelledby="charts-heading" className="space-y-6" data-section>
        <div className="divider my-0">
          <span id="charts-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">📈 Charts & Reports</span>
        </div>
        <Dashboard />
      </section>

      <section aria-labelledby="core-metrics-heading" className="space-y-6" data-section>
        <div className="divider my-0">
          <span id="core-metrics-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">🧩 Core Metrics</span>
        </div>
        <AdminDashboard />
      </section>

      <section aria-labelledby="detailed-analytics-heading" className="space-y-6" data-section>
        <div className="divider my-0">
          <span id="detailed-analytics-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">📊 Detailed Analytics</span>
        </div>
        <AdminDashboardPro />
      </section>

      {/* Summary Section */}
      <section aria-labelledby="summary-heading" className="pb-10" data-section>
        <div className="card bg-base-100 shadow border border-base-300/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/10 pointer-events-none" aria-hidden="true" />
          <div className="card-body relative">
            <h3 id="summary-heading" className="card-title text-primary flex items-center gap-2">🎯 Performance Summary</h3>
            <p className="text-base-content/70 text-xs sm:text-sm mb-4 max-w-prose">
              Your store is performing well! Here&apos;s a quick overview of your key operational health indicators.
            </p>
            <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              <div className="stat bg-success/10 rounded-lg p-4">
                <div className="stat-title text-success">System Status</div>
                <div className="stat-value text-success text-xl sm:text-2xl">✅ Healthy</div>
                <div className="stat-desc text-[10px] sm:text-xs">All systems operational</div>
              </div>
              <div className="stat bg-info/10 rounded-lg p-4">
                <div className="stat-title text-info">Data Freshness</div>
                <div className="stat-value text-info text-xl sm:text-2xl">🔄 Live</div>
                <div className="stat-desc text-[10px] sm:text-xs">Real-time updates</div>
              </div>
              <div className="stat bg-warning/10 rounded-lg p-4">
                <div className="stat-title text-warning">Next Action</div>
                <div className="stat-value text-warning text-xl sm:text-2xl">📋 Review</div>
                <div className="stat-desc text-[10px] sm:text-xs">Check pending orders</div>
              </div>
              <div className="stat bg-secondary/10 rounded-lg p-4 hidden xl:block">
                <div className="stat-title text-secondary">Security</div>
                <div className="stat-value text-secondary text-xl sm:text-2xl">🔐 OK</div>
                <div className="stat-desc text-[10px] sm:text-xs">No alerts</div>
              </div>
              <div className="stat bg-accent/10 rounded-lg p-4 hidden md:block">
                <div className="stat-title text-accent">Loyalty</div>
                <div className="stat-value text-accent text-xl sm:text-2xl">⭐ Active</div>
                <div className="stat-desc text-[10px] sm:text-xs">High engagement</div>
              </div>
              <div className="stat bg-primary/10 rounded-lg p-4 hidden md:block">
                <div className="stat-title text-primary">Referrals</div>
                <div className="stat-value text-primary text-xl sm:text-2xl">🔗 Growing</div>
                <div className="stat-desc text-[10px] sm:text-xs">Steady inflow</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
