import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsForm from './SettingsForm';
import TeamSettings from './TeamSettings';

export const metadata: Metadata = {
  title: 'Admin Settings',
};

const AdminSettingsPage = () => {
  return (
    <div className="p-6 space-y-12">
      <div>
        <h1 className="text-3xl font-headline italic text-primary mb-8">Store Settings</h1>
        <SettingsForm />
      </div>

      <div>
        <h1 className="text-3xl font-headline italic text-primary mb-8">Team Management</h1>
        <TeamSettings />
      </div>
    </div>
  );
};

export default AdminSettingsPage;
