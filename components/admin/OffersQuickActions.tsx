"use client";

import Link from 'next/link';
import React from 'react';
import { RefreshCw, ArrowUp, BarChart3, HelpCircle } from 'lucide-react';

export default function OffersQuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        type="button"
        className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-primary/10 hover:bg-white/60 hover:border-primary/20 transition-all group text-left"
        onClick={() => window.location.reload()}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:rotate-180 transition-transform duration-500">
          <RefreshCw size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Refresh Data</div>
          <div className="text-[9px] text-gray-400 font-medium">Synchronize latest offer records</div>
        </div>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-primary/10 hover:bg-white/60 hover:border-primary/20 transition-all group text-left"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:-translate-y-1 transition-transform">
          <ArrowUp size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Back to Top</div>
          <div className="text-[9px] text-gray-400 font-medium">Scroll to navigation summary</div>
        </div>
      </button>

      <Link 
        href="/admin/analytics"
        className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-primary/10 hover:bg-white/60 hover:border-primary/20 transition-all group text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
          <BarChart3 size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Analytics</div>
          <div className="text-[9px] text-gray-400 font-medium">Review campaign performance</div>
        </div>
      </Link>

      <button
        type="button"
        className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-primary/10 hover:bg-white/60 hover:border-primary/20 transition-all group text-left opacity-50"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
          <HelpCircle size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Archived Logic</div>
          <div className="text-[9px] text-gray-400 font-medium">Coming soon: Campaign history</div>
        </div>
      </button>
    </div>
  );
}
