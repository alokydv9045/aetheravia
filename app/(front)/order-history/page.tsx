import { Metadata } from 'next';
import React from 'react';
import MyOrders from './MyOrders';

export const metadata: Metadata = {
  title: 'Manifest Archive | Order History',
  description: 'Chronicles of your artisanal heritage acquisitions.',
};

const MyOrderPage = () => {
  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 pt-24">
        <div className="mb-16 text-center md:text-left">
           <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-4">Historical Archives</p>
           <h1 className="font-headline text-5xl md:text-7xl text-on-surface italic mb-6">Your Manifests</h1>
           <p className="text-secondary font-body max-w-2xl opacity-70 leading-relaxed">
             A complete chronicle of your ritual acquisitions and logistical transitions. 
             Every record represents a unique step in your heritage journey.
           </p>
        </div>
        
        <MyOrders />
      </div>
    </div>
  );
};

export default MyOrderPage;
