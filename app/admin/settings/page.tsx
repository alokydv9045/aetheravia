import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsForm from './SettingsForm';

export const metadata: Metadata = {
  title: 'Admin Settings',
};

const AdminSettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-headline italic text-primary mb-8">Shipping Settings</h1>
      <SettingsForm />
    </div>
  );
};

export default AdminSettingsPage;
