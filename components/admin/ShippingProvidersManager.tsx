"use client";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { CheckCircle, XCircle } from 'lucide-react';

interface CourierConfig {
  provider: 'DELIVERY_COM' | 'ECART' | 'SHIPPO';
  name: string;
  isEnabled: boolean;
  priority: number;
  apiKey?: string;
  environment: 'test' | 'live';
  lastUsed?: Date;
  totalShipments?: number;
  successRate?: number;
}

interface ShippingStatus {
  activeProvider: string;
  providers: CourierConfig[];
  testMode: boolean;
  webhookUrl: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ShippingProvidersManager() {
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  const { data: status, error, mutate } = useSWR<ShippingStatus>('/api/admin/shipping/providers', fetcher);

  const providerDetails = {
    SHIPPO: {
      name: 'Shippo',
      description: 'Multi-carrier shipping API platform',
      icon: '🚢',
      features: ['Rate shopping', 'Label printing', 'Tracking', 'International shipping'],
      status: 'Primary Provider'
    },
    DELIVERY_COM: {
      name: 'Delivery.com',
      description: 'Local and regional delivery service',
      icon: '🚚',
      features: ['Same-day delivery', 'Local coverage', 'Real-time tracking'],
      status: 'Fallback Provider'
    },
    ECART: {
      name: 'eCart',
      description: 'E-commerce logistics platform',
      icon: '📦',
      features: ['Bulk shipping', 'COD support', 'Pan-India coverage'],
      status: 'Fallback Provider'
    }
  };

  const testProvider = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/admin/shipping/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      
      const result = await response.json();
      setTestResult(result.success ? 'Test successful!' : `Test failed: ${result.error}`);
    } catch (error) {
      setTestResult('Test failed: Network error');
    } finally {
      setTestingProvider(null);
    }
  };

  const updateProviderStatus = async (provider: string, isEnabled: boolean) => {
    try {
      await fetch('/api/admin/shipping/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, isEnabled })
      });
      mutate();
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Failed to load shipping providers status</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Shipping Providers</h2>
          <p className="text-base-content/70">Manage third-party delivery partners</p>
        </div>
        <div className="stats stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Active Provider</div>
            <div className="stat-value text-primary text-lg">{status.activeProvider}</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div className="font-semibold">Current Configuration</div>
          <div className="text-sm">
            Primary: <strong>{status.activeProvider}</strong> | 
            Mode: <strong>{status.testMode ? 'Test' : 'Live'}</strong> | 
            Webhook: <code className="text-xs">{status.webhookUrl}</code>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(providerDetails).map(([key, details]) => {
          const provider = status.providers.find(p => p.provider === key);
          const isEnabled = provider?.isEnabled ?? false;
          const isPrimary = status.activeProvider === key;
          
          return (
            <div key={key} className={`card bg-base-100 shadow-xl border-2 ${isPrimary ? 'border-primary' : 'border-base-300'}`}>
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{details.icon}</div>
                    <div>
                      <h3 className="card-title text-lg">{details.name}</h3>
                      <p className="text-sm text-base-content/70">{details.description}</p>
                    </div>
                  </div>
                  <div className={`badge ${isPrimary ? 'badge-primary' : isEnabled ? 'badge-success' : 'badge-neutral'}`}>
                    {isPrimary ? 'Primary' : isEnabled ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {details.features.map((feature, idx) => (
                      <span key={idx} className="badge badge-outline badge-xs">{feature}</span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                {provider && (
                  <div className="stats stats-horizontal shadow-sm mt-4">
                    <div className="stat px-4 py-2">
                      <div className="stat-title text-xs">Shipments</div>
                      <div className="stat-value text-sm">{provider.totalShipments || 0}</div>
                    </div>
                    <div className="stat px-4 py-2">
                      <div className="stat-title text-xs">Success Rate</div>
                      <div className="stat-value text-sm">{provider.successRate ? `${provider.successRate}%` : 'N/A'}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-end mt-4 gap-2">
                  <button 
                    className={`btn btn-sm ${testingProvider === key ? 'loading' : ''}`}
                    onClick={() => testProvider(key)}
                    disabled={testingProvider !== null}
                  >
                    {testingProvider === key ? 'Testing...' : 'Test'}
                  </button>
                  
                  <button 
                    className={`btn btn-sm ${isEnabled ? 'btn-error' : 'btn-success'}`}
                    onClick={() => updateProviderStatus(key, !isEnabled)}
                  >
                    {isEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {/* Test Result */}
                {testResult && testingProvider === null && (
                  <div className={`alert ${testResult.includes('successful') ? 'alert-success' : 'alert-error'} mt-2`}>
                    {testResult.includes('successful') ? <CheckCircle className="inline mr-1" /> : <XCircle className="inline mr-1" />}
                    <span className="text-xs">{testResult}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Guide */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Environment Variables Required</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Environment Variables</th>
                  <th>Webhook URL</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Shippo</td>
                  <td>
                    <code className="text-xs">SHIPPO_API_KEY</code>, <code className="text-xs">SHIPPO_BASE_URL</code>
                  </td>
                  <td>
                    <code className="text-xs">{status.webhookUrl}</code>
                  </td>
                  <td>
                    <span className="badge badge-success">Configured</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">Delivery.com</td>
                  <td>
                    <code className="text-xs">DELIVERYCOM_CLIENT_ID</code>, <code className="text-xs">DELIVERYCOM_CLIENT_SECRET</code>
                  </td>
                  <td>
                    <code className="text-xs">{status.webhookUrl.replace('/shippo', '/delivery-com')}</code>
                  </td>
                  <td>
                    <span className="badge badge-success">Configured</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">eCart</td>
                  <td>
                    <code className="text-xs">ECART_API_KEY</code>, <code className="text-xs">ECART_USERNAME</code>
                  </td>
                  <td>
                    <code className="text-xs">{status.webhookUrl.replace('/shippo', '/e-cart')}</code>
                  </td>
                  <td>
                    <span className="badge badge-success">Configured</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}