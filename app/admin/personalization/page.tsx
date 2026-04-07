'use client';

import dynamic from 'next/dynamic';


const PersonalizationAdminTable = dynamic(() => import('@/components/admin/PersonalizationAdminTable'), { ssr: false });

export default function AdminPersonalizationPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Personalization Management</h1>
      <p>View and manage AI-driven personalization, recommendations, and user segments here.</p>
      <PersonalizationAdminTable />
    </div>
  );
}
