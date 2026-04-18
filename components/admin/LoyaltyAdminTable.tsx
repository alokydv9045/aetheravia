"use client";
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface LoyaltyUser {
  _id: string;
  name: string;
  email: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
}

type SortKey = 'name' | 'email' | 'points' | 'tier';

export default function LoyaltyAdminTable() {
  const { data, error, mutate, isLoading } = useSWR<LoyaltyUser[]>('/api/admin/loyalty');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ points: '', tier: '' });
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'));
  const [bulkDelta, setBulkDelta] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const isAllSelected = selected.length > 0 && data && selected.length === filtered().length;

  const tiersList = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
  data.forEach(u => { if (u.loyaltyTier) set.add(u.loyaltyTier); });
    return Array.from(set).sort();
  }, [data]);

  function filtered(): LoyaltyUser[] {
    if (!data) return [];
    const s = search.toLowerCase();
    return data
      .filter(u => {
        const matches = !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  const tierOk = tierFilter === 'all' || (u.loyaltyTier || '-') === tierFilter;
        return matches && tierOk;
      })
      .sort((a, b) => {
  const av = sortKey === 'points' ? (a.loyaltyPoints || 0) : sortKey === 'tier' ? (a.loyaltyTier || '') : (a as any)[sortKey];
  const bv = sortKey === 'points' ? (b.loyaltyPoints || 0) : sortKey === 'tier' ? (b.loyaltyTier || '') : (b as any)[sortKey];
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }

  const filteredList = filtered();
  const stats = useMemo(() => {
    const total = filteredList.length;
  const totalPoints = filteredList.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0);
    const avg = total ? Math.round(totalPoints / total) : 0;
    return { total, totalPoints, avg };
  }, [filteredList]);

  const beginEdit = (u: LoyaltyUser) => {
    setEditing(u._id);
  setForm({ points: (u.loyaltyPoints ?? 0).toString(), tier: u.loyaltyTier || '' });
  };

  const saveEdit = async (userId: string) => {
    const pointsNum = Number(form.points);
    if (isNaN(pointsNum) || pointsNum < 0) return toast.error('Invalid points');
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points: pointsNum, tier: form.tier.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Update failed');
        return;
      }
      toast.success('Loyalty updated');
      setEditing(null);
      mutate();
    } catch (e: any) {
      toast.error(e?.message || 'Network error');
    }
  };

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('desc'); }
  }

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }
  function toggleSelectAll() {
    if (!data) return;
    if (isAllSelected) setSelected([]); else setSelected(filtered().map(u=>u._id));
  }

  async function applyBulkDelta() {
    if (!bulkDelta.trim()) return toast.error('Enter delta');
    const delta = Number(bulkDelta);
    if (isNaN(delta)) return toast.error('Delta must be a number');
    if (!selected.length) return toast.error('No users selected');
    for (const id of selected) {
      const user = data?.find(u=>u._id===id);
      if (!user) continue;
  const newPoints = Math.max(0, (user.loyaltyPoints || 0) + delta);
  await fetch('/api/admin/loyalty', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: id, points: newPoints, tier: user.loyaltyTier || '' }) });
    }
    toast.success('Bulk updated');
    setSelected([]); setBulkDelta('');
    mutate();
  }

  function exportCsv() {
    const rows = filtered();
    if (!rows.length) return toast.error('Nothing to export');
    const header = ['id','name','email','points','tier'];
  const lines = rows.map(r => [r._id, esc(r.name), esc(r.email), String(r.loyaltyPoints||0), r.loyaltyTier || '']);
    const csv = [header.join(','), ...lines.map(l=>l.join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `loyalty-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }
  function esc(v: string){ return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; }

  // Realtime updates listen
  useEffect(() => {
    const es = new EventSource('/api/admin/realtime');
    esRef.current = es;
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      try { const evt = JSON.parse(e.data); if (evt.type === 'loyalty.updated') mutate(); } catch {}
    };
    es.addEventListener('admin', handler as any);
    return () => { es.removeEventListener('admin', handler as any); es.close(); };
  }, [mutate]);

  if (error) return <div className="text-error">Failed to load loyalty data.</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Search</label>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or email" className="input input-sm input-bordered w-56" />
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Tier</label>
              <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} className="select select-sm select-bordered w-44">
                <option value="all">All tiers</option>
                {tiersList.map(t => <option key={t} value={t}>{t}</option>)}
                {!tiersList.length && <option value="_none" disabled>No tiers</option>}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap items-end">
              <div className="join">
                <button onClick={()=>setView('table')} className={`btn btn-xs join-item ${view==='table'?'btn-primary':''}`}>Table</button>
                <button onClick={()=>setView('cards')} className={`btn btn-xs join-item ${view==='cards'?'btn-primary':''}`}>Cards</button>
              </div>
              <button className="btn btn-xs btn-outline" onClick={exportCsv}>Export CSV</button>
            </div>
            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <label className="label p-0 mb-1 text-xs uppercase">Bulk ± Points</label>
                <input value={bulkDelta} onChange={e=>setBulkDelta(e.target.value)} placeholder="e.g. 50" className="input input-sm input-bordered w-28" />
              </div>
              <button disabled={!selected.length || !bulkDelta} onClick={applyBulkDelta} className="btn btn-xs btn-accent mt-5">Apply ({selected.length})</button>
              {selected.length > 0 && (
                <button onClick={()=>setSelected([])} className="btn btn-xs mt-5">Clear</button>
              )}
            </div>
            <div className="text-xs opacity-70 mt-1 lg:ml-auto flex gap-3 flex-wrap">
              <span><strong>{stats.total}</strong> users</span>
              <span><strong>{stats.totalPoints}</strong> total pts</span>
              <span>avg <strong>{stats.avg}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-40 bg-base-200 rounded" />
          <div className="h-48 bg-base-200 rounded" />
        </div>
      )}

  {!isLoading && filteredList.length === 0 && (
        <div className="p-10 border border-dashed border-base-300 rounded text-center text-sm">No users match current filters.</div>
      )}

  {!isLoading && filteredList.length > 0 && view === 'table' && (
        <div className="overflow-x-auto border border-base-300 rounded">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/70">
                <th className="w-6"><input type="checkbox" className="checkbox checkbox-xs" checked={isAllSelected} onChange={toggleSelectAll} /></th>
                <th className="cursor-pointer" onClick={()=>toggleSort('name')}>Name {sortKey==='name' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer" onClick={()=>toggleSort('email')}>Email {sortKey==='email' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="w-28 cursor-pointer text-center" onClick={()=>toggleSort('points')}>Points {sortKey==='points' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="w-32 cursor-pointer" onClick={()=>toggleSort('tier')}>Tier {sortKey==='tier' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(u => (
                <tr key={u._id} className={selected.includes(u._id) ? 'bg-primary/5' : ''}>
                  <td><input type="checkbox" className="checkbox checkbox-xs" checked={!!selected.includes(u._id)} onChange={()=>toggleSelect(u._id)} /></td>
                  <td className="max-w-[160px] truncate" title={u.name}>{u.name}</td>
                  <td className="max-w-[200px] truncate" title={u.email}>{u.email}</td>
                  <td className="text-center">
                    {editing === u._id ? (
                      <input className="input input-xs input-bordered w-20" type="number" value={form.points} onChange={e=>setForm(f=>({...f, points: e.target.value}))} />
                    ) : (
                      u.loyaltyPoints ?? 0
                    )}
                  </td>
                  <td>
                    {editing === u._id ? (
                      <input className="input input-xs input-bordered w-24" value={form.tier} onChange={e=>setForm(f=>({...f, tier: e.target.value}))} />
                    ) : (
                      u.loyaltyTier || <span className="opacity-40">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    {editing === u._id ? (
                      <div className="flex gap-1 justify-end">
                        <button onClick={()=>saveEdit(u._id)} className="btn btn-primary btn-xs">Save</button>
                        <button onClick={()=>setEditing(null)} className="btn btn-ghost btn-xs">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>beginEdit(u)} className="btn btn-ghost btn-xs">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

  {!isLoading && filteredList.length > 0 && view === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredList.map(u => (
            <div key={u._id} className={`p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm relative group transition-all hover:bg-white/60 ${selected.includes(u._id) ? 'ring-2 ring-primary bg-white/80' : ''}`}>
               <div className="absolute top-4 right-4">
                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={selected.includes(u._id)} onChange={()=>toggleSelect(u._id)} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {u.name?.charAt(0).toUpperCase() || 'L'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-0.5">Heritage Member</div>
                    <div className="font-bold text-sm text-primary truncate" title={u.name}>{u.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary/5">
                  <div className="flex flex-col">
                    <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1">Vault Points</div>
                    {editing === u._id ? (
                      <input className="input input-xs input-bordered w-full font-bold text-primary" type="number" value={form.points} onChange={e=>setForm(f=>({...f, points: e.target.value}))} />
                    ) : (
                      <span className="font-black text-primary text-base">{u.loyaltyPoints ?? 0}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-right">
                    <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1">Current Tier</div>
                    {editing === u._id ? (
                      <input className="input input-xs input-bordered w-full text-right font-bold text-gray-600" value={form.tier} onChange={e=>setForm(f=>({...f, tier: e.target.value}))} />
                    ) : (
                      <span className="font-bold text-gray-600 uppercase text-[10px] tracking-widest">{u.loyaltyTier || 'Novice'}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {editing === u._id ? (
                    <>
                      <button onClick={()=>saveEdit(u._id)} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all">Archive Save</button>
                      <button onClick={()=>setEditing(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-gray-400 rounded-xl">Dismiss</button>
                    </>
                  ) : (
                    <button onClick={()=>beginEdit(u)} className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 rounded-xl hover:bg-primary/10 transition-colors">Adjust Credentials</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
