'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@/lib/models/UserModel';
import { formatId } from '@/lib/utils';

export default function Users() {
  const { data: users, error, isLoading, mutate } = useSWR(`/api/admin/users`);
  // Realtime updates via SSE (reuse existing admin events stream)
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    const es = new EventSource('/api/admin/realtime');
    esRef.current = es;
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      try {
        const evt = JSON.parse(e.data);
        if (evt.type === 'user.updated' || evt.type === 'user.deleted') {
          mutate(); // refetch users
        }
      } catch {}
    };
    es.addEventListener('admin', handler as any);
    return () => {
      es.removeEventListener('admin', handler as any);
      es.close();
    };
  }, [mutate]);

  function exportCsv() {
    if (!filtered.length) {
      toast.error('Nothing to export');
      return;
    }
    const headers = ['id','name','email','isAdmin'];
    const rows = filtered.map(u => [u._id, escapeCsv(u.name||''), escapeCsv(u.email||''), u.isAdmin ? 'YES' : 'NO']);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }

  function escapeCsv(value: string) {
    if (/[",\n]/.test(value)) {
      return '"' + value.replace(/"/g,'""') + '"';
    }
    return value;
  }
  const { trigger: deleteUser, isMutating: deleting } = useSWRMutation(
    `/api/admin/users`,
    async (url, { arg }: { arg: { userId: string } }) => {
      const toastId = toast.loading('Deleting user...');
      const res = await fetch(`${url}/${arg.userId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      res.ok ? toast.success('User deleted', { id: toastId }) : toast.error(data.message || 'Delete failed', { id: toastId });
    },
  );

  const { trigger: updateUserQuick } = useSWRMutation(
    `/api/admin/users/updateQuick`,
    async (_url, { arg }: { arg: { userId: string; isAdmin: boolean } }) => {
      const res = await fetch(`/api/admin/users/${arg.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: arg.isAdmin, name: arg.isAdmin ? undefined : undefined, email: undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.message || 'Update failed');
      }
    }
  );

  const [selected, setSelected] = useState<string[]>([]);
  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }
  function toggleSelectAll() {
    if (allSelected) setSelected([]); else setSelected(filtered.map(u=>u._id));
  }
  async function bulkDelete() {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} user(s)?`)) return;
    for (const id of selected) {
      await deleteUser({ userId: id });
    }
    setSelected([]);
  }

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [view, setView] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'));

  const filtered: User[] = useMemo(() => {
    if (!users) return [];
    return users.filter((u: User) => {
      const s = search.toLowerCase();
      const matches = !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || formatId(u._id).toLowerCase().includes(s);
      const roleOk = roleFilter === 'all' || (roleFilter === 'admin' ? u.isAdmin : !u.isAdmin);
      return matches && roleOk;
    });
  }, [users, search, roleFilter]);

  const allSelected = selected.length > 0 && filtered.length > 0 && selected.length === filtered.length;

  const stats = useMemo(() => {
    const total = users?.length || 0;
    const admins = users?.filter((u: User) => u.isAdmin).length || 0;
    const members = total - admins;
    return { total, admins, members };
  }, [users]);

  function handleDelete(id: string) {
    if (confirm('Delete this user?')) deleteUser({ userId: id });
  }
  function handleToggleAdmin(u: User) {
    const next = !u.isAdmin;
    // optimistic update
  mutate((prev: any) => prev?.map((p: User) => p._id === u._id ? { ...p, isAdmin: next } : p), { revalidate: false });
    updateUserQuick({ userId: u._id, isAdmin: next });
  }

  const LoadingSkeleton = (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-base-200 rounded w-40" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-base-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-base-200 rounded" />
    </div>
  );

  if (error) return <div className="p-4 text-error">Failed to load users.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className='text-2xl font-bold tracking-tight'>Users</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="stats shadow hidden md:grid">
            <div className="stat p-3">
              <div className="stat-title">Total</div>
              <div className="stat-value text-base">{stats.total}</div>
            </div>
            <div className="stat p-3">
              <div className="stat-title">Admins</div>
              <div className="stat-value text-base text-primary">{stats.admins}</div>
            </div>
            <div className="stat p-3">
              <div className="stat-title">Members</div>
              <div className="stat-value text-base">{stats.members}</div>
            </div>
          </div>
          <div className="join">
            <button className={`btn btn-xs sm:btn-sm join-item ${view==='table'?'btn-primary':''}`} onClick={()=>setView('table')}>Table</button>
            <button className={`btn btn-xs sm:btn-sm join-item ${view==='cards'?'btn-primary':''}`} onClick={()=>setView('cards')}>Cards</button>
          </div>
          <button onClick={exportCsv} className="btn btn-xs sm:btn-sm btn-outline">Export CSV</button>
          {selected.length > 0 && (
            <button onClick={bulkDelete} className="btn btn-xs sm:btn-sm btn-error">Delete Selected ({selected.length})</button>
          )}
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 sm:p-5 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="sm:w-64">
              <label className="label p-0 mb-1 text-xs uppercase tracking-wide">Search</label>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email or id" className="input input-sm input-bordered w-full" />
            </div>
            <div className="sm:w-40">
              <label className="label p-0 mb-1 text-xs uppercase tracking-wide">Role</label>
              <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as any)} className="select select-sm select-bordered w-full">
                <option value='all'>All</option>
                <option value='admin'>Admins</option>
                <option value='user'>Members</option>
              </select>
            </div>
            <div className="flex gap-2 flex-wrap items-center text-xs opacity-60">
              <span><strong>{filtered.length}</strong> showing</span>
              <span className="hidden sm:inline">•</span>
              <span>{stats.admins} admin(s)</span>
              <span className="hidden sm:inline">•</span>
              <span>{stats.members} member(s)</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading && LoadingSkeleton}

      {!isLoading && filtered.length === 0 && (
        <div className="p-8 border border-dashed border-base-300 rounded text-center text-sm space-y-2">
          <div>🙈 No users found with current filters.</div>
          {search && <button className="btn btn-xs" onClick={()=>setSearch('')}>Clear search</button>}
        </div>
      )}

      {!isLoading && filtered.length > 0 && view === 'table' && (
        <div className='overflow-x-auto rounded border border-base-300'>
          <table className='table table-sm md:table-md'>
            <thead>
              <tr className="bg-base-200/60">
                <th className="w-6"><input type="checkbox" className="checkbox checkbox-xs" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th className="w-24">ID</th>
                <th>Name</th>
                <th>Email</th>
                <th className="text-center w-20">Admin</th>
                <th className="w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: User) => (
                <tr key={user._id} className={"hover " + (selected.includes(user._id) ? 'bg-primary/5' : '')}>
                  <td><input type="checkbox" className="checkbox checkbox-xs" checked={selected.includes(user._id)} onChange={()=>toggleSelect(user._id)} /></td>
                  <td className="font-mono text-xs">{formatId(user._id)}</td>
                  <td className="max-w-[160px] md:max-w-none truncate">{user.name}</td>
                  <td className="max-w-[200px] md:max-w-none truncate">{user.email}</td>
                  <td className="text-center">
                    <button onClick={()=>handleToggleAdmin(user)} className={`badge badge-xs md:badge-sm cursor-pointer ${user.isAdmin ? 'badge-primary' : 'badge-ghost'}`}>{user.isAdmin ? 'YES' : 'NO'}</button>
                  </td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/users/${user._id}`} className='btn btn-ghost btn-xs md:btn-sm'>Edit</Link>
                      <button disabled={deleting} onClick={() => handleDelete(user._id)} className='btn btn-ghost btn-xs md:btn-sm'>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length > 0 && view === 'cards' && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered.map((u: User) => (
            <div key={u._id} className={`card bg-base-100 border border-base-300 shadow-sm relative ${selected.includes(u._id) ? 'ring-2 ring-primary' : ''}`}>
              <div className="absolute top-2 left-2">
                <input type="checkbox" className="checkbox checkbox-xs" checked={selected.includes(u._id)} onChange={()=>toggleSelect(u._id)} />
              </div>
              <div className="card-body p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold truncate" title={u.name}>{u.name}</div>
                    <div className="text-xs font-mono opacity-70 truncate">{formatId(u._id)}</div>
                    <div className="text-xs break-all leading-tight opacity-80 line-clamp-2" title={u.email}>{u.email}</div>
                  </div>
                  <div>
                    <button onClick={()=>handleToggleAdmin(u)} className={`badge cursor-pointer ${u.isAdmin ? 'badge-primary' : 'badge-ghost'}`}>{u.isAdmin ? 'Admin' : 'Member'}</button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href={`/admin/users/${u._id}`} className='btn btn-xs btn-outline'>Edit</Link>
                  <button disabled={deleting} onClick={()=>handleDelete(u._id)} className='btn btn-xs btn-outline btn-error'>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
