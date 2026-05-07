import Link from 'next/link';
import { Metadata } from 'next';
import { Package, Search, Target, Check, X, Minus, BarChart, CheckCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Management - AetherAvia Admin',
  description: 'Choose your order management interface',
};

export default function OrderManagementHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Order Management</h1>
          <p className="text-xl text-base-content/70">
            Choose the order management interface that best suits your needs
          </p>
        </div>

        {/* Management Options */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Basic Orders */}
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body">
              <Package className="text-4xl mb-4" />
              <h2 className="card-title text-2xl mb-4">Basic Orders</h2>
              <p className="text-base-content/70 mb-6">
                Simple order listing with basic filtering and status updates. Perfect for quick order overview and basic management tasks.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Order listing with search</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Status filtering</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Individual order actions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Mobile responsive design</span>
                </div>
              </div>

              <div className="card-actions">
                <Link href="/admin/orders" className="btn btn-primary w-full">
                  Open Basic Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Advanced Orders */}
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body">
              <Search className="text-4xl mb-4" />
              <h2 className="card-title text-2xl mb-4">Advanced Orders</h2>
              <p className="text-base-content/70 mb-6">
                Comprehensive order management with advanced filtering, bulk operations, and detailed analytics.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Advanced filtering options</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Bulk status updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Export functionality</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-green-500" />
                  <span>Pagination & sorting</span>
                </div>
              </div>

              <div className="card-actions">
                <Link href="/admin/orders/advanced" className="btn btn-secondary w-full">
                  Open Advanced Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Unified Orders */}
          <div className="card bg-primary text-primary-content shadow-xl border border-primary">
            <div className="card-body">
              <Target className="text-4xl mb-4" />
              <h2 className="card-title text-2xl mb-4">Unified Orders</h2>
              <div className="badge badge-accent mb-4">RECOMMENDED</div>
              <p className="text-primary-content/80 mb-6">
                Complete order management system combining basic and advanced features with delivery partner assignment and comprehensive controls.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>All basic & advanced features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>Delivery partner assignment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>Real-time order statistics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>Table & card view modes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>Bulk delivery assignment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="text-accent" />
                  <span>Enhanced order details</span>
                </div>
              </div>

              <div className="card-actions">
                <Link href="/admin/orders/unified" className="btn btn-accent w-full">
                  Open Unified Orders
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="text-center">Basic</th>
                  <th className="text-center">Advanced</th>
                  <th className="text-center">Unified</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Order Listing</td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
                <tr>
                  <td>Search & Filter</td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><CheckCheck /></td>
                  <td className="text-center text-green-500"><CheckCheck /></td>
                </tr>
                <tr>
                  <td>Status Updates</td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
                <tr>
                  <td>Bulk Operations</td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><CheckCheck /></td>
                </tr>
                <tr>
                  <td>Export Orders</td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><Check /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
                <tr>
                  <td>Delivery Assignment</td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><CheckCheck /></td>
                </tr>
                <tr>
                  <td>Real-time Stats</td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
                <tr>
                  <td>Multiple View Modes</td>
                  <td className="text-center text-yellow-500"><Minus /></td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
                <tr>
                  <td>Order Details Expansion</td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-red-500"><X /></td>
                  <td className="text-center text-green-500"><Check /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin/orders/unified" className="btn btn-primary">
              <Target className="mr-2" /> Go to Unified Orders
            </Link>
            <Link href="/admin/dashboard" className="btn btn-ghost">
              <BarChart className="mr-2" /> Back to Dashboard
            </Link>
            <Link href="/admin/orders/advanced" className="btn btn-outline">
              <Search className="mr-2" /> Advanced Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
