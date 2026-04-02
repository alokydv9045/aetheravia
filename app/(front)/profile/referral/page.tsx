import React, { Suspense } from 'react';
import ReferralDetails from '@/components/profile/ReferralDetails';

export const metadata = {
  title: 'Referral Program | BellaModa',
};

const ReferralPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Referral Program</h1>
      <Suspense fallback={<div>Loading referral details...</div>}>
        <ReferralDetails />
      </Suspense>
    </div>
  );
};

export default ReferralPage;
