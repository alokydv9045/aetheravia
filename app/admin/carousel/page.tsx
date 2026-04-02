"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import toast from 'react-hot-toast';

export default function AdminCarouselPage() {
  const { data: session } = useSession();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(prev => prev && true); // keep true only on first load
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/carousel");
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return banners.filter(b => {
      if (!showInactive && !b.isActive) return false;
      if (!q) return true;
      return [b.title, b.link, b.order?.toString()].some(v => v && v.toLowerCase().includes(q));
    }).sort((a,b) => a.order - b.order);
  }, [banners, search, showInactive]);

  async function toggleActive(banner: any) {
    try {
      const res = await fetch(`/api/admin/carousel/${banner._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      if (!res.ok) throw new Error('Failed to update');
      setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, isActive: !b.isActive } : b));
      toast.success(!banner.isActive ? 'Banner activated' : 'Banner deactivated');
    } catch (e:any) {
      toast.error(e.message || 'Update failed');
    }
  }

  async function deleteBanner(id: string) {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`/api/admin/carousel/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setBanners(prev => prev.filter(b => b._id !== id));
      toast.success('Deleted');
    } catch (e:any) {
      toast.error(e.message || 'Delete failed');
    }
  }

  const activeCount = banners.filter(b=>b.isActive).length;
  const inactiveCount = banners.length - activeCount;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Carousel Banners</h1>
          <p className="text-sm opacity-70">Manage homepage hero / promo banners with ordering & activation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/carousel/new" className="btn btn-primary btn-sm">➕ New Banner</Link>
          <button className="btn btn-outline btn-sm" disabled={refreshing} onClick={fetchBanners}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-3"><div className="text-xs opacity-60">Total</div><div className="text-lg font-semibold">{banners.length}</div></div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-3"><div className="text-xs opacity-60">Active</div><div className="text-lg font-semibold">{activeCount}</div></div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-3"><div className="text-xs opacity-60">Inactive</div><div className="text-lg font-semibold">{inactiveCount}</div></div></div>
        <div className="card bg-base-100 shadow-sm hidden md:block"><div className="card-body p-3"><div className="text-xs opacity-60">Visible %</div><div className="text-lg font-semibold">{banners.length ? Math.round((activeCount / banners.length) * 100) : 0}%</div></div></div>
        <div className="card bg-base-100 shadow-sm hidden lg:block"><div className="card-body p-3"><div className="text-xs opacity-60">Next Order</div><div className="text-lg font-semibold">{(banners.reduce((m,b)=> Math.max(m,b.order||0),0) + 1)}</div></div></div>
        <div className="card bg-base-100 shadow-sm hidden lg:block"><div className="card-body p-3"><div className="text-xs opacity-60">Updated</div><div className="text-lg font-semibold">{new Date().toLocaleTimeString()}</div></div></div>
      </div>

      {/* Filters & Search */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-end">
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <button className={`btn btn-xs sm:btn-sm ${showInactive ? 'btn-outline' : 'btn-primary'}`} onClick={()=>setShowInactive(false)}>Active Only</button>
              <button className={`btn btn-xs sm:btn-sm ${showInactive ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setShowInactive(true)}>All Banners</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search title / link / order"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                className="input input-sm sm:input-md input-bordered w-full sm:w-72"
              />
            </div>
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="card bg-base-100 border border-base-300 animate-pulse">
              <div className="h-32 bg-base-300/40" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-2/3 bg-base-300 rounded" />
                <div className="h-3 w-1/2 bg-base-300 rounded" />
                <div className="h-3 w-1/3 bg-base-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(banner => {
            const inactive = !banner.isActive;
            return (
              <div key={banner._id} className={`group card bg-base-100 border border-base-300 hover:shadow-md transition relative ${inactive ? 'opacity-70' : ''}`}>
                <div className="relative w-full h-40 overflow-hidden rounded-t">
                  <Image src={banner.image} alt={banner.title || 'Banner'} fill className="object-cover" />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`badge badge-xs ${inactive ? 'badge-warning' : 'badge-success'}`}>{inactive ? 'Inactive' : 'Active'}</span>
                    <span className="badge badge-xs badge-ghost">#{banner.order}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-base-100/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="card-body p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate" title={banner.title}>{banner.title || 'Untitled Banner'}</h3>
                    {banner.link && <p className="text-xs opacity-70 truncate" title={banner.link}>{banner.link}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button onClick={()=>toggleActive(banner)} className={`btn btn-xs ${inactive ? 'btn-success' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{inactive ? 'Activate' : 'Deactivate'}</button>
                    <Link href={`/admin/carousel/${banner._id}`} className="btn btn-xs btn-outline">Edit</Link>
                    <button onClick={()=>deleteBanner(banner._id)} className="btn btn-xs btn-error">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 opacity-60 text-sm">No banners found.</div>
          )}
        </div>
      )}
    </div>
  );
}
