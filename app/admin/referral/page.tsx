
import dynamic from 'next/dynamic';

export const metadata = {
  title: 'Referral Management | Admin',
};


const ReferralAdminTable = dynamic(() => import('@/components/admin/ReferralAdminTable'), { ssr: false });

export default function AdminReferralPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Referral Program Management</h1>
      <p>View and manage user referrals, rewards, and program settings here.</p>
      <ReferralAdminTable />
    </div>
  );
}
