'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

import AddressList from '@/components/profile/AddressList';
import CouponsList from '@/components/profile/CouponsList';
import OrdersList from '@/components/profile/OrdersList';
import Overview from '@/components/profile/Overview';
import Security from '@/components/profile/Security';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import ProfileForm from './Form';

type UserSummary = {
  _id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' as RequestCredentials });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error('Request failed');
    err.status = res.status;
    err.info = text;
    throw err;
  }
  return res.json();
};

export default function ProfileTabs() {
  const { data: session, update: updateSession } = useSession();
  const { data: user, error: userError } = useSWR<UserSummary>(
    '/api/auth/profile',
    fetcher,
    {
      shouldRetryOnError: (err: any) => err?.status !== 401,
      dedupingInterval: 5000,
    },
  );

  const [tab, setTab] = useState<'overview' | 'identity' | 'addresses' | 'loyalty' | 'coupons' | 'help'>(
    'overview',
  );

  const { data: addresses, mutate: mutateAddresses } = useSWR<any>(
    '/api/auth/profile/addresses',
    fetcher,
  );

  const TABS = [
    { id: 'overview', label: 'Sanctuary', icon: 'dashboard' },
    { id: 'identity', label: 'Cipher', icon: 'person' },
    { id: 'addresses', label: 'Logistics', icon: 'location_on' },
    { id: 'loyalty', label: 'Heritage', icon: 'auto_fix_high' },
    { id: 'coupons', label: 'Vault', icon: 'sell' },
    { id: 'help', label: 'Guidance', icon: 'help_center' },
  ];

  if (!user && !userError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-headline text-2xl text-primary italic animate-pulse">Sourcing your heritage records...</p>
      </div>
    );
  }

  if (userError && (userError as any).status === 401) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center bg-surface-container-low rounded-lg border border-outline-variant/10">
        <h2 className="font-headline text-4xl text-primary italic mb-6">Unauthorized Access</h2>
        <p className="text-secondary font-body mb-12 opacity-70 max-w-sm">
          Please establish your credentials to access the central identity archive.
        </p>
        <Link 
          href="/signin" 
          className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/20"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-6">warning</span>
        <h2 className="font-headline text-3xl text-primary italic mb-4">Archive Synchronization Failed</h2>
        <p className="text-secondary font-body mb-8 opacity-70 max-w-sm">
          We encountered an anomaly while sourcing your identity records. Please ensure your connection to the heritage network is stable.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary/5 text-primary border border-primary/20 px-8 py-4 rounded-lg font-bold tracking-widest uppercase text-[10px] hover:bg-primary hover:text-white transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      {/* Navigation Sub-header */}
      <div className="flex overflow-x-auto gap-8 border-b border-outline-variant/10 pb-6 mb-12 scrollbar-hide no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-2 whitespace-nowrap px-2 ${
              tab === t.id ? 'text-primary' : 'text-secondary opacity-40 hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'overview' && (
            <div className="w-full">
              <Overview
                user={user as any}
                onUpdateAvatar={async (url) => {
                  await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: url }) });
                  const { mutate } = await import('swr'); 
                  mutate('/api/auth/profile');
                }}
                onSaveAbout={async (payload) => {
                  const res = await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  if (!res.ok) throw new Error('Failed to update');
                  
                  // Update session to reflect changes in UI
                  await updateSession({
                    ...session,
                    user: { ...session?.user, ...payload }
                  });

                  const { mutate } = await import('swr'); 
                  mutate('/api/auth/profile');
                }}
              />
            </div>
          )}

          {tab === 'identity' && (
            <div className="max-w-4xl mx-auto">
              <ProfileForm />
            </div>
          )}

          {tab === 'addresses' && (
            <div className="max-w-5xl mx-auto space-y-12">
               <div className="mb-8">
                 <h2 className="font-headline text-4xl text-primary italic">Logistical Hub</h2>
                 <p className="text-secondary font-body text-sm opacity-60 mt-2">Manage your destination records for ritual fulfillment.</p>
               </div>
               <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
                 <AddressList addresses={addresses} reload={() => mutateAddresses()} />
               </div>
            </div>
          )}

          {tab === 'loyalty' && (
            <div className="max-w-5xl mx-auto">
               <LoyaltyDashboard />
            </div>
          )}

          {tab === 'coupons' && (
            <div className="max-w-5xl mx-auto space-y-8">
               <div className="mb-8 text-center">
                 <h2 className="font-headline text-4xl text-primary italic">Heritage Rewards</h2>
                 <p className="text-secondary font-body text-sm opacity-60 mt-2">Active blessings and ritual concessions available to you.</p>
               </div>
               <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 shadow-xl">
                 <CouponsList />
               </div>
            </div>
          )}

          {tab === 'help' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="font-headline text-4xl text-primary italic mb-8">Discourse & Support</h2>
                <div className="space-y-6">
                   <div className="p-8 bg-surface-container-low rounded border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4 text-primary">
                        <span className="material-symbols-outlined">mail</span>
                        <p className="font-label font-bold text-sm">ARCHIVE CONDUIT</p>
                      </div>
                      <p className="font-body text-sm text-on-surface">curators@aetheravia.com</p>
                      <p className="text-[10px] text-secondary opacity-50 mt-2 italic">Expect a response within 1 ritual cycle (24h).</p>
                   </div>
                   <div className="p-8 bg-surface-container-low rounded border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4 text-primary">
                        <span className="material-symbols-outlined">call</span>
                        <p className="font-label font-bold text-sm">DIRECT LINE</p>
                      </div>
                      <p className="font-body text-sm text-on-surface">+91-HERITAGE-01</p>
                      <p className="text-[10px] text-secondary opacity-50 mt-2 italic">Mon - Fri • 09:00 - 18:00 IST</p>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="font-headline text-2xl text-secondary italic mb-8">Inquiries</h2>
                <div className="space-y-4">
                  {[
                    { q: 'How do I update my cipher?', a: 'Visit the Identity tab to establish a new ritual password.' },
                    { q: 'Where are my manifests?', a: 'All acquisition records are stored in the Manifest Archive.' },
                    { q: 'How do I start a return?', a: 'Connect with our curators via the archive conduit above.' }
                  ].map((faq, i) => (
                    <div key={i} className="p-6 bg-surface-container-high/40 rounded border border-outline-variant/5">
                      <p className="font-label font-bold text-[10px] text-primary uppercase tracking-widest mb-2">{faq.q}</p>
                      <p className="font-body text-xs text-secondary leading-relaxed opacity-70">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
