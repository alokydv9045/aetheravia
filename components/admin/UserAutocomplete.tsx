"use client";
import useSWR from 'swr';
import { useState } from 'react';

export default function UserAutocomplete({ selected, setSelected }: { selected: string[]; setSelected: (ids: string[]) => void }) {
  const { data, error } = useSWR('/api/admin/users');
  const [query, setQuery] = useState('');

  if (error) return <div className="text-error">Failed to load users.</div>;
  if (!data) return <div>Loading users...</div>;

  const filtered = data.filter((u: any) =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input
        className="input input-bordered input-sm w-full mb-2"
        placeholder="Search users by name or email"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto border rounded bg-base-100">
        {filtered.map((user: any) => (
          <label key={user._id} className="flex items-center px-2 py-1 cursor-pointer hover:bg-base-200">
            <input
              type="checkbox"
              className="checkbox checkbox-xs mr-2"
              checked={selected.includes(user._id)}
              onChange={e => {
                if (e.target.checked) setSelected([...selected, user._id]);
                else setSelected(selected.filter(id => id !== user._id));
              }}
            />
            <span>{user.name} <span className="text-xs opacity-60">({user.email})</span></span>
          </label>
        ))}
        {filtered.length === 0 && <div className="px-2 py-1 text-xs">No users found.</div>}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 text-xs">
          Selected: {selected.length} user{selected.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
