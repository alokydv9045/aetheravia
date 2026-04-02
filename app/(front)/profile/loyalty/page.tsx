import React, { Suspense } from 'react';
import LoyaltyDetails from '@/components/profile/LoyaltyDetails';

export const metadata = {
  title: 'Loyalty Program | BellaModa',
};

const LoyaltyPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Loyalty Program</h1>
      <Suspense fallback={<div>Loading loyalty details...</div>}>
        <LoyaltyDetails />
      </Suspense>
    </div>
  );
};

export default LoyaltyPage;
