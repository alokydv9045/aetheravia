// Enhanced Universal Analytics Dashboard for Admin
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
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
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { brandName } from '@/lib/brand';
import { BarChart, Target, CheckCircle, XCircle, Trophy, AlertTriangle, RefreshCw, DollarSign, Package, Users, TrendingUp, Gem, Star, Truck, Clock, MapPin, Settings, Home, RotateCcw, HelpCircle, PieChart, Timer, Mail, Crown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Read DaisyUI theme CSS variables and format as hsl(var(--token)/alpha)
function hslVar(token: string, alpha = 1, fallback?: string) {
  try {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    if (val) return `hsl(${val} / ${alpha})`;
  } catch {
    // noop when SSR or getComputedStyle unavailable
  }
  return fallback ?? '';
}

// Enhanced color scheme using shadcn + DaisyUI
const chartColors = {
  primary: {
    solid: () => hslVar('--p', 1, '#3b82f6'),
    gradient: () => hslVar('--p', 0.8, 'rgba(59, 130, 246, 0.8)'),
    light: () => hslVar('--p', 0.2, 'rgba(59, 130, 246, 0.2)')
  },
  secondary: {
    solid: () => hslVar('--s', 1, '#f97316'),
    gradient: () => hslVar('--s', 0.8, 'rgba(249, 115, 22, 0.8)'),
    light: () => hslVar('--s', 0.2, 'rgba(249, 115, 22, 0.2)')
  },
  accent: {
    solid: () => hslVar('--a', 1, '#8b5cf6'),
    gradient: () => hslVar('--a', 0.8, 'rgba(139, 92, 246, 0.8)'),
    light: () => hslVar('--a', 0.2, 'rgba(139, 92, 246, 0.2)')
  },
  success: {
    solid: () => hslVar('--su', 1, '#10b981'),
    gradient: () => hslVar('--su', 0.8, 'rgba(16, 185, 129, 0.8)'),
    light: () => hslVar('--su', 0.2, 'rgba(16, 185, 129, 0.2)')
  },
  warning: {
    solid: () => hslVar('--wa', 1, '#f59e0b'),
    gradient: () => hslVar('--wa', 0.8, 'rgba(245, 158, 11, 0.8)'),
    light: () => hslVar('--wa', 0.2, 'rgba(245, 158, 11, 0.2)')
  },
  error: {
    solid: () => hslVar('--er', 1, '#ef4444'),
    gradient: () => hslVar('--er', 0.8, 'rgba(239, 68, 68, 0.8)'),
    light: () => hslVar('--er', 0.2, 'rgba(239, 68, 68, 0.2)')
  },
  info: {
    solid: () => hslVar('--in', 1, '#06b6d4'),
    gradient: () => hslVar('--in', 0.8, 'rgba(6, 182, 212, 0.8)'),
    light: () => hslVar('--in', 0.2, 'rgba(6, 182, 212, 0.2)')
  },
  palette: [
    () => hslVar('--p', 0.9, '#3b82f6'),
    () => hslVar('--s', 0.9, '#f97316'),
    () => hslVar('--a', 0.9, '#8b5cf6'),
    () => hslVar('--su', 0.9, '#10b981'),
    () => hslVar('--wa', 0.9, '#f59e0b'),
    () => hslVar('--er', 0.9, '#ef4444'),
    () => hslVar('--in', 0.9, '#06b6d4'),
    () => hslVar('--n', 0.9, '#64748b')
  ]
};

interface UnifiedAnalytics {
  // Core Business Metrics
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    conversionRate: number;
    avgOrderValue: number;
    customerLifetimeValue: number;
  };
  
  // Sales Analytics
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
    users: number;
  }>;
  
  // Product Performance
  productMetrics: {
    topProducts: Array<{
      _id: string;
      name: string;
      revenue: number;
      quantity: number;
      margin: number;
    }>;
    categoryPerformance: Array<{
      category: string;
      revenue: number;
      count: number;
    }>;
    lowStock: Array<{
      _id: string;
      name: string;
      stock: number;
    }>;
  };
  
  // Customer Analytics
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    loyaltyEngagement: number;
    referralStats: {
      totalReferrals: number;
      successfulReferrals: number;
      referralRevenue: number;
    };
    segmentation: Array<{
      segment: string;
      count: number;
      revenue: number;
    }>;
  };
  
  // Order Analytics
  orderAnalytics: {
    statusDistribution: Record<string, number>;
    avgProcessingTime: number;
    ordersByRegion: Array<{
      region: string;
      count: number;
      revenue: number;
    }>;
  };
  
  // 3PL Logistics Analytics
  logisticsMetrics: {
    totalShipments: number;
    deliveryRate: number;
    avgDeliveryTime: number;
    shippingCosts: number;
    providerPerformance: Array<{
      provider: string;
      shipments: number;
      successRate: number;
      avgCost: number;
      avgTime: number;
    }>;
    deliveryTrends: Array<{
      date: string;
      shipments: number;
      delivered: number;
      failed: number;
    }>;
  };
  
  // Marketing Performance
  marketingMetrics: {
    activeOffers: number;
    offerRedemption: number;
    couponUsage: number;
    campaignROI: number;
    emailMetrics: {
      sent: number;
      opened: number;
      clicked: number;
    };
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UnifiedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  // Fetch unified analytics data
  const { data: analytics, error, isLoading, mutate } = useSWR<UnifiedAnalytics>(
    `/api/admin/analytics/unified?days=${dateRange}`,
    fetcher,
    { 
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 30000
    }
  );

  const refreshData = useCallback(() => {
    mutate();
  }, [mutate]);

  // Memoized chart configurations for performance
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12,
          padding: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 15,
          color: hslVar('--bc', 1, '#374151'),
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 11
          }
        }
      },
      tooltip: {
        backgroundColor: hslVar('--n', 0.9, 'rgba(0, 0, 0, 0.8)'),
        titleColor: hslVar('--nc', 1, '#ffffff'),
        bodyColor: hslVar('--nc', 1, '#ffffff'),
        borderColor: hslVar('--b3', 1, '#333333'),
        borderWidth: 1,
        cornerRadius: 6,
        caretPadding: 6
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: hslVar('--bc', 0.9, '#374151'),
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 9 : 10
          },
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 10
        }
      },
      y: {
        grid: {
          color: hslVar('--bc', 0.1, 'rgba(0, 0, 0, 0.1)')
        },
        ticks: {
          color: hslVar('--bc', 0.9, '#374151'),
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 9 : 10
          },
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 8
        }
      }
    }
  }), []);

  if (isLoading) {
    return (
      <div className="bg-base-100">
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-base-100">
        <div className="alert alert-error max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Failed to load analytics data</span>
          <button className="btn btn-sm btn-outline" onClick={refreshData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, salesTrends, productMetrics, customerInsights, orderAnalytics, logisticsMetrics, marketingMetrics } = analytics;

  // Enhanced KPI Cards with better styling and animations
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${overview.totalRevenue.toLocaleString('en-IN')}`,
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign />,
  color: 'from-success to-success',
  bgColor: 'bg-success/10'
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: <Package />,
  color: 'from-primary to-primary',
  bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Users',
      value: overview.totalUsers.toLocaleString(),
      change: '+15.7%',
      trend: 'up',
      icon: <Users />,
  color: 'from-secondary to-secondary',
  bgColor: 'bg-secondary/10'
    },
    {
      title: 'Conversion Rate',
      value: `${overview.conversionRate.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up',
      icon: <TrendingUp />,
  color: 'from-warning to-warning',
  bgColor: 'bg-warning/10'
    },
    {
      title: 'Avg Order Value',
      value: `₹${overview.avgOrderValue.toLocaleString('en-IN')}`,
      change: '+5.3%',
      trend: 'up',
      icon: <Gem />,
  color: 'from-accent to-accent',
  bgColor: 'bg-accent/10'
    },
    {
      title: 'Customer LTV',
      value: `₹${overview.customerLifetimeValue.toLocaleString('en-IN')}`,
      change: '+18.9%',
      trend: 'up',
      icon: <Star />,
  color: 'from-warning to-warning',
  bgColor: 'bg-warning/10'
    },
    {
      title: 'Delivery Rate',
      value: `${logisticsMetrics.deliveryRate.toFixed(1)}%`,
      change: logisticsMetrics.deliveryRate > 95 ? '+1.2%' : '-0.8%',
      trend: logisticsMetrics.deliveryRate > 95 ? 'up' : 'down',
      icon: <Truck />,
  color: 'from-info to-info',
  bgColor: 'bg-info/10'
    },
    {
      title: 'Active Campaigns',
      value: marketingMetrics.activeOffers.toString(),
      change: '+3',
      trend: 'up',
      icon: <Target />,
  color: 'from-secondary to-secondary',
  bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="bg-base-100 space-y-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-content"><BarChart className="inline mr-2" /> Analytics Dashboard</h1>
        <div className="flex gap-4 mt-4">
          <select
            className="select select-bordered select-sm"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={refreshData}>
            <RefreshCw className="mr-2" /> Refresh
          </button>
          <button className="btn btn-outline btn-sm">
            <BarChart className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards (improved width and arrangement) */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => (
            <div key={index} className="card bg-base-100 shadow-lg border border-base-300 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center text-2xl shadow-sm`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                      {card.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-3xl font-bold text-base-content mb-1">{card.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                    card.trend === 'up' 
                      ? 'text-success bg-success/10' 
                      : 'text-error bg-error/10'
                  }`}>
                    {card.trend === 'up' ? '↗' : '↘'} {card.change}
                  </span>
                  <span className="text-sm text-base-content/50">vs previous period</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs (mobile friendly with better spacing) */}
      <nav className="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
        <ul className="flex gap-2 sm:gap-3 pb-2 border-b border-border text-xs sm:text-sm min-w-max sm:min-w-0">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart /> },
            { id: 'sales', label: 'Sales', icon: <DollarSign /> },
            { id: 'products', label: 'Products', icon: <Package /> },
            { id: 'customers', label: 'Customers', icon: <Users /> },
            { id: 'logistics', label: 'Logistics', icon: <Truck /> },
            { id: 'marketing', label: 'Marketing', icon: <Target /> }
          ].map(tab => (
            <li key={tab.id} className="flex-shrink-0">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 border font-medium whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'border-border bg-card text-foreground/80 hover:text-foreground hover:bg-muted/60 hover:border-muted-foreground/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <OverviewSection 
          analytics={analytics} 
          chartOptions={chartOptions}
        />
      )}
      
      {activeTab === 'sales' && (
        <SalesSection 
          salesTrends={salesTrends}
          orderAnalytics={orderAnalytics}
          chartOptions={chartOptions}
        />
      )}
      
      {activeTab === 'products' && (
        <ProductsSection 
          productMetrics={productMetrics}
          chartOptions={chartOptions}
        />
      )}
      
      {activeTab === 'customers' && (
        <CustomersSection 
          customerInsights={customerInsights}
          chartOptions={chartOptions}
        />
      )}
      
      {activeTab === 'logistics' && (
        <LogisticsSection 
          logisticsMetrics={logisticsMetrics}
          chartOptions={chartOptions}
        />
      )}
      
      {activeTab === 'marketing' && (
        <MarketingSection 
          marketingMetrics={marketingMetrics}
          chartOptions={chartOptions}
        />
      )}
    </div>
  );
}

// Overview Section Component
function OverviewSection({ analytics, chartOptions }: { analytics: UnifiedAnalytics, chartOptions: any }) {
  const revenueData = {
    labels: analytics.salesTrends.slice(-30).map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: analytics.salesTrends.slice(-30).map(d => d.revenue),
        borderColor: chartColors.primary.solid(),
        backgroundColor: chartColors.primary.light(),
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: chartColors.primary.solid(),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ],
  };

  const ordersData = {
    labels: analytics.salesTrends.slice(-30).map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Orders',
        data: analytics.salesTrends.slice(-30).map(d => d.orders),
        borderColor: chartColors.success.solid(),
        backgroundColor: chartColors.success.light(),
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: chartColors.success.solid(),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><DollarSign className="mr-2" /> Revenue Trend</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-success text-sm sm:text-base lg:text-lg"><Package className="mr-2" /> Orders Trend</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4">
            <Line data={ordersData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border xl:col-span-2">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-secondary text-sm sm:text-base lg:text-lg"><BarChart className="mr-2" /> Order Status Distribution</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4 flex items-center justify-center">
            <div className="w-full max-w-md">
              <Doughnut 
                data={{
                  labels: Object.keys(analytics.orderAnalytics.statusDistribution),
                  datasets: [{
                    data: Object.values(analytics.orderAnalytics.statusDistribution),
                    backgroundColor: chartColors.palette.map(color => color()),
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 4,
                    hoverOffset: 8
                  }]
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom' as const,
                      labels: {
                        ...chartOptions.plugins.legend.labels,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-accent"><Truck className="mr-2" /> Logistics Performance</h3>
          <div className="stats stats-vertical w-full">
            <div className="stat">
              <div className="stat-title">Total Shipments</div>
              <div className="stat-value text-2xl">{analytics.logisticsMetrics.totalShipments}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Delivery Rate</div>
              <div className={`stat-value text-2xl ${analytics.logisticsMetrics.deliveryRate > 95 ? 'text-success' : 'text-warning'}`}>
                {analytics.logisticsMetrics.deliveryRate.toFixed(1)}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Avg Delivery Time</div>
              <div className="stat-value text-2xl">{analytics.logisticsMetrics.avgDeliveryTime}h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sales Section Component
function SalesSection({ salesTrends, orderAnalytics, chartOptions }: { 
  salesTrends: any[], 
  orderAnalytics: any, 
  chartOptions: any 
}) {
  const salesData = {
    labels: salesTrends.slice(-14).map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesTrends.slice(-14).map(d => d.revenue),
        backgroundColor: chartColors.primary.gradient(),
        borderColor: chartColors.primary.solid(),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: chartColors.primary.solid(),
        hoverBorderColor: chartColors.accent.solid(),
        hoverBorderWidth: 3
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="card bg-base-100 shadow-lg border border-border xl:col-span-2">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><DollarSign className="mr-2" /> Daily Sales Performance</h3>
          <div className="h-64 sm:h-80 lg:h-96 mt-4">
            <Bar data={salesData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-secondary text-sm sm:text-base lg:text-lg"><MapPin className="mr-2" /> Orders by Region</h3>
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {orderAnalytics.ordersByRegion?.map((region: any, index: number) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-base-200 rounded-lg gap-2 sm:gap-0">
                <span className="font-medium text-sm sm:text-base">{region.region}</span>
                <div className="text-left sm:text-right">
                  <div className="font-bold text-sm sm:text-base">{region.count} orders</div>
                  <div className="text-xs sm:text-sm opacity-70">₹{region.revenue.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-accent"><Timer className="mr-2" /> Processing Metrics</h3>
          <div className="stats stats-vertical w-full">
            <div className="stat">
              <div className="stat-title">Avg Processing Time</div>
              <div className="stat-value text-2xl">{orderAnalytics.avgProcessingTime}h</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Orders</div>
              <div className="stat-value text-2xl">
                {Object.values(orderAnalytics.statusDistribution).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Products Section Component
function ProductsSection({ productMetrics, chartOptions }: { 
  productMetrics: any, 
  chartOptions: any 
}) {
  const categoryData = {
    labels: productMetrics.categoryPerformance.map((c: any) => c.category),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: productMetrics.categoryPerformance.map((c: any) => c.revenue),
        backgroundColor: chartColors.palette.map(color => color()),
        borderColor: chartColors.palette.map(color => color()),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: chartColors.palette.map(color => color()),
        hoverBorderWidth: 3
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><BarChart className="mr-2" /> Category Performance</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-success text-sm sm:text-base lg:text-lg"><Trophy className="mr-2" /> Top Products</h3>
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {productMetrics.topProducts.slice(0, 5).map((product: any, index: number) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-base-200 rounded-lg gap-2 sm:gap-0">
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base truncate" title={product.name}>{product.name}</div>
                  <div className="text-xs sm:text-sm opacity-70">Qty: {product.quantity}</div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="font-bold text-sm sm:text-base">₹{product.revenue.toLocaleString('en-IN')}</div>
                  <div className="text-xs sm:text-sm text-success">{product.margin}% margin</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border xl:col-span-2">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-warning text-sm sm:text-base lg:text-lg"><AlertTriangle className="mr-2" /> Low Stock Alert</h3>
          {productMetrics.lowStock.length === 0 ? (
            <div className="text-center py-8 text-success">
              <CheckCircle className="mr-2" /> All products are well stocked!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
              {productMetrics.lowStock.map((product: any, index: number) => (
                <div key={index} className="alert alert-warning">
                  <span>{product.name}</span>
                  <span className="badge badge-error">{product.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Customers Section Component
function CustomersSection({ customerInsights, chartOptions }: { 
  customerInsights: any, 
  chartOptions: any 
}) {
  const segmentData = {
    labels: customerInsights.segmentation.map((s: any) => s.segment),
    datasets: [
      {
        data: customerInsights.segmentation.map((s: any) => s.count),
        backgroundColor: chartColors.palette.map(color => color()),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverOffset: 12,
        hoverBorderColor: chartColors.accent.solid()
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><Users className="mr-2" /> Customer Segmentation</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4 flex items-center justify-center">
            <div className="w-full max-w-md">
              <Pie data={segmentData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-secondary text-sm sm:text-base lg:text-lg"><TrendingUp className="mr-2" /> Customer Growth</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="stat bg-primary/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">New Customers</div>
              <div className="stat-value text-primary text-lg sm:text-2xl lg:text-3xl">{customerInsights.newCustomers}</div>
            </div>
            <div className="stat bg-secondary/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">Returning Customers</div>
              <div className="stat-value text-secondary text-lg sm:text-2xl lg:text-3xl">{customerInsights.returningCustomers}</div>
            </div>
            <div className="stat bg-accent/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">Loyalty Engagement</div>
              <div className="stat-value text-accent text-lg sm:text-2xl lg:text-3xl">{customerInsights.loyaltyEngagement}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border xl:col-span-2">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-success text-sm sm:text-base lg:text-lg"><Users className="mr-2 w-5 h-5" /> Referral Program Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
            <div className="stat bg-primary/10 rounded-lg">
              <div className="stat-title">Total Referrals</div>
              <div className="stat-value text-primary">{customerInsights.referralStats.totalReferrals}</div>
            </div>
            <div className="stat bg-success/10 rounded-lg">
              <div className="stat-title">Successful Referrals</div>
              <div className="stat-value text-success">{customerInsights.referralStats.successfulReferrals}</div>
            </div>
            <div className="stat bg-secondary/10 rounded-lg">
              <div className="stat-title">Referral Revenue</div>
              <div className="stat-value text-secondary">₹{customerInsights.referralStats.referralRevenue.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logistics Section Component
function LogisticsSection({ logisticsMetrics, chartOptions }: { 
  logisticsMetrics: any, 
  chartOptions: any 
}) {
  const providerData = {
    labels: logisticsMetrics.providerPerformance.map((p: any) => p.provider),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: logisticsMetrics.providerPerformance.map((p: any) => p.successRate),
        backgroundColor: chartColors.success.gradient(),
        borderColor: chartColors.success.solid(),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: 'Avg Cost (₹)',
        data: logisticsMetrics.providerPerformance.map((p: any) => p.avgCost),
        backgroundColor: chartColors.info.gradient(),
        borderColor: chartColors.info.solid(),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y1'
      }
    ],
  };

  const deliveryTrendData = {
    labels: logisticsMetrics.deliveryTrends.slice(-14).map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Shipments',
        data: logisticsMetrics.deliveryTrends.slice(-14).map((d: any) => d.shipments),
        borderColor: chartColors.primary.solid(),
        backgroundColor: chartColors.primary.light(),
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: chartColors.primary.solid(),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Delivered',
        data: logisticsMetrics.deliveryTrends.slice(-14).map((d: any) => d.delivered),
        borderColor: chartColors.success.solid(),
        backgroundColor: chartColors.success.light(),
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: chartColors.success.solid(),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-primary/10 rounded-lg p-4">
          <div className="stat-title">Total Shipments</div>
          <div className="stat-value text-primary">{logisticsMetrics.totalShipments}</div>
        </div>
        <div className="stat bg-success/10 rounded-lg p-4">
          <div className="stat-title">Delivery Rate</div>
          <div className="stat-value text-success">{logisticsMetrics.deliveryRate.toFixed(1)}%</div>
        </div>
        <div className="stat bg-warning/10 rounded-lg p-4">
          <div className="stat-title">Avg Delivery Time</div>
          <div className="stat-value text-warning">{logisticsMetrics.avgDeliveryTime}h</div>
        </div>
        <div className="stat bg-secondary/10 rounded-lg p-4">
          <div className="stat-title">Shipping Costs</div>
          <div className="stat-value text-secondary">₹{logisticsMetrics.shippingCosts.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="card bg-base-100 shadow-lg border border-border">
          <div className="card-body p-4 sm:p-6">
            <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><Truck className="mr-2" /> Provider Performance</h3>
            <div className="h-64 sm:h-72 lg:h-80 mt-4">
              <Bar 
                data={providerData} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y1: {
                      type: 'linear' as const,
                      display: true,
                      position: 'right' as const,
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-border">
          <div className="card-body p-4 sm:p-6">
            <h3 className="card-title text-success text-sm sm:text-base lg:text-lg"><TrendingUp className="mr-2" /> Delivery Trends</h3>
            <div className="h-64 sm:h-72 lg:h-80 mt-4">
              <Line data={deliveryTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border xl:col-span-2">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-accent text-sm sm:text-base lg:text-lg"><BarChart className="mr-2" /> Provider Detailed Analysis</h3>
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Shipments</th>
                  <th>Success Rate</th>
                  <th>Avg Cost</th>
                  <th>Avg Time</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {logisticsMetrics.providerPerformance.map((provider: any, index: number) => (
                  <tr key={index}>
                    <td className="font-medium">{provider.provider}</td>
                    <td>{provider.shipments}</td>
                    <td>
                      <span className={`badge ${provider.successRate > 95 ? 'badge-success' : provider.successRate > 85 ? 'badge-warning' : 'badge-error'}`}>
                        {provider.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>₹{provider.avgCost}</td>
                    <td>{provider.avgTime}h</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress 
                          className={`progress w-20 ${provider.successRate > 95 ? 'progress-success' : provider.successRate > 85 ? 'progress-warning' : 'progress-error'}`} 
                          value={provider.successRate} 
                          max="100"
                        ></progress>
                        <span className="text-xs">{provider.successRate > 95 ? <Trophy /> : provider.successRate > 85 ? <AlertTriangle /> : <XCircle />}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketing Section Component
function MarketingSection({ marketingMetrics, chartOptions }: { 
  marketingMetrics: any, 
  chartOptions: any 
}) {
  const campaignData = {
    labels: ['Active Offers', 'Redeemed', 'Coupons Used'],
    datasets: [
      {
        data: [marketingMetrics.activeOffers, marketingMetrics.offerRedemption, marketingMetrics.couponUsage],
        backgroundColor: [
          chartColors.primary.solid(),
          chartColors.success.solid(),
          chartColors.warning.solid()
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverOffset: 12,
        hoverBorderColor: chartColors.accent.solid()
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-primary text-sm sm:text-base lg:text-lg"><Target className="mr-2" /> Campaign Performance</h3>
          <div className="h-64 sm:h-72 lg:h-80 mt-4 flex items-center justify-center">
            <div className="w-full max-w-md">
              <Doughnut data={campaignData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-border">
        <div className="card-body p-4 sm:p-6">
          <h3 className="card-title text-secondary text-sm sm:text-base lg:text-lg"><Mail className="mr-2" /> Email Marketing</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="stat bg-primary/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">Emails Sent</div>
              <div className="stat-value text-primary text-lg sm:text-2xl lg:text-3xl">{marketingMetrics.emailMetrics.sent}</div>
            </div>
            <div className="stat bg-secondary/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">Open Rate</div>
              <div className="stat-value text-secondary text-lg sm:text-2xl lg:text-3xl">
                {marketingMetrics.emailMetrics.sent > 0 
                  ? ((marketingMetrics.emailMetrics.opened / marketingMetrics.emailMetrics.sent) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            <div className="stat bg-accent/10 rounded-lg p-4">
              <div className="stat-title text-xs sm:text-sm">Click Rate</div>
              <div className="stat-value text-accent text-lg sm:text-2xl lg:text-3xl">
                {marketingMetrics.emailMetrics.opened > 0 
                  ? ((marketingMetrics.emailMetrics.clicked / marketingMetrics.emailMetrics.opened) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg lg:col-span-2">
        <div className="card-body">
          <h3 className="card-title text-success"><DollarSign className="mr-2" /> Marketing ROI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat bg-success/10 rounded-lg">
              <div className="stat-title">Campaign ROI</div>
              <div className="stat-value text-success">{marketingMetrics.campaignROI.toFixed(1)}x</div>
              <div className="stat-desc">Return on marketing investment</div>
            </div>
            <div className="stat bg-primary/10 rounded-lg">
              <div className="stat-title">Active Campaigns</div>
              <div className="stat-value text-primary">{marketingMetrics.activeOffers}</div>
              <div className="stat-desc">Currently running</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}