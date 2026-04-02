"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' as RequestCredentials });
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
};

export default function CouponsList() {
  const { data: coupons, mutate } = useSWR<string[]>("/api/auth/profile/coupons", fetcher);
  const [code, setCode] = useState("");
  return (
    <div className="space-y-4">
      <div className='flex flex-col sm:flex-row gap-3' role='form' aria-label='Coupons form'>
        <input className='input input-bordered flex-1 transition focus:outline-none focus:ring-2 focus:ring-primary/30' placeholder='Enter coupon code (e.g., SAVE10)' value={code} onChange={(e) => setCode(e.target.value)} />
        <button className='btn btn-primary transition hover:brightness-110 sm:btn-md' onClick={async () => {
          const c = code.trim();
          if (!c) return;
          await fetch('/api/auth/profile/coupons', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c }) });
          setCode('');
          mutate();
        }}>Save Coupon</button>
      </div>
      {!coupons && <p className='opacity-70'>Loading coupons...</p>}
      {coupons && coupons.length === 0 && (
        <div className='text-center py-8'>
          <div className='text-4xl mb-2'>🎫</div>
          <p className='opacity-70'>No saved coupons yet.</p>
          <p className='text-sm opacity-60 mt-1'>Add coupon codes above to save them for later use.</p>
        </div>
      )}
      {coupons && coupons.length > 0 && (
        <div>
          <h3 className='font-medium mb-3'>Your Saved Coupons ({coupons.length})</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3' role='list'>
            {coupons.map((c) => (
              <div key={c} className='card bg-base-200 p-3 transition hover:shadow-md' role='listitem'>
                <div className='flex items-center justify-between'>
                  <div className='font-mono font-bold text-primary text-lg'>{c}</div>
                  <button className='btn btn-xs btn-ghost hover:btn-error' aria-label={`Remove coupon ${c}`} onClick={async () => {
                    await fetch(`/api/auth/profile/coupons?code=${encodeURIComponent(c)}`, { method: 'DELETE', credentials: 'include' });
                    mutate();
                  }}>✕</button>
                </div>
                <div className='text-xs opacity-70 mt-1'>Tap to copy: {c}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
