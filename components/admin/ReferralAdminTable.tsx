"use client";
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';
import toast from 'react-hot-toast';

// Lightweight SSE subscription hook (mirrors pattern used elsewhere)
function useAdminEvents(eventTypes: string[], onAny: () => void) {
  useEffect(() => {
    const src = new EventSource('/api/admin/realtime');
    const handler = (e: MessageEvent) => {
      try {
        const evt = JSON.parse(e.data);
        if (evt && eventTypes.includes(evt.type)) onAny();
      } catch {}
    };
    // 'message' will receive events without named type; our stream uses 'event: admin'
    // so we also attach to 'admin' via addEventListener
    (src as any).addEventListener('admin', handler);
    return () => {
      (src as any).removeEventListener('admin', handler);
      src.close();
    };
  }, [eventTypes, onAny]);
}

type UserReferralRow = {
  _id: string;
  name: string;
  email: string;
  referralCode?: string;
  referredBy?: string;
  referralCredits?: number;
  referralHistory?: Array<{ _id?: string; referredUserId: string; referredUserEmail?: string; reward: number; date?: string; orderId?: string }>; 
};

type SortKey = 'name' | 'email' | 'credits' | 'history';

export default function ReferralAdminTable() {
  const { data, error, mutate, isLoading } = useSWR<UserReferralRow[]>('/api/admin/referral');
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState(''); // debounced
  const [minCredits, setMinCredits] = useState('');
  const [view, setView] = useState<'table'|'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 700 ? 'cards' : 'table'));
  const [sortKey, setSortKey] = useState<SortKey>('credits');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDelta, setBulkDelta] = useState('');
  const [showHistoryUser, setShowHistoryUser] = useState<UserReferralRow | null>(null);
  const [adjustForm, setAdjustForm] = useState<{ userId?: string; amount: string }>({ amount: '' });
  const [referrerForm, setReferrerForm] = useState<{ userId?: string; code: string }>({ code: '' });
  const [historyForm, setHistoryForm] = useState<{ userId?: string; referredUserId: string; email?: string; reward: string; orderId?: string }>({ referredUserId: '', reward: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const optimisticRef = useRef<UserReferralRow[] | null>(null);

  // Debounce search input
  useEffect(() => { const t = setTimeout(()=>setSearch(rawSearch), 250); return ()=>clearTimeout(t); }, [rawSearch]);

  // Realtime auto refresh
  useAdminEvents(['referral.updated'], () => mutate());

  const filtered = useMemo(() => {
    const baseList = data || [];
    const q = search.toLowerCase();
    const min = minCredits ? Number(minCredits) : null;
    return baseList.filter(u => {
      if (min !== null && (u.referralCredits || 0) < min) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.referralCode || '').toLowerCase().includes(q) ||
        (u.referredBy || '').toLowerCase().includes(q)
      );
    }).sort((a,b)=>{
      let av:any; let bv:any;
      if (sortKey==='credits'){ av = a.referralCredits||0; bv = b.referralCredits||0; }
      else if (sortKey==='history'){ av = a.referralHistory?.length||0; bv = b.referralHistory?.length||0; }
      else av = (a as any)[sortKey];
      if (sortKey==='name' || sortKey==='email') { av = (av||'').toLowerCase(); bv = ((b as any)[sortKey]||'').toLowerCase(); }
      if (av < bv) return sortDir==='asc' ? -1 : 1;
      if (av > bv) return sortDir==='asc' ? 1 : -1;
      return 0;
    });
  }, [data, search, minCredits, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const withCode = filtered.filter(u => !!u.referralCode).length;
    const totalCredits = filtered.reduce((sum, u) => sum + (u.referralCredits || 0), 0);
    const totalHistoryEntries = filtered.reduce((sum,u)=> sum + (u.referralHistory?.length || 0), 0);
    const topRef = filtered.slice().sort((a,b)=> (b.referralHistory?.length||0) - (a.referralHistory?.length||0))[0];
    return { total, withCode, totalCredits, avgCredits: total? +(totalCredits/total).toFixed(2):0, totalHistoryEntries, topRefName: topRef?.name, topRefCount: topRef?.referralHistory?.length||0 };
  }, [filtered]);

  const isAllSelected = selected.length>0 && selected.length === filtered.length;
  const toggleSelect = (id:string) => setSelected(s => s.includes(id)? s.filter(x=>x!==id) : [...s,id]);
  const toggleSelectAll = () => setSelected(isAllSelected? [] : filtered.map(u=>u._id));
  // Persistent expanded rows (multi) stored in localStorage for resilience across refreshes
  const [expandedRows, setExpandedRows] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try { const raw = localStorage.getItem('referralExpandedRows'); if (raw) return JSON.parse(raw); } catch {}
    }
    return [];
  });
  useEffect(()=>{ if (typeof window !== 'undefined') { try { localStorage.setItem('referralExpandedRows', JSON.stringify(expandedRows)); } catch {} } }, [expandedRows]);
  const toggleExpand = (id:string) => setExpandedRows(r => r.includes(id) ? r.filter(x=>x!==id) : [...r, id]);

  const toggleSort = (k: SortKey) => { if (k===sortKey) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir(k==='name'?'asc':'desc'); } };

  function exportCSV() {
    if (!filtered.length) return toast.error('Nothing to export');
    const headers = ['Name','Email','ReferralCode','ReferredBy','Credits','HistoryCount'];
    const rows = filtered.map(u => [u.name, u.email, u.referralCode || '', u.referredBy || '', String(u.referralCredits || 0), String(u.referralHistory?.length || 0)]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"'+v.replace(/"/g,'""')+'"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='referrals.csv'; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }

  const updateRowOptimistic = useCallback((userId:string, mutator:(u:UserReferralRow)=>void) => {
    mutate(prev => {
      if (!prev) return prev;
      optimisticRef.current = prev;
      return prev.map(u => u._id===userId ? ({ ...u, ...(()=>{ const clone={...u}; mutator(clone); return clone; })() }) : u);
    }, { revalidate:false });
  }, [mutate]);

  async function callAction(body: any, opts?: { optimistic?: (u:UserReferralRow)=>void; successMsg?: string }) {
    const key = body.userId + ':' + body.action;
    setBusy(key);
    if (opts?.optimistic && body.userId) updateRowOptimistic(body.userId, opts.optimistic);
    try {
      const res = await fetch('/api/admin/referral', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Action failed');
      if (opts?.successMsg) toast.success(opts.successMsg); else toast.success('Updated');
      mutate();
    } catch (e:any) {
      toast.error(e.message || 'Failed');
      // rollback
      if (optimisticRef.current) mutate(optimisticRef.current, { revalidate:false });
    } finally {
      setBusy(null);
    }
  }

  async function applyBulkDelta() {
    if (!bulkDelta.trim()) return toast.error('Enter delta');
    const num = Number(bulkDelta);
    if (!Number.isFinite(num) || num===0) return toast.error('Delta invalid');
    if (!selected.length) return toast.error('No users');
    for (const id of selected) {
      await callAction({ userId:id, action:'adjustCredits', amount:num }, { optimistic:(u)=>{u.referralCredits=(u.referralCredits||0)+num;}, successMsg:'' });
    }
    toast.success('Bulk adjusted');
    setSelected([]); setBulkDelta('');
  }

  function copyLink(u: UserReferralRow) {
    if (!u.referralCode) return;
    const base = (process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''));
    const link = `${base}/register?ref=${u.referralCode}`;
    navigator.clipboard.writeText(link).then(()=>toast.success('Link copied'));  }

  if (error) return <div className="text-error">Failed to load referral data.</div>;
  if (isLoading || !data) return <div className="animate-pulse space-y-3"><div className="h-8 w-40 bg-base-200 rounded"/><div className="h-48 bg-base-200 rounded"/></div>;

  return (
    <div className="space-y-5">
      {/* Controls Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Search</label>
              <input value={rawSearch} onChange={e=>setRawSearch(e.target.value)} placeholder="Name / email / code / referrer" className="input input-sm input-bordered w-60" />
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Min Credits</label>
              <input value={minCredits} onChange={e=>setMinCredits(e.target.value)} placeholder="0" className="input input-sm input-bordered w-28" />
            </div>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="join">
                <button onClick={()=>setView('table')} className={`btn btn-xs join-item ${view==='table'?'btn-primary':''}`}>Table</button>
                <button onClick={()=>setView('cards')} className={`btn btn-xs join-item ${view==='cards'?'btn-primary':''}`}>Cards</button>
              </div>
              <button className="btn btn-xs btn-outline" onClick={exportCSV}>Export CSV</button>
              <button className="btn btn-xs" onClick={()=>mutate()}>Sync</button>
            </div>
            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <label className="label p-0 mb-1 text-xs uppercase">Bulk ± Credits</label>
                <input value={bulkDelta} onChange={e=>setBulkDelta(e.target.value)} placeholder="e.g. 25" className="input input-sm input-bordered w-28" />
              </div>
              <button disabled={!selected.length || !bulkDelta} className="btn btn-xs btn-accent mt-5" onClick={applyBulkDelta}>Apply ({selected.length})</button>
              {selected.length>0 && <button className="btn btn-xs mt-5" onClick={()=>setSelected([])}>Clear</button>}
            </div>
            <div className="text-xs opacity-70 mt-1 xl:ml-auto flex gap-4 flex-wrap">
              <span><strong>{stats.total}</strong> users</span>
              <span><strong>{stats.withCode}</strong> codes</span>
              <span><strong>{stats.totalCredits}</strong> credits</span>
              <span>avg <strong>{stats.avgCredits}</strong></span>
              <span><strong>{stats.totalHistoryEntries}</strong> rewards</span>
              {stats.topRefName && <span>Top: <strong>{stats.topRefName}</strong> ({stats.topRefCount})</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile summary badges (compact) */}
      <div className="flex sm:hidden flex-wrap gap-2 text-[11px] -mt-2">
        <span className="badge badge-ghost">Users {stats.total}</span>
        <span className="badge badge-ghost">Codes {stats.withCode}</span>
        <span className="badge badge-ghost">Cr {stats.totalCredits}</span>
        <span className="badge badge-ghost">Avg {stats.avgCredits}</span>
        {stats.topRefName && <span className="badge badge-outline">Top {stats.topRefCount}</span>}
      </div>

      {/* Empty state */}
      {filtered.length===0 && (
        <div className="p-10 text-center border border-dashed border-base-300 rounded text-sm">No users match filters.</div>
      )}

      {/* Table View */}
      {filtered.length>0 && view==='table' && (
        <div className="overflow-x-auto border border-base-300 rounded">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/70">
                <th className="w-6 align-middle"><input aria-label="Select all" type="checkbox" className="checkbox checkbox-xs" checked={isAllSelected} onChange={toggleSelectAll} /></th>
                <th className="sm:w-6 align-middle">
                  <span className="sr-only sm:not-sr-only">Expand</span>
                </th>
                <th className="cursor-pointer min-w-[120px]" onClick={()=>toggleSort('name')}>Name {sortKey==='name' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer min-w-[150px] hidden md:table-cell" onClick={()=>toggleSort('email')}>Email {sortKey==='email' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="min-w-[80px]">Code</th>
                <th className="cursor-pointer w-20 text-center" onClick={()=>toggleSort('credits')}>Cr {sortKey==='credits' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer w-20 text-center hidden sm:table-cell" onClick={()=>toggleSort('history')}>Hist {sortKey==='history' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="hidden lg:table-cell">Ref By</th>
                <th className="text-right w-[260px] hidden xl:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>{
                const isSelected = selected.includes(u._id);
                const expanded = expandedRows.includes(u._id);
                return (
                  <Fragment key={u._id}>
                    <tr className={isSelected? 'bg-primary/5':''}>
                      <td><input aria-label={`Select ${u.name}`} type="checkbox" className="checkbox checkbox-xs" checked={isSelected} onChange={()=>toggleSelect(u._id)} /></td>
                      <td className="align-middle sm:hidden">
                        <button
                          type="button"
                          aria-label="Expand row"
                          aria-expanded={expanded}
                          className="btn btn-ghost btn-xs"
                          onClick={()=>toggleExpand(u._id)}
                          onKeyDown={e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleExpand(u._id); } }}
                        >{expanded? '−':'+'}</button>
                      </td>
                      <td className="max-w-[140px] truncate" title={u.name}>{u.name}</td>
                      <td className="max-w-[180px] truncate hidden md:table-cell" title={u.email}>{u.email}</td>
                      <td className="text-xs">
                        {u.referralCode ? (
                          <span className="badge badge-sm badge-outline cursor-pointer" onClick={()=>copyLink(u)} title="Copy referral link">{u.referralCode}</span>
                        ) : (
                          <button disabled={busy===u._id+':generateCode'} className="btn btn-ghost btn-xs" onClick={()=>callAction({ userId:u._id, action:'generateCode' }, { optimistic:(x)=>{ x.referralCode='…'; }, successMsg:'Code generated' })}>Gen</button>
                        )}
                      </td>
                      <td className="text-center font-mono text-xs">{u.referralCredits||0}</td>
                      <td className="text-center hidden sm:table-cell">
                        <button className="btn btn-ghost btn-xs" onClick={()=>setShowHistoryUser(u)}>{u.referralHistory?.length||0}</button>
                      </td>
                      <td className="text-xs max-w-[100px] truncate hidden lg:table-cell" title={u.referredBy}>{u.referredBy || <span className="opacity-40">-</span>}</td>
                      <td className="text-right hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 justify-end">
                          <div className="join">
                            <input disabled={busy===u._id+':adjustCredits'} type="number" placeholder="±" className="input input-xs input-bordered join-item w-16" value={adjustForm.userId===u._id?adjustForm.amount:''} onChange={e=>setAdjustForm({ userId:u._id, amount:e.target.value })} />
                            <button disabled={busy===u._id+':adjustCredits'||adjustForm.userId!==u._id||!adjustForm.amount} className="btn btn-xs join-item" onClick={()=>{ const amt=Number(adjustForm.amount); if(!amt) return; callAction({ userId:u._id, action:'adjustCredits', amount:amt }, { optimistic:(x)=>{ x.referralCredits=(x.referralCredits||0)+amt; }, successMsg:'Credits updated' }); setAdjustForm({ amount:'', userId:undefined }); }}>Go</button>
                          </div>
                          <div className="join">
                            <input disabled={busy===u._id+':setReferredBy'} placeholder="ref" className="input input-xs input-bordered join-item w-20" value={referrerForm.userId===u._id?referrerForm.code:''} onChange={e=>setReferrerForm({ userId:u._id, code:e.target.value })} />
                            <button disabled={busy===u._id+':setReferredBy'||referrerForm.userId!==u._id||!referrerForm.code} className="btn btn-xs join-item" onClick={()=>{ const code=referrerForm.code.trim(); if(!code) return; callAction({ userId:u._id, action:'setReferredBy', referredByCodeOrEmail:code }, { optimistic:(x)=>{ x.referredBy=code; }, successMsg:'Referrer set' }); setReferrerForm({ userId:undefined, code:'' }); }}>Set</button>
                          </div>
                          <div className="join">
                            <input disabled={busy===u._id+':addHistoryEntry'} placeholder="user" className="input input-xs input-bordered join-item w-20" value={historyForm.userId===u._id?historyForm.referredUserId:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, referredUserId:e.target.value }))} />
                            <input disabled={busy===u._id+':addHistoryEntry'} placeholder="rw" className="input input-xs input-bordered join-item w-16" value={historyForm.userId===u._id?historyForm.reward:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, reward:e.target.value }))} />
                            <button disabled={busy===u._id+':addHistoryEntry'||historyForm.userId!==u._id||!historyForm.referredUserId||!historyForm.reward} className="btn btn-xs join-item" onClick={()=>{ const reward=Number(historyForm.reward); if(!reward) return; callAction({ userId:u._id, action:'addHistoryEntry', history:{ referredUserId:historyForm.referredUserId, reward } }, { optimistic:(x)=>{ x.referralHistory=[...(x.referralHistory||[]), { referredUserId:historyForm.referredUserId, reward, date:new Date().toISOString() }]; x.referralCredits=(x.referralCredits||0)+reward; }, successMsg:'History added' }); setHistoryForm({ userId:undefined, referredUserId:'', reward:'' }); }}>Add</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Mobile expanded panel */}
                    <tr className="sm:hidden">
                      <td colSpan={10} className="p-0">
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? 'max-h-[420px] opacity-100 mt-1 px-3 pb-4 pt-2 bg-base-200/40' : 'max-h-0 opacity-0'} `}>
                          <div className="flex gap-3 flex-wrap mb-2">
                            <button className="btn btn-ghost btn-xs" onClick={()=>setShowHistoryUser(u)}>History ({u.referralHistory?.length||0})</button>
                            {!u.referralCode && <button disabled={busy===u._id+':generateCode'} className="btn btn-xs" onClick={()=>callAction({ userId:u._id, action:'generateCode' }, { optimistic:(x)=>{ x.referralCode='…'; }, successMsg:'Code generated' })}>Generate Code</button>}
                            {u.referralCode && <button className="btn btn-ghost btn-xs" onClick={()=>copyLink(u)}>Copy Link</button>}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="join w-full">
                              <input disabled={busy===u._id+':adjustCredits'} type="number" placeholder="±credits" className="input input-xs input-bordered join-item w-28" value={adjustForm.userId===u._id?adjustForm.amount:''} onChange={e=>setAdjustForm({ userId:u._id, amount:e.target.value })} />
                              <button disabled={busy===u._id+':adjustCredits'||adjustForm.userId!==u._id||!adjustForm.amount} className="btn btn-xs join-item" onClick={()=>{ const amt=Number(adjustForm.amount); if(!amt) return; callAction({ userId:u._id, action:'adjustCredits', amount:amt }, { optimistic:(x)=>{ x.referralCredits=(x.referralCredits||0)+amt; }, successMsg:'Credits updated' }); setAdjustForm({ amount:'', userId:undefined }); }}>Apply</button>
                            </div>
                            <div className="join w-full">
                              <input disabled={busy===u._id+':setReferredBy'} placeholder="referrer code/email" className="input input-xs input-bordered join-item" value={referrerForm.userId===u._id?referrerForm.code:''} onChange={e=>setReferrerForm({ userId:u._id, code:e.target.value })} />
                              <button disabled={busy===u._id+':setReferredBy'||referrerForm.userId!==u._id||!referrerForm.code} className="btn btn-xs join-item" onClick={()=>{ const code=referrerForm.code.trim(); if(!code) return; callAction({ userId:u._id, action:'setReferredBy', referredByCodeOrEmail:code }, { optimistic:(x)=>{ x.referredBy=code; }, successMsg:'Referrer set' }); setReferrerForm({ userId:undefined, code:'' }); }}>Set</button>
                            </div>
                            <div className="join w-full">
                              <input disabled={busy===u._id+':addHistoryEntry'} placeholder="referred user id" className="input input-xs input-bordered join-item" value={historyForm.userId===u._id?historyForm.referredUserId:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, referredUserId:e.target.value }))} />
                              <input disabled={busy===u._id+':addHistoryEntry'} placeholder="reward" className="input input-xs input-bordered join-item w-24" value={historyForm.userId===u._id?historyForm.reward:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, reward:e.target.value }))} />
                              <button disabled={busy===u._id+':addHistoryEntry'||historyForm.userId!==u._id||!historyForm.referredUserId||!historyForm.reward} className="btn btn-xs join-item" onClick={()=>{ const reward=Number(historyForm.reward); if(!reward) return; callAction({ userId:u._id, action:'addHistoryEntry', history:{ referredUserId:historyForm.referredUserId, reward } }, { optimistic:(x)=>{ x.referralHistory=[...(x.referralHistory||[]), { referredUserId:historyForm.referredUserId, reward, date:new Date().toISOString() }]; x.referralCredits=(x.referralCredits||0)+reward; }, successMsg:'History added' }); setHistoryForm({ userId:undefined, referredUserId:'', reward:'' }); }}>Add</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {filtered.length>0 && view==='cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(u=>{
            const isSelected = selected.includes(u._id);
            return (
              <div key={u._id} className={`card bg-base-100 border border-base-300 shadow-sm relative ${isSelected?'ring-2 ring-primary':''}`}>
                <div className="absolute top-2 left-2">
                  <input type="checkbox" className="checkbox checkbox-xs" checked={isSelected} onChange={()=>toggleSelect(u._id)} />
                </div>
                <div className="card-body p-4 space-y-3">
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold truncate" title={u.name}>{u.name}</div>
                    <div className="text-xs truncate opacity-70" title={u.email}>{u.email}</div>
                    <div className="flex flex-wrap gap-2 items-center text-xs">
                      {u.referralCode ? <span className="badge badge-outline" onClick={()=>copyLink(u)} title="Copy link">{u.referralCode}</span> : <button disabled={busy===u._id+':generateCode'} className="btn btn-ghost btn-xs" onClick={()=>callAction({ userId:u._id, action:'generateCode' }, { optimistic:(x)=>{ x.referralCode='…'; }, successMsg:'Code generated' })}>Code</button>}
                      <span className="badge badge-sm">{u.referralCredits||0} cr</span>
                      <span className="badge badge-sm badge-ghost">{u.referralHistory?.length||0} hist</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="opacity-60">Ref By: {u.referredBy || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="join w-full">
                      <input type="number" placeholder="±" className="input input-xs input-bordered join-item w-20" value={adjustForm.userId===u._id?adjustForm.amount:''} onChange={e=>setAdjustForm({ userId:u._id, amount:e.target.value })} />
                      <button disabled={busy===u._id+':adjustCredits'||adjustForm.userId!==u._id||!adjustForm.amount} className="btn btn-xs join-item" onClick={()=>{ const amt=Number(adjustForm.amount); if(!amt) return; callAction({ userId:u._id, action:'adjustCredits', amount:amt }, { optimistic:(x)=>{ x.referralCredits=(x.referralCredits||0)+amt; }, successMsg:'Credits updated' }); setAdjustForm({ amount:'', userId:undefined }); }}>Go</button>
                    </div>
                    <div className="join w-full">
                      <input placeholder="referrer" className="input input-xs input-bordered join-item w-24" value={referrerForm.userId===u._id?referrerForm.code:''} onChange={e=>setReferrerForm({ userId:u._id, code:e.target.value })} />
                      <button disabled={busy===u._id+':setReferredBy'||referrerForm.userId!==u._id||!referrerForm.code} className="btn btn-xs join-item" onClick={()=>{ const code=referrerForm.code.trim(); if(!code) return; callAction({ userId:u._id, action:'setReferredBy', referredByCodeOrEmail:code }, { optimistic:(x)=>{ x.referredBy=code; }, successMsg:'Referrer set' }); setReferrerForm({ userId:undefined, code:'' }); }}>Set</button>
                    </div>
                    <div className="join w-full">
                      <input placeholder="ref user" className="input input-xs input-bordered join-item w-24" value={historyForm.userId===u._id?historyForm.referredUserId:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, referredUserId:e.target.value }))} />
                      <input placeholder="reward" className="input input-xs input-bordered join-item w-20" value={historyForm.userId===u._id?historyForm.reward:''} onChange={e=>setHistoryForm(h=>({...h, userId:u._id, reward:e.target.value }))} />
                      <button disabled={busy===u._id+':addHistoryEntry'||historyForm.userId!==u._id||!historyForm.referredUserId||!historyForm.reward} className="btn btn-xs join-item" onClick={()=>{ const reward=Number(historyForm.reward); if(!reward) return; callAction({ userId:u._id, action:'addHistoryEntry', history:{ referredUserId:historyForm.referredUserId, reward } }, { optimistic:(x)=>{ x.referralHistory=[...(x.referralHistory||[]), { referredUserId:historyForm.referredUserId, reward, date:new Date().toISOString() }]; x.referralCredits=(x.referralCredits||0)+reward; }, successMsg:'History added' }); setHistoryForm({ userId:undefined, referredUserId:'', reward:'' }); }}>Add</button>
                    </div>
                    <button className="btn btn-ghost btn-xs" onClick={()=>setShowHistoryUser(u)}>History</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Modal */}
      {showHistoryUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-2">Referral History - {showHistoryUser.name}</h3>
            <div className="text-xs mb-2 opacity-70 flex gap-4 flex-wrap">
              <span>Total Entries: {showHistoryUser.referralHistory?.length || 0}</span>
              <span>Total Reward: {(showHistoryUser.referralHistory||[]).reduce((s,h)=>s+h.reward,0)}</span>
              {showHistoryUser.referralHistory?.length ? <span>Last: {new Date(showHistoryUser.referralHistory.slice(-1)[0].date || Date.now()).toLocaleDateString()}</span> : null}
            </div>
            <div className="max-h-80 overflow-auto text-xs divide-y">
              {(showHistoryUser.referralHistory||[]).slice().reverse().map((h,i)=>(
                <div key={i} className="py-1 flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono truncate" title={h.referredUserId}>{h.referredUserId}</div>
                    {h.referredUserEmail && <div className="opacity-70 truncate" title={h.referredUserEmail}>{h.referredUserEmail}</div>}
                    {h.orderId && <div className="opacity-60">Order: {h.orderId}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">+{h.reward}</div>
                    <div className="opacity-60">{h.date ? new Date(h.date).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              ))}
              {!showHistoryUser.referralHistory?.length && <div className="py-6 text-center opacity-50">No history yet</div>}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={()=>setShowHistoryUser(null)}>Close</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
