"use client";
import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface PersonalizationUser {
  _id: string;
  name: string;
  email: string;
  personalization?: {
    segments?: string[];
    tags?: string[];
    scores?: Record<string, number>;
    lastUpdated?: string;
    history?: Array<{ date: string; change: string; segments?: string[]; tags?: string[] }>;
  };
}

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
type SortKey = 'name' | 'email' | 'segments' | 'tags' | 'scores';

export default function PersonalizationAdminTable() {
  const { data, error, mutate, isLoading } = useSWR<PersonalizationUser[]>('/api/admin/personalization');
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>(() => (typeof window !== 'undefined' && window.innerWidth < 680 ? 'cards' : 'table'));
  const [sortKey, setSortKey] = useState<SortKey>('segments');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editSeg, setEditSeg] = useState<{ id?: string; value: string }>({ value: '' });
  const [editTags, setEditTags] = useState<{ id?: string; value: string }>({ value: '' });
  const [editScores, setEditScores] = useState<{ id?: string; key: string; val: string }>({ key: '', val: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const optimisticRef = useRef<PersonalizationUser[] | null>(null);

  // Debounce search
  useEffect(() => { const t = setTimeout(()=>setSearch(rawSearch), 250); return ()=>clearTimeout(t); }, [rawSearch]);

  useAdminEvents(['personalization.updated'], () => mutate());

  const allTags = useMemo(() => {
    const s = new Set<string>();
    data?.forEach(u => (u.personalization?.tags||[]).forEach(t=>s.add(t)));
    return Array.from(s).sort();
  }, [data]);
  const allSegments = useMemo(() => {
    const s = new Set<string>();
    data?.forEach(u => (u.personalization?.segments||[]).forEach(t=>s.add(t)));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter(u => {
      if (q) {
        const p = u.personalization || {};
        const hit = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
          (p.segments||[]).some(s=>s.toLowerCase().includes(q)) ||
          (p.tags||[]).some(t=>t.toLowerCase().includes(q)) ||
          Object.keys(p.scores||{}).some(k=>k.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (tagFilter !== 'all' && !(u.personalization?.tags||[]).includes(tagFilter)) return false;
      if (segmentFilter !== 'all' && !(u.personalization?.segments||[]).includes(segmentFilter)) return false;
      return true;
    }).sort((a,b)=>{
      const ap = a.personalization || {}; const bp = b.personalization || {};
      let av:any; let bv:any;
      if (sortKey==='segments'){ av = ap.segments?.length||0; bv = bp.segments?.length||0; }
      else if (sortKey==='tags'){ av = ap.tags?.length||0; bv = bp.tags?.length||0; }
      else if (sortKey==='scores'){ av = Object.keys(ap.scores||{}).length; bv = Object.keys(bp.scores||{}).length; }
      else { av = (a as any)[sortKey]; bv = (b as any)[sortKey]; av = (av||'').toLowerCase(); bv = (bv||'').toLowerCase(); }
      if (av < bv) return sortDir==='asc'? -1:1; if (av>bv) return sortDir==='asc'?1:-1; return 0;
    });
  }, [data, search, tagFilter, segmentFilter, sortKey, sortDir]);

  const stats = useMemo(()=>{
    const total = filtered.length;
    let segs=0, tags=0, scores=0;
    filtered.forEach(u=>{ const p=u.personalization||{}; segs += p.segments?.length||0; tags += p.tags?.length||0; scores += Object.keys(p.scores||{}).length; });
    return { total, avgSegments: total? +(segs/total).toFixed(1):0, avgTags: total? +(tags/total).toFixed(1):0, avgScores: total? +(scores/total).toFixed(1):0 };
  }, [filtered]);

  const toggleSort = (k: SortKey) => { if (k===sortKey) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir(k==='name'?'asc':'desc'); } };

  const updateOptimistic = useCallback((id:string, mut:(u:PersonalizationUser)=>void)=>{
    mutate(prev => {
      if (!prev) return prev; optimisticRef.current = prev;
      return prev.map(u=>u._id===id? ({...u, personalization: (()=>{ const clone = { ...(u.personalization||{}) }; mut({ ...u, personalization: clone } as any); return clone; })() }): u);
    }, { revalidate:false });
  }, [mutate]);

  async function action(userId:string, body:any, opts?: { optimistic?: (u:PersonalizationUser)=>void; msg?: string }) {
    setBusy(userId+':'+body.action);
    if (opts?.optimistic) updateOptimistic(userId, opts.optimistic);
    try {
      const res = await fetch('/api/admin/personalization', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, ...body }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error||'Failed');
      toast.success(opts?.msg || 'Updated');
      mutate();
    } catch(e:any) {
      toast.error(e.message || 'Error');
      if (optimisticRef.current) mutate(optimisticRef.current, { revalidate:false });
    } finally { setBusy(null); }
  }

  function exportCsv() {
    if (!filtered.length) return toast.error('Nothing to export');
    const header = ['Name','Email','Segments','Tags','ScoreKeys','Updated'];
    const lines = filtered.map(u => [u.name, u.email, (u.personalization?.segments||[]).join('|'), (u.personalization?.tags||[]).join('|'), Object.keys(u.personalization?.scores||{}).join('|'), u.personalization?.lastUpdated||'']);
    const csv = [header.join(','), ...lines.map(r=>r.map(v=> '"'+v.replace(/"/g,'""')+'"').join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='personalization.csv'; a.click(); URL.revokeObjectURL(url); toast.success('CSV exported');
  }

  if (error) return <div className="text-error">Failed to load personalization data.</div>;
  if (isLoading || !data) return <div className="animate-pulse space-y-3"><div className="h-8 w-40 bg-base-200 rounded"/><div className="h-48 bg-base-200 rounded"/></div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Search</label>
              <input value={rawSearch} onChange={e=>setRawSearch(e.target.value)} placeholder="Name / email / segment / tag / score key" className="input input-sm input-bordered w-72" />
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Tag Filter</label>
              <select value={tagFilter} onChange={e=>setTagFilter(e.target.value)} className="select select-sm select-bordered w-40">
                <option value="all">All tags</option>
                {allTags.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Segment Filter</label>
              <select value={segmentFilter} onChange={e=>setSegmentFilter(e.target.value)} className="select select-sm select-bordered w-40">
                <option value="all">All segments</option>
                {allSegments.map(s=> <option key={s} value={s}>{s}</option>)}
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
            <div className="text-xs opacity-70 flex gap-4 flex-wrap lg:ml-auto">
              <span><strong>{stats.total}</strong> users</span>
              <span>avg seg <strong>{stats.avgSegments}</strong></span>
              <span>avg tags <strong>{stats.avgTags}</strong></span>
              <span>avg scores <strong>{stats.avgScores}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty */}
      {!filtered.length && <div className="p-10 border border-dashed border-base-300 rounded text-center text-sm">No matching users.</div>}

      {/* Table view */}
      {filtered.length>0 && view==='table' && (
        <div className="overflow-x-auto border border-base-300 rounded">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/70">
                <th className="cursor-pointer" onClick={()=>toggleSort('name')}>Name {sortKey==='name' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer" onClick={()=>toggleSort('email')}>Email {sortKey==='email' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer w-28 text-center" onClick={()=>toggleSort('segments')}>Segments {sortKey==='segments' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer w-24 text-center" onClick={()=>toggleSort('tags')}>Tags {sortKey==='tags' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="cursor-pointer w-24 text-center" onClick={()=>toggleSort('scores')}>Scores {sortKey==='scores' && (sortDir==='asc'?'▲':'▼')}</th>
                <th className="w-80">Details / Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>{
                const p = u.personalization || { segments:[], tags:[], scores:{} };
                const segStr = p.segments?.join(', ') || '-';
                const tagStr = p.tags?.join(', ') || '-';
                const scoreCount = Object.keys(p.scores||{}).length;
                return (
                  <tr key={u._id} className={expanded===u._id? 'bg-primary/5':''}>
                    <td className="max-w-[160px] truncate" title={u.name}>{u.name}</td>
                    <td className="max-w-[220px] truncate" title={u.email}>{u.email}</td>
                    <td className="text-center text-xs">{p.segments?.length||0}</td>
                    <td className="text-center text-xs">{p.tags?.length||0}</td>
                    <td className="text-center text-xs">{scoreCount}</td>
                    <td className="text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          <button className="btn btn-ghost btn-xs" onClick={()=>setExpanded(e=> e===u._id? null : u._id)}>{expanded===u._id? 'Hide':'Expand'}</button>
                          {p.lastUpdated && <span className="badge badge-ghost badge-xs">{new Date(p.lastUpdated).toLocaleDateString()}</span>}
                          <button className="btn btn-ghost btn-xs" onClick={()=>toast(p.history?.length? p.history.length+ ' history entries':'No history')}>History</button>
                        </div>
                        {expanded===u._id && (
                          <div className="mt-1 space-y-2">
                            {/* Segments */}
                            <div>
                              <div className="font-semibold mb-1">Segments</div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {p.segments?.map(s => <span key={s} className="badge badge-sm badge-outline">{s}</span>)}
                                {!p.segments?.length && <span className="opacity-40">None</span>}
                              </div>
                              <div className="join w-full">
                                <input placeholder="seg1, seg2" className="input input-xs input-bordered join-item w-48" value={editSeg.id===u._id?editSeg.value:''} onChange={e=>setEditSeg({ id:u._id, value:e.target.value })} />
                                <button disabled={busy===u._id+':setSegments'||editSeg.id!==u._id||!editSeg.value.trim()} className="btn btn-xs join-item" onClick={()=>{ const arr= editSeg.value.split(',').map(x=>x.trim()).filter(Boolean); action(u._id, { action:'setSegments', segments:arr }, { optimistic:(x)=>{ (x.personalization = x.personalization||{}).segments=arr; }, msg:'Segments updated' }); setEditSeg({ id:undefined, value:'' }); }}>Save</button>
                              </div>
                            </div>
                            {/* Tags */}
                            <div>
                              <div className="font-semibold mb-1">Tags</div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {p.tags?.map(t => (
                                  <span key={t} className="badge badge-sm badge-info gap-1">{t}
                                    <button aria-label="remove tag" className="btn btn-ghost btn-xs px-1" onClick={()=>action(u._id,{ action:'removeTag', tag:t }, { optimistic:(x)=>{ x.personalization!.tags = (x.personalization!.tags||[]).filter(tt=>tt!==t); }, msg:'Tag removed' })}>×</button>
                                  </span>
                                ))}
                                {!p.tags?.length && <span className="opacity-40">None</span>}
                              </div>
                              <div className="join w-full">
                                <input placeholder="new tag" className="input input-xs input-bordered join-item w-40" value={editTags.id===u._id?editTags.value:''} onChange={e=>setEditTags({ id:u._id, value:e.target.value })} />
                                <button disabled={busy===u._id+':addTag'||editTags.id!==u._id||!editTags.value.trim()} className="btn btn-xs join-item" onClick={()=>{ const tag= editTags.value.trim(); action(u._id,{ action:'addTag', tag }, { optimistic:(x)=>{ const arr=(x.personalization!.tags||[]); if(!arr.includes(tag)) arr.push(tag); }, msg:'Tag added' }); setEditTags({ id:undefined, value:'' }); }}>Add</button>
                              </div>
                            </div>
                            {/* Scores */}
                            <div>
                              <div className="font-semibold mb-1">Scores</div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {Object.entries(p.scores||{}).map(([k,v]) => (
                                  <span key={k} className="badge badge-sm badge-outline">{k}:{v}</span>
                                ))}
                                {!Object.keys(p.scores||{}).length && <span className="opacity-40">None</span>}
                              </div>
                              <div className="join w-full">
                                <input placeholder="key" className="input input-xs input-bordered join-item w-28" value={editScores.id===u._id?editScores.key:''} onChange={e=>setEditScores(s=>({ ...s, id:u._id, key:e.target.value }))} />
                                <input placeholder="val" className="input input-xs input-bordered join-item w-20" value={editScores.id===u._id?editScores.val:''} onChange={e=>setEditScores(s=>({ ...s, id:u._id, val:e.target.value }))} />
                                <button disabled={busy===u._id+':setScore'||editScores.id!==u._id||!editScores.key.trim()||!editScores.val.trim()} className="btn btn-xs join-item" onClick={()=>{ const key=editScores.key.trim(); const val=Number(editScores.val); if(!Number.isFinite(val)) return toast.error('Invalid number'); action(u._id,{ action:'setScore', scoreKey:key, scoreValue:val }, { optimistic:(x)=>{ (x.personalization!.scores = x.personalization!.scores||{})[key]=val; }, msg:'Score set' }); setEditScores({ id:undefined, key:'', val:'' }); }}>Set</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="opacity-60 truncate">{segStr}</div>
                      <div className="opacity-60 truncate">{tagStr}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {filtered.length>0 && view==='cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(u=>{
            const p=u.personalization||{segments:[], tags:[], scores:{}};
            return (
              <div key={u._id} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4 space-y-3">
                  <div>
                    <div className="font-semibold truncate" title={u.name}>{u.name}</div>
                    <div className="text-xs truncate opacity-70" title={u.email}>{u.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="badge badge-sm">Seg {p.segments?.length||0}</span>
                    <span className="badge badge-sm badge-ghost">Tags {p.tags?.length||0}</span>
                    <span className="badge badge-sm badge-outline">Scores {Object.keys(p.scores||{}).length}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="font-semibold">Segments</div>
                      <div className="flex flex-wrap gap-1 mb-1">{p.segments?.map(s=> <span key={s} className="badge badge-outline badge-sm">{s}</span>) || null}{!p.segments?.length && <span className="opacity-40">None</span>}</div>
                      <div className="join w-full">
                        <input placeholder="seg1,seg2" className="input input-xs input-bordered join-item" value={editSeg.id===u._id?editSeg.value:''} onChange={e=>setEditSeg({ id:u._id, value:e.target.value })} />
                        <button disabled={busy===u._id+':setSegments'||editSeg.id!==u._id||!editSeg.value.trim()} className="btn btn-xs join-item" onClick={()=>{ const arr= editSeg.value.split(',').map(x=>x.trim()).filter(Boolean); action(u._id,{ action:'setSegments', segments:arr }, { optimistic:(x)=>{ (x.personalization=x.personalization||{}).segments=arr; }, msg:'Segments updated' }); setEditSeg({ id:undefined, value:'' }); }}>Go</button>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Tags</div>
                      <div className="flex flex-wrap gap-1 mb-1">{p.tags?.map(t=> <span key={t} className="badge badge-info badge-sm">{t}</span>) || null}{!p.tags?.length && <span className="opacity-40">None</span>}</div>
                      <div className="join w-full">
                        <input placeholder="new tag" className="input input-xs input-bordered join-item" value={editTags.id===u._id?editTags.value:''} onChange={e=>setEditTags({ id:u._id, value:e.target.value })} />
                        <button disabled={busy===u._id+':addTag'||editTags.id!==u._id||!editTags.value.trim()} className="btn btn-xs join-item" onClick={()=>{ const tag= editTags.value.trim(); action(u._id,{ action:'addTag', tag }, { optimistic:(x)=>{ const arr=(x.personalization!.tags||[]); if(!arr.includes(tag)) arr.push(tag); }, msg:'Tag added' }); setEditTags({ id:undefined, value:'' }); }}>Add</button>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Scores</div>
                      <div className="flex flex-wrap gap-1 mb-1">{Object.entries(p.scores||{}).map(([k,v])=> <span key={k} className="badge badge-outline badge-sm">{k}:{v}</span>)}{!Object.keys(p.scores||{}).length && <span className="opacity-40">None</span>}</div>
                      <div className="join w-full">
                        <input placeholder="key" className="input input-xs input-bordered join-item w-24" value={editScores.id===u._id?editScores.key:''} onChange={e=>setEditScores(s=>({ ...s, id:u._id, key:e.target.value }))} />
                        <input placeholder="val" className="input input-xs input-bordered join-item w-20" value={editScores.id===u._id?editScores.val:''} onChange={e=>setEditScores(s=>({ ...s, id:u._id, val:e.target.value }))} />
                        <button disabled={busy===u._id+':setScore'||editScores.id!==u._id||!editScores.key.trim()||!editScores.val.trim()} className="btn btn-xs join-item" onClick={()=>{ const key=editScores.key.trim(); const val=Number(editScores.val); if(!Number.isFinite(val)) return toast.error('Invalid'); action(u._id,{ action:'setScore', scoreKey:key, scoreValue:val }, { optimistic:(x)=>{ (x.personalization!.scores = x.personalization!.scores||{})[key]=val; }, msg:'Score set' }); setEditScores({ id:undefined, key:'', val:'' }); }}>Set</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
