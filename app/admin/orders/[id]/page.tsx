import { Metadata } from 'next';
import AdminOrderDetailPage from './AdminOrderDetailPage';

export const metadata: Metadata = {
  title: 'Order Details - Admin',
};

const AdminOrderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <AdminOrderDetailPage orderId={id} />;
};

export default AdminOrderPage;