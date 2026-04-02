'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ShippingProvider {
  id: string;
  name: string;
  type: 'shipping' | '3pl';
  status: 'active' | 'inactive' | 'testing';
  integration: string;
  orders: number;
  successRate: number;
  avgDeliveryTime: string;
  lastSync: string;
  features: string[];
}

interface ShippingStats {
  totalProviders: number;
  activeProviders: number;
  totalShipments: number;
  avgSuccessRate: number;
  totalRevenue: number;
  webhookUptime: number;
}

export default function UnifiedShippingManagement() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [stats, setStats] = useState<ShippingStats>({
    totalProviders: 0,
    activeProviders: 0,
    totalShipments: 0,
    avgSuccessRate: 0,
    totalRevenue: 0,
    webhookUptime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'analytics' | 'settings'>('overview');

  // Fetch providers and stats from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/shipping/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping data');
      }
      
      const data = await response.json();
      if (data.success) {
        setProviders(data.data.providers);
        setStats(data.data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch shipping data');
      }
    } catch (err) {
      console.error('Error fetching shipping data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping data');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderToggle = async (providerId: string, newStatus: 'active' | 'inactive') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/shipping/unified', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          providerId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update provider status');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setProviders(prev => prev.map(p => 
          p.id === providerId ? { ...p, status: newStatus } : p
        ));
        
        // Refresh data to get updated stats
        await fetchData();
      } else {
        throw new Error(data.message || 'Failed to update provider status');
      }
    } catch (err) {
      console.error('Error updating provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to update provider status');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (providerId?: string) => {
    try {
      setLoading(true);
      setError('');
      
      if (providerId) {
        // Sync specific provider
        const response = await fetch('/api/admin/shipping/unified', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sync',
            providerId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to sync provider');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to sync provider');
        }
      }
      
      // Refresh all data after sync
      await fetchData();
    } catch (err) {
      console.error('Error syncing:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync providers');
    } finally {
      setLoading(false);
    }
  };

  // Check admin access
  if (!session?.user || !(session.user as any).isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Unified Shipping Management</h1>
          <p className="text-gray-600">
            Manage shipping providers, 3PL logistics, and delivery integrations from one dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="stat bg-primary text-primary-content shadow rounded-lg">
            <div className="stat-title text-primary-content/70">Total Providers</div>
            <div className="stat-value text-2xl">{stats.totalProviders}</div>
          </div>
          
          <div className="stat bg-success text-success-content shadow rounded-lg">
            <div className="stat-title text-success-content/70">Active</div>
            <div className="stat-value text-2xl">{stats.activeProviders}</div>
          </div>
          
          <div className="stat bg-info text-info-content shadow rounded-lg">
            <div className="stat-title text-info-content/70">Total Shipments</div>
            <div className="stat-value text-xl">{stats.totalShipments.toLocaleString()}</div>
          </div>
          
          <div className="stat bg-warning text-warning-content shadow rounded-lg">
            <div className="stat-title text-warning-content/70">Success Rate</div>
            <div className="stat-value text-xl">{stats.avgSuccessRate.toFixed(1)}%</div>
          </div>
          
          <div className="stat bg-accent text-accent-content shadow rounded-lg">
            <div className="stat-title text-accent-content/70">Revenue</div>
            <div className="stat-value text-xl">₹{(stats.totalRevenue / 1000).toFixed(0)}K</div>
          </div>
          
          <div className="stat bg-secondary text-secondary-content shadow rounded-lg">
            <div className="stat-title text-secondary-content/70">Uptime</div>
            <div className="stat-value text-xl">{stats.webhookUptime}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'providers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            🚚 Providers
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSync()}
                    disabled={loading}
                  >
                    {loading && <span className="loading loading-spinner loading-sm"></span>}
                    🔄 Sync All Providers
                  </button>
                  <Link href="/admin/3pl/test" className="btn btn-info">
                    🧪 Test Webhooks
                  </Link>
                  <Link href="/admin/3pl/analytics" className="btn btn-accent">
                    📊 View Analytics
                  </Link>
                  <Link href="/admin/orders/unified" className="btn btn-outline">
                    📦 Manage Orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Provider Status Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <div key={provider.id} className="card bg-base-100 shadow">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="card-title text-lg">{provider.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`badge badge-sm ${
                          provider.type === 'shipping' ? 'badge-info' : 'badge-primary'
                        }`}>
                          {provider.type.toUpperCase()}
                        </span>
                        <span className={`badge badge-sm ${
                          provider.status === 'active' ? 'badge-success' :
                          provider.status === 'testing' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {provider.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Orders:</span>
                        <span className="font-medium">{provider.orders.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">{provider.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Delivery:</span>
                        <span className="font-medium">{provider.avgDeliveryTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Sync:</span>
                        <span className="font-medium">{provider.lastSync}</span>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSync(provider.id)}
                        disabled={loading}
                      >
                        🔄 Sync
                      </button>
                      <button
                        className={`btn btn-sm ${
                          provider.status === 'active' ? 'btn-error' : 'btn-success'
                        }`}
                        onClick={() => handleProviderToggle(
                          provider.id, 
                          provider.status === 'active' ? 'inactive' : 'active'
                        )}
                        disabled={loading}
                      >
                        {provider.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Provider Management</h2>
              <button className="btn btn-primary">+ Add Provider</button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Integration</th>
                    <th>Orders</th>
                    <th>Success Rate</th>
                    <th>Features</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id}>
                      <td>
                        <div className="font-bold">{provider.name}</div>
                        <div className="text-sm opacity-50">Last sync: {provider.lastSync}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          provider.type === 'shipping' ? 'badge-info' : 'badge-primary'
                        }`}>
                          {provider.type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          provider.status === 'active' ? 'badge-success' :
                          provider.status === 'testing' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {provider.status}
                        </span>
                      </td>
                      <td>{provider.integration}</td>
                      <td>{provider.orders.toLocaleString()}</td>
                      <td>{provider.successRate}%</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {provider.features.slice(0, 2).map((feature, index) => (
                            <span key={index} className="badge badge-ghost badge-xs">
                              {feature}
                            </span>
                          ))}
                          {provider.features.length > 2 && (
                            <span className="badge badge-ghost badge-xs">
                              +{provider.features.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-xs">⚙️</button>
                          <button className="btn btn-ghost btn-xs">📊</button>
                          <button className="btn btn-ghost btn-xs">🔄</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shipping Analytics</h2>
            <div className="alert alert-info">
              <span>📊 Detailed analytics dashboard coming soon. For now, use the overview stats above.</span>
            </div>
            
            {/* Placeholder for analytics charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title">Delivery Performance</h3>
                  <div className="h-64 flex items-center justify-center bg-base-200 rounded">
                    <span className="text-base-content/50">Performance Chart Placeholder</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title">Cost Analysis</h3>
                  <div className="h-64 flex items-center justify-center bg-base-200 rounded">
                    <span className="text-base-content/50">Cost Chart Placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shipping Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title">General Settings</h3>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Default Provider</span>
                    </label>
                    <select className="select select-bordered">
                      <option>Auto-select best provider</option>
                      <option>Shippo</option>
                      <option>Delivery.com</option>
                      <option>eCart</option>
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sync Frequency</span>
                    </label>
                    <select className="select select-bordered">
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Hourly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title">Notification Settings</h3>
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Email notifications</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Webhook failures</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Delivery delays</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}