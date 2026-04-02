
import Orders from './Orders';
import Link from 'next/link';

export const metadata = {
  title: 'Basic Orders - BellaModa Admin',
};

const AdminOrdersPage = () => {
  return (
    <div>
      {/* Quick Navigation */}
      <div className="mb-4 p-4 bg-base-200 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Basic Order Management</h2>
            <p className="text-sm text-base-content/70">Simple order listing and management</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders/hub" className="btn btn-ghost btn-sm">
              🏠 Order Hub
            </Link>
            <Link href="/admin/orders/unified" className="btn btn-primary btn-sm">
              🎯 Unified Orders
            </Link>
          </div>
        </div>
      </div>
      
      <Orders />
    </div>
  );
};

export default AdminOrdersPage;
