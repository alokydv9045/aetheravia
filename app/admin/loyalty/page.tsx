
import dynamic from 'next/dynamic';

export const metadata = {
  title: 'Loyalty Management | Admin',
};


const LoyaltyAdminTable = dynamic(() => import('@/components/admin/LoyaltyAdminTable'), { ssr: false });

export default function AdminLoyaltyPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loyalty Program Management</h1>
      <p>View and manage user loyalty points, rewards, and program settings here.</p>
      <LoyaltyAdminTable />
    </div>
  );
}
