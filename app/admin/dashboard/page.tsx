import Dashboard from './Dashboard';
import { brandName } from '@/lib/brand';

export const metadata = {
  title: `Artisanal Archive | ${brandName} Admin`,
  description: 'Real-time pulse of the heritage archive. Performance metrics across sales, fulfillment, and engagement.'
};

const DashboardPage = () => {
  return (
    <div className="w-full space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block">Store Admin</span>
          <h3 className="text-5xl md:text-6xl font-headline tracking-tight text-on-surface italic font-bold">Sales Overview</h3>
          <p className="text-on-surface-variant mt-4 max-w-md font-body leading-relaxed opacity-70">
            Real-time tracking of your store's sales, orders, and customer activity.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low px-5 py-3 rounded-xl border border-outline-variant/10 flex items-center gap-3 text-xs font-bold text-secondary uppercase tracking-widest shadow-sm">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            <span>Last 30 Days</span>
          </div>
        </div>
      </div>

      {/* The Dashboard Engine */}
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
