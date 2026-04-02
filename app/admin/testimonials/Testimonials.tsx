'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatId } from '@/lib/utils';

type Testimonial = {
  _id: string;
  name: string;
  quote: string;
  role?: string;
  city?: string;
  rating?: number;
  published?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

function useAdminEvents(eventTypes: string[], onAny: () => void) {
  useEffect(() => {
    const es = new EventSource('/api/admin/realtime');
    const handler = (e: MessageEvent) => {
      try { const evt = JSON.parse(e.data); if (evt && eventTypes.includes(evt.type)) onAny(); } catch {}
    };
    (es as any).addEventListener('admin', handler);
    return () => { (es as any).removeEventListener('admin', handler); es.close(); };
  }, [eventTypes, onAny]);
}

type ViewMode = 'table' | 'cards';
type SortKey = 'name' | 'rating' | 'order' | 'published' | 'createdAt';

export default function Testimonials() {
  const { data: items, error, mutate, isLoading } = useSWR<Testimonial[]>(`/api/admin/testimonials`);
  const router = useRouter();
  
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Debounce search
  useEffect(() => { const t = setTimeout(()=>setSearch(rawSearch), 250); return ()=>clearTimeout(t); }, [rawSearch]);

  useAdminEvents(['testimonial.updated', 'testimonial.created', 'testimonial.deleted'], () => mutate());

  const { trigger: deleteItem } = useSWRMutation(
    `/api/admin/testimonials`,
    async (url, { arg }: { arg: { id: string } }) => {
      const toastId = toast.loading('Deleting testimonial...');
      const res = await fetch(`${url}/${arg.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to delete', { id: toastId });
      } else {
        toast.success('Testimonial deleted', { id: toastId });
        mutate();
      }
    },
  );

  const { trigger: createItem, isMutating: isCreating } = useSWRMutation(
    `/api/admin/testimonials`,
    async (url) => {
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to create');
      toast.success('Testimonial created');
      router.push(`/admin/testimonials/${data.testimonial._id}`);
    },
  );

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    return items.filter(t => {
      if (q) {
        const hit = t.name.toLowerCase().includes(q) || 
                   t.quote.toLowerCase().includes(q) ||
                   (t.role?.toLowerCase() || '').includes(q) ||
                   (t.city?.toLowerCase() || '').includes(q);
        if (!hit) return false;
      }
      if (publishedFilter !== 'all' && (publishedFilter === 'published' ? !t.published : t.published)) return false;
      if (ratingFilter !== 'all' && t.rating !== parseInt(ratingFilter)) return false;
      return true;
    }).sort((a,b)=>{
      let av: any; let bv: any;
      if (sortKey === 'createdAt') { av = new Date(a.createdAt || 0).getTime(); bv = new Date(b.createdAt || 0).getTime(); }
      else if (sortKey === 'rating') { av = a.rating || 0; bv = b.rating || 0; }
      else if (sortKey === 'order') { av = a.order || 0; bv = b.order || 0; }
      else if (sortKey === 'published') { av = a.published ? 1 : 0; bv = b.published ? 1 : 0; }
      else { av = (a as any)[sortKey] || ''; bv = (b as any)[sortKey] || ''; av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir==='asc'? -1:1; if (av>bv) return sortDir==='asc'?1:-1; return 0;
    });
  }, [items, search, publishedFilter, ratingFilter, sortKey, sortDir]);

  const stats = useMemo(()=>{
    if (!items) return { total: 0, published: 0, avgRating: 0 };
    const published = items.filter(t => t.published).length;
    const totalRating = items.reduce((sum, t) => sum + (t.rating || 0), 0);
    const avgRating = items.length ? +(totalRating / items.length).toFixed(1) : 0;
    return { total: items.length, published, avgRating };
  }, [items]);

  const toggleSort = (k: SortKey) => { 
    if (k===sortKey) setSortDir(d=>d==='asc'?'desc':'asc'); 
    else { setSortKey(k); setSortDir(['name'].includes(k) ? 'asc':'desc'); } 
  };

  function exportCsv() {
    if (!filtered.length) return toast.error('Nothing to export');
    const header = ['ID','Name','Quote','Role','City','Rating','Published','Order','Created'];
    const lines = filtered.map(t => [
      formatId(t._id), 
      t.name, 
      t.quote, 
      t.role || '', 
      t.city || '', 
      t.rating || '', 
      t.published ? 'Yes' : 'No',
      t.order || 0,
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''
    ]);
    const csv = [header.join(','), ...lines.map(r=>r.map(v=> '"'+String(v).replace(/"/g,'""')+'"').join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob); 
    const a=document.createElement('a'); 
    a.href=url; a.download='testimonials.csv'; 
    a.click(); 
    URL.revokeObjectURL(url); 
    toast.success('CSV exported');
  }

  if (error) return <div className="text-error">Failed to load testimonials.</div>;
  if (isLoading || !items) return <div className="animate-pulse space-y-3"><div className="h-8 w-40 bg-base-200 rounded"/><div className="h-48 bg-base-200 rounded"/></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-sm opacity-70">Manage customer reviews and testimonials</p>
        </div>
        <button
          disabled={isCreating}
          onClick={() => createItem()}
          className="btn btn-primary"
        >
          {isCreating && <span className="loading loading-spinner loading-sm"></span>}
          Create Testimonial
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
          <div className="stat-desc">testimonials</div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm">
          <div className="stat-title text-xs">Published</div>
          <div className="stat-value text-2xl text-success">{stats.published}</div>
          <div className="stat-desc">{stats.total > 0 ? Math.round((stats.published/stats.total)*100) : 0}% visible</div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm">
          <div className="stat-title text-xs">Avg Rating</div>
          <div className="stat-value text-2xl text-warning">{stats.avgRating}</div>
          <div className="stat-desc">out of 5 stars</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Search</label>
              <input 
                value={rawSearch} 
                onChange={e=>setRawSearch(e.target.value)} 
                placeholder="Name, quote, role, city..." 
                className="input input-sm input-bordered w-72" 
              />
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Status</label>
              <select value={publishedFilter} onChange={e=>setPublishedFilter(e.target.value)} className="select select-sm select-bordered w-32">
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Rating</label>
              <select value={ratingFilter} onChange={e=>setRatingFilter(e.target.value)} className="select select-sm select-bordered w-24">
                <option value="all">All</option>
                <option value="5">5★</option>
                <option value="4">4★</option>
                <option value="3">3★</option>
                <option value="2">2★</option>
                <option value="1">1★</option>
              </select>
            </div>
            <div className="flex gap-2 flex-wrap items-end">
              <div className="join">
                <button onClick={()=>setView('table')} className={`btn btn-xs join-item ${view==='table'?'btn-primary':''}`}>Table</button>
                <button onClick={()=>setView('cards')} className={`btn btn-xs join-item ${view==='cards'?'btn-primary':''}`}>Cards</button>
              </div>
              <button className="btn btn-xs btn-outline" onClick={exportCsv}>Export CSV</button>
              <button className="btn btn-xs" onClick={()=>mutate()}>Refresh</button>
            </div>
            <div className="text-xs opacity-70 lg:ml-auto">
              <strong>{filtered.length}</strong> of <strong>{stats.total}</strong> testimonials
            </div>
          </div>
        </div>
      </div>

      {/* Empty */}
      {!filtered.length && <div className="p-10 border border-dashed border-base-300 rounded text-center text-sm">No matching testimonials.</div>}

      {/* Table view */}
      {filtered.length>0 && view==='table' && (
        <div className="overflow-x-auto border border-base-300 rounded">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/70">
                <th className="cursor-pointer" onClick={()=>toggleSort('name')}>Name {sortKey==='name' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="max-w-xs">Quote</th>
                <th>Role/City</th>
                <th className="cursor-pointer text-center" onClick={()=>toggleSort('rating')}>Rating {sortKey==='rating' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer text-center" onClick={()=>toggleSort('published')}>Status {sortKey==='published' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer text-center" onClick={()=>toggleSort('order')}>Order {sortKey==='order' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t._id} className="hover:bg-base-50">
                  <td className="font-medium">{t.name}</td>
                  <td className="max-w-xs">
                    <div className="truncate text-sm" title={t.quote}>
                      &ldquo;{t.quote}&rdquo;
                    </div>
                  </td>
                  <td className="text-sm opacity-70">
                    {[t.role, t.city].filter(Boolean).join(' · ') || '-'}
                  </td>
                  <td className="text-center">
                    {t.rating ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-warning">★</span>
                        <span className="text-sm">{t.rating}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="text-center">
                    <div className={`badge badge-sm ${t.published ? 'badge-success' : 'badge-ghost'}`}>
                      {t.published ? 'Published' : 'Draft'}
                    </div>
                  </td>
                  <td className="text-center text-sm">{t.order || 0}</td>
                  <td>
                    <div className="flex gap-1">
                      <Link href={`/admin/testimonials/${t._id}`} className="btn btn-ghost btn-xs">
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteItem({ id: t._id })}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {filtered.length>0 && view==='cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(t=>(
            <div key={t._id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs opacity-70">{[t.role, t.city].filter(Boolean).join(' · ') || 'Customer'}</div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">⋮</label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                      <li><Link href={`/admin/testimonials/${t._id}`}>Edit</Link></li>
                      <li><button onClick={() => deleteItem({ id: t._id })} className="text-error">Delete</button></li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-sm italic">&ldquo;{t.quote}&rdquo;</div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-warning">★</span>
                        <span className="text-sm">{t.rating}</span>
                      </div>
                    )}
                    <div className={`badge badge-xs ${t.published ? 'badge-success' : 'badge-ghost'}`}>
                      {t.published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <div className="text-xs opacity-60">Order: {t.order || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
