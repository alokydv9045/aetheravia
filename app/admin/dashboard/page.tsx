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
      {/* Header - Authentic Branding */}
      <header className="space-y-6 pt-10 pb-12 max-w-4xl mx-auto w-full text-center">
        <h1 className="font-headline font-bold tracking-tight text-4xl sm:text-6xl xl:text-7xl text-primary leading-tight">
          Heritage Archive Hub
        </h1>
        <div className="flex items-center justify-center gap-6">
           <div className="h-[1px] w-16 bg-primary/20"></div>
           <p className="text-[11px] font-label font-bold text-gray-300 uppercase tracking-[0.5em]">
              Official {brandName} Sentinel Suite
           </p>
           <div className="h-[1px] w-16 bg-primary/20"></div>
        </div>
      </header>

      <section aria-labelledby="charts-heading" className="space-y-6" data-section>
        <div className="flex items-center gap-8 opacity-20">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary"></div>
          <span id="charts-heading" className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.6em] flex items-center gap-2 whitespace-nowrap">
            <span className="text-xl">📈</span> Vital Reports
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary"></div>
        </div>
        <Dashboard />
      </section>

      <section aria-labelledby="core-metrics-heading" className="space-y-6" data-section>
        <div className="flex items-center gap-8 opacity-20">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary"></div>
          <span id="core-metrics-heading" className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.6em] flex items-center gap-2 whitespace-nowrap">
             <span className="text-xl">🧩</span> Core Metrics
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary"></div>
        </div>
        <AdminDashboard />
      </section>

      <section aria-labelledby="detailed-analytics-heading" className="space-y-6" data-section>
        <div className="flex items-center gap-8 opacity-20">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary"></div>
          <span id="detailed-analytics-heading" className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.6em] flex items-center gap-2 whitespace-nowrap">
            <span className="text-xl">📊</span> Detailed Analytics
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary"></div>
        </div>
        <AdminDashboardPro />
      </section>

      {/* Summary Section - Glass Panel */}
      <section aria-labelledby="summary-heading" className="pb-24 pt-10" data-section>
        <div className="p-10 bg-white/50 backdrop-blur-2xl border border-primary/10 rounded-[4rem] shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-stone-500/5 pointer-events-none" aria-hidden="true" />
          <div className="relative">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                   <h3 id="summary-heading" className="text-[11px] font-label font-bold text-gray-300 uppercase tracking-[0.5em]">Integrity Check</h3>
                   <h2 className="font-headline text-4xl text-primary">Performance Summary</h2>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm max-w-md italic leading-relaxed">
                  Your artisan archive is maintaining optimal synchronization across all high-level operational vectors. 
                </p>
             </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              <div className="flex flex-col p-6 bg-green-500/5 border border-green-500/10 rounded-3xl">
                <div className="text-[10px] font-label font-bold text-green-700/50 uppercase tracking-widest mb-1">State</div>
                <div className="text-sm font-bold text-green-700">Healthy</div>
              </div>
              <div className="flex flex-col p-6 bg-stone-500/5 border border-stone-500/10 rounded-3xl text-stone-600">
                <div className="text-[10px] font-label font-bold uppercase tracking-widest mb-1 opacity-40">Sync</div>
                <div className="text-sm font-bold opacity-70">Real-time</div>
              </div>
              <div className="flex flex-col p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                <div className="text-[10px] font-label font-bold text-primary/30 uppercase tracking-widest mb-1">Priority</div>
                <div className="text-sm font-bold text-primary">Review Ready</div>
              </div>
              <div className="flex flex-col p-6 bg-stone-500/5 border border-stone-500/10 rounded-3xl hidden xl:flex text-stone-600">
                <div className="text-[10px] font-label font-bold uppercase tracking-widest mb-1 opacity-40">Vault</div>
                <div className="text-sm font-bold opacity-70">Secured</div>
              </div>
              <div className="flex flex-col p-6 bg-stone-500/5 border border-stone-500/10 rounded-3xl hidden md:flex text-stone-600">
                <div className="text-[10px] font-label font-bold uppercase tracking-widest mb-1 opacity-40">Flow</div>
                <div className="text-sm font-bold opacity-70">Optimized</div>
              </div>
              <div className="flex flex-col p-6 bg-primary/5 border border-primary/10 rounded-3xl hidden md:flex text-primary">
                <div className="text-[10px] font-label font-bold uppercase tracking-widest mb-1 opacity-40">Stamina</div>
                <div className="text-sm font-bold opacity-70">High</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
