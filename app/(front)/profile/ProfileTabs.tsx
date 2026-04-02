'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import AddressList from '@/components/profile/AddressList';
import CouponsList from '@/components/profile/CouponsList';
import OrdersList from '@/components/profile/OrdersList';
import Overview from '@/components/profile/Overview';
import Security from '@/components/profile/Security';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';

type UserSummary = {
  _id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

// Orders functionality temporarily removed to avoid API errors

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
  const { data: user, error: userError } = useSWR<UserSummary>(
    '/api/auth/profile',
    fetcher,
    {
      shouldRetryOnError: (err: any) => err?.status !== 401,
      dedupingInterval: 5000,
    },
  );
  const [tab, setTab] = useState<'overview' | 'addresses' | 'orders' | 'coupons' | 'loyalty' | 'security' | 'help'>(
    'overview',
  );
  const { data: addresses, mutate: mutateAddresses } = useSWR<any>(
    '/api/auth/profile/addresses',
    fetcher,
  );
  const { data: coupons, mutate: mutateCoupons } = useSWR<string[]>(
    '/api/auth/profile/coupons',
    fetcher,
  );

  useEffect(() => {
    // no-op placeholder for future deep-link handling
  }, []);

  return (
    <div className='mx-auto my-4 sm:my-6 max-w-5xl px-4 sm:px-6'>
      {userError && (userError as any).status === 401 && (
        <div className='card bg-base-300 mb-4'>
          <div className='card-body'>
            <h2 className='card-title'>Please sign in</h2>
            <p className='opacity-80'>You need to be authenticated to view your profile.</p>
            <Link className='inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-all text-sm mt-2 w-fit' href='/signin'>Go to Sign In</Link>
          </div>
        </div>
      )}
      <h1 className='mb-4 text-xl sm:text-2xl font-semibold'>My Profile</h1>
      <div className='tabs tabs-boxed mb-6 bg-base-300 overflow-x-auto flex-nowrap' role='tablist' aria-label='Profile sections'>
        <button role='tab' aria-selected={tab==='overview'} className={`tab whitespace-nowrap ${tab === 'overview' ? 'tab-active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button role='tab' aria-selected={tab==='addresses'} className={`tab whitespace-nowrap ${tab === 'addresses' ? 'tab-active' : ''}`} onClick={() => setTab('addresses')}>Addresses</button>
        <button role='tab' aria-selected={tab==='orders'} className={`tab whitespace-nowrap ${tab === 'orders' ? 'tab-active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button role='tab' aria-selected={tab==='coupons'} className={`tab whitespace-nowrap ${tab === 'coupons' ? 'tab-active' : ''}`} onClick={() => setTab('coupons')}>Coupons</button>
        <button role='tab' aria-selected={tab==='loyalty'} className={`tab whitespace-nowrap ${tab === 'loyalty' ? 'tab-active' : ''}`} onClick={() => setTab('loyalty')}>Loyalty</button>
        <button role='tab' aria-selected={tab==='security'} className={`tab whitespace-nowrap ${tab === 'security' ? 'tab-active' : ''}`} onClick={() => setTab('security')}>Security</button>
        <button role='tab' aria-selected={tab==='help'} className={`tab whitespace-nowrap ${tab === 'help' ? 'tab-active' : ''}`} onClick={() => setTab('help')}>Help</button>
      </div>

      {tab === 'overview' && (
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <Overview
              user={user as any}
              onUpdateAvatar={async (url) => {
                await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: url }) });
                // refresh user data
                await (async () => { const { mutate } = await import('swr'); mutate('/api/auth/profile'); })();
              }}
              onSaveAbout={async (payload) => {
                const res = await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) {
                  const txt = await res.text();
                  throw new Error(txt || 'Failed to update');
                }
                await (async () => { const { mutate } = await import('swr'); mutate('/api/auth/profile'); })();
              }}
            />
          </div>
          <div className='card bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Need Help?</h2>
              <p className='text-sm opacity-80'>Visit our help section for FAQs, account support, and contact information.</p>
              <button className='btn btn-sm mt-3' onClick={() => setTab('help')}>Get Support</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'addresses' && (
        <div className='card bg-base-300'>
          <div className='card-body'>
            <h2 className='card-title'>Addresses</h2>
            <AddressList addresses={addresses} reload={() => mutateAddresses()} />
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className='card bg-base-300'>
          <div className='card-body'>
            <h2 className='card-title'>Orders</h2>
            <OrdersList />
          </div>
        </div>
      )}

      {tab === 'coupons' && (
        <div className='card bg-base-300'>
          <div className='card-body'>
            <h2 className='card-title'>Coupons</h2>
            <CouponsList />
          </div>
        </div>
      )}

      {tab === 'loyalty' && (
        <div>
          <LoyaltyDashboard />
        </div>
      )}

      {tab === 'security' && (
        <div className='card bg-base-300'>
          <div className='card-body'>
            <Security />
          </div>
        </div>
      )}

      


      {/* Orders tab content removed */}

      {tab === 'help' && (
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='card bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Frequently Asked Questions</h2>
              <div className='space-y-3 text-sm'>
                <details className='collapse collapse-arrow bg-base-200'>
                  <summary className='collapse-title font-medium'>How do I update my password?</summary>
                  <div className='collapse-content'>
                    <p>Go to Security tab and enter your new password twice to confirm.</p>
                  </div>
                </details>
                <details className='collapse collapse-arrow bg-base-200'>
                  <summary className='collapse-title font-medium'>Where can I track my order?</summary>
                  <div className='collapse-content'>
                    <p>Visit the Orders tab to see all your order history and tracking information.</p>
                  </div>
                </details>
                <details className='collapse collapse-arrow bg-base-200'>
                  <summary className='collapse-title font-medium'>How do I start a return?</summary>
                  <div className='collapse-content'>
                    <p>Contact our support team using the information in the Contact Support section.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
          <div className='card bg-base-300'>
            <div className='card-body'>
              <h2 className='card-title'>Contact Support</h2>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content'>📧</div>
                  <div>
                    <div className='font-medium'>Email Support</div>
                    <div className='text-sm opacity-80'>hello@bellamoda.com</div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-content'>📞</div>
                  <div>
                    <div className='font-medium'>Phone Support</div>
                    <div className='text-sm opacity-80'>{process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-XXXX-XXXXXX'}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-content'>⏰</div>
                  <div>
                    <div className='font-medium'>Support Hours</div>
                    <div className='text-sm opacity-80'>Mon-Fri: 9AM-6PM IST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
