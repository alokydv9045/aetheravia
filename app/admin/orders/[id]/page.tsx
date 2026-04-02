import { Metadata } from 'next';
import AdminOrderDetailPage from './AdminOrderDetailPage';

export const metadata: Metadata = {
  title: 'Order Details - Admin',
};

interface AdminOrderPageProps {
  params: {
    id: string;
  };
}

const AdminOrderPage = ({ params }: AdminOrderPageProps) => {
  return <AdminOrderDetailPage orderId={params.id} />;
};

export default AdminOrderPage;