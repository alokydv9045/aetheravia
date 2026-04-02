'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Read DaisyUI theme CSS variables and format as hsl(var(--token)/alpha)
function hslVar(token: string, alpha = 1, fallback?: string) {
  try {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    if (val) return `hsl(${val} / ${alpha})`;
  } catch {
    // noop on SSR or if getComputedStyle not available
  }
  return fallback ?? '';
}

interface ShipmentAnalytics {
  overview: {
    totalShipments: number;
    deliveredCount: number;
    inTransitCount: number;
    failedCount: number;
    avgDeliveryTime: number;
    totalShippingCost: number;
  };
  providerStats: Array<{
    _id: string;
    count: number;
    delivered: number;
    avgCost: number;
    avgDeliveryTime: number;
  }>;
  dailyTrend: Array<{
    _id: string;
    count: number;
    delivered: number;
  }>;
}

export default function ShipmentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ShipmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/3pl/analytics?days=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button className="btn btn-sm" onClick={loadAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="alert alert-info">
        <span>No analytics data available</span>
      </div>
    );
  }

  const { overview, providerStats, dailyTrend } = analytics;

  // Calculate delivery success rate
  const deliveryRate = overview.totalShipments > 0 
    ? ((overview.deliveredCount / overview.totalShipments) * 100).toFixed(1)
    : '0';

  // Prepare charts data
  const deliveryStatusData = {
    labels: ['Delivered', 'In Transit', 'Failed'],
    datasets: [
      {
        data: [overview.deliveredCount, overview.inTransitCount, overview.failedCount],
        backgroundColor: [
          hslVar('--su', 1, '#10b981'), // success
          hslVar('--wa', 1, '#f59e0b'), // warning
          hslVar('--er', 1, '#ef4444'), // error
        ],
        borderWidth: 0,
      },
    ],
  };

  const providerComparisonData = {
    labels: providerStats.map(p => p._id.replace('_', ' ')),
    datasets: [
      {
        label: 'Total Shipments',
        data: providerStats.map(p => p.count),
        backgroundColor: hslVar('--in', 1, '#3b82f6'), // info/primary-ish
        borderRadius: 4,
      },
      {
        label: 'Delivered',
        data: providerStats.map(p => p.delivered),
        backgroundColor: hslVar('--su', 1, '#10b981'), // success
        borderRadius: 4,
      },
    ],
  };

  const dailyTrendData = {
    labels: dailyTrend.slice(-14).map(d => new Date(d._id).toLocaleDateString()),
    datasets: [
      {
        label: 'Shipments Created',
        data: dailyTrend.slice(-14).map(d => d.count),
        borderColor: hslVar('--p', 1, '#3b82f6'),
        backgroundColor: hslVar('--p', 0.15, 'rgba(59, 130, 246, 0.1)'),
        tension: 0.4,
      },
      {
        label: 'Delivered',
        data: dailyTrend.slice(-14).map(d => d.delivered),
        borderColor: hslVar('--su', 1, '#10b981'),
        backgroundColor: hslVar('--su', 0.15, 'rgba(16, 185, 129, 0.1)'),
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: hslVar('--bc', 1, '#374151'), // base-content
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: hslVar('--bc', 1, '#374151'),
        },
      },
      x: {
        ticks: {
          color: hslVar('--bc', 1, '#374151'),
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">3PL Shipment Analytics</h1>
        <div className="form-control">
          <select 
            className="select select-bordered select-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">Total Shipments</div>
          <div className="stat-value text-primary">{overview.totalShipments}</div>
          <div className="stat-desc">Last {dateRange} days</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">Delivery Rate</div>
          <div className="stat-value text-success">{deliveryRate}%</div>
          <div className="stat-desc">{overview.deliveredCount} delivered</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">Avg Delivery Time</div>
          <div className="stat-value text-info">
            {overview.avgDeliveryTime ? `${Math.round(overview.avgDeliveryTime)}h` : 'N/A'}
          </div>
          <div className="stat-desc">Hours to deliver</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">Shipping Cost</div>
          <div className="stat-value text-warning">
            ₹{overview.totalShippingCost?.toLocaleString() || '0'}
          </div>
          <div className="stat-desc">Total spent</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Status Distribution */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Delivery Status Distribution</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={deliveryStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Provider Comparison */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Provider Performance</h2>
            <div className="h-64">
              <Bar data={providerComparisonData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Daily Trend - Full Width */}
        <div className="lg:col-span-2 card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Daily Shipment Trend (Last 14 Days)</h2>
            <div className="h-64">
              <Line data={dailyTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Provider Details Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Provider Detailed Statistics</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Total Shipments</th>
                  <th>Delivered</th>
                  <th>Success Rate</th>
                  <th>Avg Cost</th>
                  <th>Avg Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                {providerStats.map((provider) => {
                  const successRate = provider.count > 0 
                    ? ((provider.delivered / provider.count) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <tr key={provider._id}>
                      <td>
                        <span className="font-medium">
                          {provider._id.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{provider.count}</td>
                      <td>{provider.delivered}</td>
                      <td>
                        <span className={`badge ${
                          parseFloat(successRate) >= 90 ? 'badge-success' :
                          parseFloat(successRate) >= 75 ? 'badge-warning' : 'badge-error'
                        } badge-sm`}>
                          {successRate}%
                        </span>
                      </td>
                      <td>₹{provider.avgCost?.toFixed(2) || '0.00'}</td>
                      <td>
                        {provider.avgDeliveryTime 
                          ? `${Math.round(provider.avgDeliveryTime)}h`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => window.open('/api/3pl/shipments', '_blank')}>
              View All Shipments
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => window.open('/api/3pl/analytics/export', '_blank')}>
              Export Data
            </button>
            <button className="btn btn-accent btn-sm" onClick={loadAnalytics}>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}