'use client';

import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6">
        {/* Aesthetic Logo / Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 animate-pulse flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-bounce">potted_plant</span>
          </div>
          {/* Subtle spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-2xl border-t-2 border-primary animate-spin"></div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="font-headline text-xl text-primary italic animate-reveal">Preparing Sanctuary</h2>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary/40">Synchronizing Ritual Archive</p>
        </div>
      </div>

      <style jsx>{`
        .animate-reveal {
          animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
