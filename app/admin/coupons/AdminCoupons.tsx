'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

import { Coupon, COUPON_TYPE, COUPON_STATUS } from '@/lib/models/CouponModel';
import dynamic from 'next/dynamic';
import { formatPrice } from '@/lib/utils';

const AdminCoupons = () => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const UserAutocomplete = dynamic(() => import('@/components/admin/UserAutocomplete'), { ssr: false });
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    type: string;
    value: string;
    minimumOrderAmount: string;
    maximumDiscountAmount: string;
    startDate: string;
    expiryDate: string;
    usageLimit: string;
    usagePerUser: string;
    status: string;
    firstTimeUsersOnly: boolean;
    allowedUsers: string[];
  }>({
    code: '',
    name: '',
    description: '',
    type: COUPON_TYPE.PERCENTAGE,
    value: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    usagePerUser: '1',
    status: COUPON_STATUS.ACTIVE,
    firstTimeUsersOnly: false,
    allowedUsers: [],
  });

  // NEW UI STATE
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired' | 'upcoming'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and force cards view on small screens
  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      const mobile = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobile(mobile);
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Whenever entering mobile, force card view
  useEffect(() => {
    if (isMobile && viewMode !== 'cards') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);
  const [audienceMode, setAudienceMode] = useState<'all' | 'specific'>('all');

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        toast.error('Failed to fetch coupons');
      }
    } catch (error) {
      toast.error('Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: COUPON_TYPE.PERCENTAGE,
      value: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      startDate: '',
      expiryDate: '',
      usageLimit: '',
      usagePerUser: '1',
      status: COUPON_STATUS.ACTIVE,
      firstTimeUsersOnly: false,
      allowedUsers: [],
    });
    setAudienceMode('all');
    setEditingCoupon(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        usagePerUser: parseInt(formData.usagePerUser),
        allowedUsers: formData.allowedUsers,
      };

      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon._id}` : '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
        resetForm();
        fetchCoupons();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save coupon');
      }
    } catch (error) {
      toast.error('Error saving coupon');
    }
  };

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type as any,
      value: coupon.value.toString(),
      minimumOrderAmount: coupon.minimumOrderAmount.toString(),
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
      usagePerUser: coupon.usagePerUser.toString(),
      status: coupon.status as any,
      firstTimeUsersOnly: coupon.firstTimeUsersOnly,
      allowedUsers: coupon.allowedUsers || [],
    });
    setAudienceMode(coupon.allowedUsers && coupon.allowedUsers.length > 0 ? 'specific' : 'all');
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Error deleting coupon');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const newStatus = coupon.status === COUPON_STATUS.ACTIVE ? COUPON_STATUS.INACTIVE : COUPON_STATUS.ACTIVE;
      
      const response = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coupon, status: newStatus }),
      });
      
      if (response.ok) {
        toast.success('Coupon status updated');
        fetchCoupons();
      } else {
        toast.error('Failed to update coupon status');
      }
    } catch (error) {
      toast.error('Error updating coupon status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case COUPON_STATUS.ACTIVE: return 'badge-success';
      case COUPON_STATUS.INACTIVE: return 'badge-warning';
      case COUPON_STATUS.EXPIRED: return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getDiscountText = (coupon: Coupon) => {
    switch (coupon.type) {
      case COUPON_TYPE.PERCENTAGE:
        return `${coupon.value}% OFF${coupon.maximumDiscountAmount ? ` (Max: ${formatPrice(coupon.maximumDiscountAmount)})` : ''}`;
      case COUPON_TYPE.FIXED_AMOUNT:
        return `${formatPrice(coupon.value)} OFF`;
      case COUPON_TYPE.FREE_SHIPPING:
        return 'FREE SHIPPING';
      default:
        return '';
    }
  };

  const getTypeIcon = (coupon: Coupon) => {
    switch (coupon.type) {
      case COUPON_TYPE.PERCENTAGE: return '％';
      case COUPON_TYPE.FIXED_AMOUNT: return '₹';
      case COUPON_TYPE.FREE_SHIPPING: return '🚚';
      default: return '🎫';
    }
  };

  // Derived filtered coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter(c => {
      let statusOk = true;
      if (statusFilter === 'active') statusOk = c.status === COUPON_STATUS.ACTIVE && new Date(c.startDate) <= now && new Date(c.expiryDate) >= now;
      else if (statusFilter === 'inactive') statusOk = c.status === COUPON_STATUS.INACTIVE;
      else if (statusFilter === 'expired') statusOk = new Date(c.expiryDate) < now || c.status === COUPON_STATUS.EXPIRED;
      else if (statusFilter === 'upcoming') statusOk = new Date(c.startDate) > now;

      const q = search.trim().toLowerCase();
      const searchOk = !q || [c.code, c.name, c.description || ''].some(v => v.toLowerCase().includes(q));
      return statusOk && searchOk;
    });
  }, [coupons, statusFilter, search]);

  // Quick stats
  const stats = useMemo(() => {
    const now = new Date();
    let active = 0, expired = 0, inactive = 0, upcoming = 0, totalUsage = 0, totalRemaining = 0;
    coupons.forEach(c => {
      const start = new Date(c.startDate);
      const end = new Date(c.expiryDate);
      if (end < now || c.status === COUPON_STATUS.EXPIRED) expired++;
      else if (start > now) upcoming++;
      else if (c.status === COUPON_STATUS.ACTIVE) active++;
      if (c.status === COUPON_STATUS.INACTIVE) inactive++;
      totalUsage += c.usageCount;
      if (c.usageLimit) totalRemaining += Math.max(0, c.usageLimit - c.usageCount);
    });
    return { active, expired, inactive, upcoming, totalUsage, totalRemaining };
  }, [coupons]);

  function StatTile({ label, value, tone, className = '' }: { label: string; value: number; tone: string; className?: string }) {
    const toneMap: Record<string,string> = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error'
    };
    return (
      <div className={`card bg-base-100 shadow-sm flex ${className}`}>
        <div className="card-body p-3 sm:p-4 gap-1">
          <div className="text-[10px] sm:text-xs opacity-60 tracking-wide uppercase">{label}</div>
          <div className={`text-lg sm:text-xl font-semibold ${toneMap[tone] || ''}`}>{value}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-8" role="main" aria-label="Coupon management dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Coupon Management</h1>
          <p className="text-sm opacity-70">Create, monitor and optimize discount incentives.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-primary btn-sm sm:btn-md"
            onClick={() => setShowForm(true)}
          >
            ➕ New Coupon
          </button>
          <button
            className="btn btn-outline btn-sm"
            disabled={loading}
            onClick={fetchCoupons}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <section aria-labelledby="coupon-stats-heading" className="relative">
        <h2 id="coupon-stats-heading" className="sr-only">Coupon statistics overview</h2>
        {loading ? (
          <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-sm animate-pulse">
                <div className="card-body p-3 sm:p-4 gap-1">
                  <div className="h-3 w-14 bg-base-300 rounded" />
                  <div className="h-5 w-10 bg-base-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] text-sm">
            <StatTile label="Active" value={stats.active} tone="primary" />
            <StatTile label="Upcoming" value={stats.upcoming} tone="info" />
            <StatTile label="Expired" value={stats.expired} tone="error" />
            <StatTile label="Inactive" value={stats.inactive} tone="warning" className="hidden xl:flex" />
            <StatTile label="Total Usage" value={stats.totalUsage} tone="secondary" />
            <StatTile label="Remaining (agg)" value={stats.totalRemaining} tone="accent" />
          </div>
        )}
      </section>

      {/* Filters & Search */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {(['all','active','upcoming','inactive','expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`btn btn-xs sm:btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search code / name / desc"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-sm sm:input-md input-bordered w-full sm:w-64"
              />
              {!isMobile && (
                <div className="flex gap-2 items-center">
                  <span className="text-xs opacity-60 hidden sm:inline">View</span>
                  <div className="join join-sm">
                    <button className={`btn btn-xs join-item ${viewMode==='table'?'btn-primary':'btn-outline'}`} onClick={()=>setViewMode('table')}>Table</button>
                    <button className={`btn btn-xs join-item ${viewMode==='cards'?'btn-primary':'btn-outline'}`} onClick={()=>setViewMode('cards')}>Cards</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {loading && <div className="text-xs opacity-70">Loading coupons...</div>}
          {!loading && filteredCoupons.length === 0 && (
            <div className="text-sm opacity-70">No coupons match current filters.</div>
          )}
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Coupon Code *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Coupon Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="20% Off Sale"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Get 20% off on all items"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Discount Type *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    required
                  >
                    <option value={COUPON_TYPE.PERCENTAGE}>Percentage</option>
                    <option value={COUPON_TYPE.FIXED_AMOUNT}>Fixed Amount</option>
                    <option value={COUPON_TYPE.FREE_SHIPPING}>Free Shipping</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      {formData.type === COUPON_TYPE.PERCENTAGE ? 'Percentage (%)' : 
                       formData.type === COUPON_TYPE.FIXED_AMOUNT ? 'Amount (₹)' : 'Value'} *
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder={formData.type === COUPON_TYPE.PERCENTAGE ? '20' : '10'}
                    min="0"
                    step={formData.type === COUPON_TYPE.PERCENTAGE ? '1' : '0.01'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Minimum Order Amount (₹)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                {formData.type === COUPON_TYPE.PERCENTAGE && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Maximum Discount Amount (₹)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.maximumDiscountAmount}
                      onChange={(e) => setFormData({...formData, maximumDiscountAmount: e.target.value})}
                      placeholder="Optional"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Date *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Expiry Date *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Total Usage Limit</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Usage Per User *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.usagePerUser}
                    onChange={(e) => setFormData({...formData, usagePerUser: e.target.value})}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value={COUPON_STATUS.ACTIVE}>Active</option>
                    <option value={COUPON_STATUS.INACTIVE}>Inactive</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">First-time Users Only</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.firstTimeUsersOnly}
                      onChange={(e) => setFormData({...formData, firstTimeUsersOnly: e.target.checked})}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Audience</span>
                  </label>
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="audience"
                        className="radio radio-sm"
                        value="all"
                        checked={audienceMode === 'all'}
                        onChange={() => {
                          setAudienceMode('all');
                          setFormData(f => ({ ...f, allowedUsers: [] }));
                        }}
                      />
                      <span>All Users (Global Coupon)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="audience"
                        className="radio radio-sm"
                        value="specific"
                        checked={audienceMode === 'specific'}
                        onChange={() => setAudienceMode('specific')}
                      />
                      <span>Specific Users Only</span>
                    </label>
                  </div>
                  {audienceMode === 'specific' && (
                    <div className="mt-3 space-y-2">
                      <UserAutocomplete
                        selected={formData.allowedUsers}
                        setSelected={ids => setFormData(f => ({ ...f, allowedUsers: ids }))}
                      />
                      <div className="text-xs mt-1 text-gray-500">
                        Choose one or more users. Switch back to All Users to remove restriction.
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-action">
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {viewMode === 'table' && (
        <div className="card bg-base-100 border border-base-300" aria-busy={loading ? 'true' : 'false'}>
          <div className="card-body p-4 sm:p-6">
            <div className="overflow-x-auto relative group max-w-full" aria-live="polite">
              <table className="table table-zebra table-xs sm:table-sm lg:table-md align-middle">
                <caption className="sr-only">Coupons overview table with type, code, discount, validity, usage, badges and actions</caption>
                <thead>
                  <tr className="bg-base-200/60 sticky top-0 z-10 shadow-sm">
                    <th className="text-[10px] sm:text-xs w-10">Type</th>
                    <th className="text-[10px] sm:text-xs min-w-[160px]">Code / Name</th>
                    <th className="text-[10px] sm:text-xs whitespace-nowrap">Discount</th>
                    <th className="hidden lg:table-cell text-[10px] sm:text-xs whitespace-nowrap">Validity</th>
                    <th className="text-[10px] sm:text-xs whitespace-nowrap">Usage</th>
                    <th className="text-[10px] sm:text-xs">Badges</th>
                    <th className="text-[10px] sm:text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td><div className="w-8 h-8 bg-base-300 rounded" /></td>
                        <td>
                          <div className="space-y-1">
                            <div className="h-3 w-24 bg-base-300 rounded" />
                            <div className="h-3 w-32 bg-base-300 rounded" />
                          </div>
                        </td>
                        <td><div className="h-3 w-20 bg-base-300 rounded" /></td>
                        <td className="hidden lg:table-cell"><div className="h-3 w-28 bg-base-300 rounded" /></td>
                        <td><div className="h-3 w-16 bg-base-300 rounded" /></td>
                        <td><div className="h-3 w-24 bg-base-300 rounded" /></td>
                        <td><div className="h-3 w-20 bg-base-300 rounded" /></td>
                      </tr>
                    ))
                  )}
                  {!loading && filteredCoupons.map((coupon) => {
                    const now = new Date();
                    const exp = new Date(coupon.expiryDate);
                    const start = new Date(coupon.startDate);
                    const soon = exp.getTime() - now.getTime() < 1000*60*60*24*3 && exp > now; // <3 days
                    const expired = exp < now;
                    const upcoming = start > now;
                    const restricted = (coupon.allowedUsers && coupon.allowedUsers.length > 0);
                    const firstTime = coupon.firstTimeUsersOnly;
                    const progress = coupon.usageLimit ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100)) : null;
                    return (
                      <tr key={coupon._id} className={soon && !expired ? 'bg-warning/10' : ''}>
                        <td className="px-2">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold bg-primary/10 text-primary ${expired ? 'opacity-50' : ''}`}>{getTypeIcon(coupon)}</div>
                        </td>
                        <td className="text-[10px] sm:text-xs max-w-[220px]">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-bold tracking-wide" title="Coupon Code">{coupon.code}</span>
                                <button
                                  type="button"
                                  onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Copied'); }}
                                  className="btn btn-ghost btn-xs h-5 w-5 p-0 text-[10px] opacity-60 hover:opacity-100"
                                  title="Copy code"
                                >📋</button>
                              </div>
                              <div className="font-medium truncate" title={coupon.name}>{coupon.name}</div>
                              {coupon.description && (
                                <div className="text-[10px] opacity-60 truncate" title={coupon.description}>{coupon.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                          {getDiscountText(coupon)}
                        </td>
                        <td className="hidden lg:table-cell text-[10px] sm:text-xs whitespace-nowrap">
                          <div>{start.toLocaleDateString()} → {exp.toLocaleDateString()}</div>
                          {soon && !expired && <div className="text-[10px] text-warning">Ends soon</div>}
                          {upcoming && <div className="text-[10px] opacity-60">Starts {start.toLocaleDateString()}</div>}
                          {expired && <div className="text-[10px] text-error">Expired</div>}
                        </td>
                        <td className="text-[10px] sm:text-xs align-top">
                          <div className="flex flex-col gap-1">
                            <span>{coupon.usageCount}/{coupon.usageLimit || '∞'}</span>
                            {progress !== null && (
                              <progress className="progress progress-primary w-20 h-2" value={progress} max={100}></progress>
                            )}
                            {progress !== null && <span className="text-[9px] opacity-60 text-right">{progress}%</span>}
                          </div>
                        </td>
                        <td className="text-[9px] sm:text-[10px]">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            <span className={`badge badge-ghost badge-xs ${getStatusBadgeClass(coupon.status)}`}>{coupon.status}</span>
                            {upcoming && <span className="badge badge-info badge-xs">Upcoming</span>}
                            {soon && !expired && <span className="badge badge-warning badge-xs">Soon</span>}
                            {expired && <span className="badge badge-error badge-xs">Expired</span>}
                            {restricted && <span className="badge badge-neutral badge-xs" title="Restricted to selected users">Restricted</span>}
                            {firstTime && <span className="badge badge-accent badge-xs" title="First time users only">1st</span>}
                          </div>
                        </td>
                        <td className="min-w-[120px]">
                          <div className="flex flex-wrap gap-1">
                            <button className="btn btn-xs btn-outline" onClick={() => handleEdit(coupon)} title="Edit">Edit</button>
                            <button className={`btn btn-xs ${coupon.status === COUPON_STATUS.ACTIVE ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-success'}`} onClick={() => handleToggleStatus(coupon)} title="Toggle Status">{coupon.status === COUPON_STATUS.ACTIVE ? 'Pause' : 'Activate'}</button>
                            <button className="btn btn-xs btn-error" onClick={() => handleDelete(coupon._id)} title="Delete">Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loading && filteredCoupons.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-6xl opacity-30 mb-4">🎫</div>
                  <p className="text-base-content/70 text-sm">No coupons found</p>
                </div>
              )}
              {/* Scroll edge gradients */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-base-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-base-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="grid gap-5 md:gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-base-300 rounded-md" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-base-300 rounded" />
                  <div className="h-3 w-32 bg-base-300 rounded" />
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div className="h-3 w-full bg-base-300 rounded" />
                <div className="h-3 w-3/4 bg-base-300 rounded" />
                <div className="h-3 w-1/2 bg-base-300 rounded" />
              </div>
            </div>
          ))}
          {!loading && filteredCoupons.map(coupon => {
            const now = new Date();
            const exp = new Date(coupon.expiryDate);
            const start = new Date(coupon.startDate);
            const soon = exp.getTime() - now.getTime() < 1000*60*60*24*3 && exp > now;
            const expired = exp < now;
            const upcoming = start > now;
            const progress = coupon.usageLimit ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100)) : null;
            return (
              <div
                key={coupon._id}
                className={`relative group card bg-base-100 border rounded-xl transition-all duration-200 hover:shadow-lg ${soon ? 'border-warning' : expired ? 'border-error' : 'border-base-300'}`}
              >
                {/* Accent bar */}
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl ${expired ? 'bg-error' : soon ? 'bg-warning' : upcoming ? 'bg-info' : 'bg-primary/60'} opacity-80`}></div>
                <div className="card-body pt-5 pb-5 px-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold bg-primary/10 text-primary shadow-inner">
                        {getTypeIcon(coupon)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base sm:text-lg font-extrabold tracking-wide select-all" title="Coupon Code">{coupon.code}</span>
                          <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Code copied'); }}
                            className="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
                            title="Copy code"
                          >📋</button>
                        </div>
                        <div className="font-semibold text-sm sm:text-base truncate" title={coupon.name}>{coupon.name}</div>
                        {coupon.description && (
                          <p className="text-xs sm:text-[13px] leading-snug line-clamp-2 opacity-70" title={coupon.description}>{coupon.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px] sm:text-[11px]">
                      <span className={`badge badge-sm ${getStatusBadgeClass(coupon.status)}`}>{coupon.status}</span>
                      {soon && !expired && <span className="badge badge-warning badge-xs">Soon</span>}
                      {upcoming && <span className="badge badge-info badge-xs">Upcoming</span>}
                      {expired && <span className="badge badge-error badge-xs">Expired</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-[13px]">
                    <div className="space-y-1">
                      <div className="font-medium">{getDiscountText(coupon)}</div>
                      <div className="opacity-70 flex items-center gap-1">
                        <span className="font-medium">Validity:</span>
                        <span>{start.toLocaleDateString()} → {exp.toLocaleDateString()}</span>
                      </div>
                      {soon && !expired && <div className="text-warning text-[11px]">Ends soon</div>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Usage</span>
                        <span>{coupon.usageCount}/{coupon.usageLimit || '∞'}</span>
                      </div>
                      {progress !== null && (
                        <progress className="progress progress-primary h-2 w-full" value={progress} max={100}></progress>
                      )}
                      {progress !== null && <div className="text-right text-[11px] opacity-60">{progress}% used</div>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button className="btn btn-xs btn-outline" onClick={() => handleEdit(coupon)}>Edit</button>
                    <button className={`btn btn-xs ${coupon.status === COUPON_STATUS.ACTIVE ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-success'}`} onClick={() => handleToggleStatus(coupon)}>{coupon.status === COUPON_STATUS.ACTIVE ? 'Pause' : 'Activate'}</button>
                    <button className="btn btn-xs btn-error" onClick={() => handleDelete(coupon._id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredCoupons.length === 0 && !loading && (
            <div className="col-span-full text-center py-10 opacity-70 text-sm">No coupons found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;