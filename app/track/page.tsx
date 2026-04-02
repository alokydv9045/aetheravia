"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrackEntryPage() {
  const router = useRouter();
  const [awb, setAwb] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = awb.trim();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Track your shipment</h1>
      <p className="text-sm opacity-70 mb-6">Enter your AWB/Tracking ID to see the latest status.</p>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl">
        <input
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          placeholder="Enter AWB/Tracking ID"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary">Track</button>
      </form>

      <div className="mt-4 text-sm">
        Or check status via <Link href="/order-history" className="link link-primary">Order History</Link>
      </div>
    </main>
  );
}
