
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import OffersQuickActions from '@/components/admin/OffersQuickActions';

export const metadata: Metadata = {
  title: 'Offers Management | Admin',
  description: 'Create, edit and schedule promotional offers, banners, popups and flash sales.'
};

const OffersAdminTable = dynamic(() => import('@/components/admin/OffersAdminTable'), { ssr: false });

export default function AdminOffersPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-12" role="main" aria-label="Offers management dashboard">
      {/* Header */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2 max-w-prose">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Offers Management</h1>
          <p className="text-xs sm:text-sm text-base-content/70">Create and orchestrate dynamic promotions, flash sales, announcement banners and engagement popups.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/analytics" className="btn btn-outline btn-sm">View Analytics</Link>
          <Link href="#offer-form" className="btn btn-primary btn-sm">Add New Offer</Link>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 xl:col-span-2">
          <section aria-labelledby="offers-active-heading" className="card bg-base-100 shadow-sm">
            <div className="card-body p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 id="offers-active-heading" className="card-title text-sm sm:text-base">Active / Scheduled Offers</h2>
                <span className="text-[10px] sm:text-xs opacity-60">Edit inline or create new</span>
              </div>
              <OffersAdminTable />
            </div>
          </section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-8">
          <section aria-labelledby="offers-tips-heading" className="card bg-base-100 shadow-sm">
            <div className="card-body p-5 space-y-4 text-sm">
              <h3 id="offers-tips-heading" className="card-title text-sm">Tips & Best Practices</h3>
              <ul className="list-disc ml-4 space-y-2 text-xs leading-relaxed">
                <li>Use higher priority for time-sensitive flash sales.</li>
                <li>Limit overlapping popups to reduce user fatigue.</li>
                <li>Always set end dates for temporary promotions.</li>
                <li>Include compelling alt text for banner images.</li>
              </ul>
            </div>
          </section>
          <section aria-labelledby="offers-types-heading" className="card bg-base-100 shadow-sm">
            <div className="card-body p-5 space-y-4 text-sm">
              <h3 id="offers-types-heading" className="card-title text-sm">Offer Types</h3>
              <div className="space-y-3 text-xs">
                <div><span className="font-semibold">Popup:</span> High visibility modal for announcements or discount capture.</div>
                <div><span className="font-semibold">Banner:</span> Persistent header / inline element for site-wide messaging.</div>
                <div><span className="font-semibold">Flash Sale:</span> Time-bound promotional pricing with urgency.</div>
              </div>
            </div>
          </section>
          <section aria-labelledby="offers-quick-heading" className="card bg-base-100 shadow-sm">
            <div className="card-body p-5 space-y-4 text-sm">
              <h3 id="offers-quick-heading" className="card-title text-sm">Quick Actions</h3>
              <OffersQuickActions />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
