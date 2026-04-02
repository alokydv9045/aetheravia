"use client";
import useSWR from 'swr';
import { useState, useMemo } from 'react';

export default function OffersAdminTable() {
  const { data, error, mutate } = useSWR('/api/admin/offers');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'popup',
    startDate: '',
    endDate: '',
    isActive: true,
    imageUrl: '',
    priority: 1,
    content: '',
  });

  if (error) return <div className="text-error text-sm">Failed to load offers.</div>;
  if (!data) return <div className="text-xs opacity-70 animate-pulse">Loading offers…</div>;

  const offers = data.offers || data; // Handle both new and old API response formats

  const resetForm = () => setForm({
    title: '', description: '', type: 'popup', startDate: '', endDate: '', 
    isActive: true, imageUrl: '', priority: 1, content: ''
  });

  const handleEdit = (offer: any) => {
    setEditing(offer._id);
    setForm({
      title: offer.title,
      description: offer.description || '',
      type: offer.type,
      startDate: offer.startDate?.slice(0, 10) || '',
      endDate: offer.endDate?.slice(0, 10) || '',
      isActive: offer.isActive,
      imageUrl: offer.imageUrl || '',
      priority: offer.priority || 1,
      content: offer.content || '',
    });
  };

  const handleSave = async (offerId?: string) => {
    const method = offerId ? 'PUT' : 'POST';
    const url = '/api/admin/offers';
    const body = offerId ? { offerId, ...form } : form;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setEditing(null);
    resetForm();
    mutate();
  };

  const handleDelete = async (offerId: string) => {
    await fetch('/api/admin/offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),
    });
    mutate();
  };

  return (
    <div className="mt-6" id="offer-form">
      <h2 className="text-sm sm:text-base font-semibold mb-4">Offers</h2>
      {/* Mobile Card List */}
      <ul className="flex flex-col gap-3 sm:hidden" aria-label="Offers list (mobile)">
        {offers.map((offer: any) => (
          <li key={offer._id} className="border rounded-lg bg-base-100 p-3 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium leading-tight truncate max-w-[60%]" title={offer.title}>{offer.title}</span>
              <span className={`badge badge-ghost badge-sm ${offer.type === 'popup' ? 'badge-info' : offer.type === 'banner' ? 'badge-warning' : 'badge-error'}`}>{offer.type}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 opacity-80">
              <span>P{offer.priority || 1}</span>
              <span>{offer.isActive ? 'Active' : 'Inactive'}</span>
              <span>{offer.startDate?.slice(5,10) || '—'} → {offer.endDate?.slice(5,10) || '—'}</span>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(offer)}>Edit</button>
              <button className="btn btn-error btn-xs" onClick={() => handleDelete(offer._id)}>Del</button>
            </div>
          </li>
        ))}
        {offers.length === 0 && <li className="text-center text-xs opacity-60 py-6">No offers</li>}
      </ul>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block rounded-lg border bg-base-100">
        <table className="table table-xs sm:table-sm md:table-md">
          <caption className="sr-only">Offers table with title, type, priority, active state, dates and actions</caption>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Active</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer: any) => (
              <tr key={offer._id} className="hover">
                <td className="max-w-[220px] truncate" title={offer.title}>{offer.title}</td>
                <td>
                  <span className={`badge badge-sm ${
                    offer.type === 'popup' ? 'badge-info' : 
                    offer.type === 'banner' ? 'badge-warning' : 'badge-error'
                  }`}>{offer.type}</span>
                </td>
                <td>{offer.priority || 1}</td>
                <td>
                  <span className={`badge badge-sm ${offer.isActive ? 'badge-success' : 'badge-ghost'}`}>{offer.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="whitespace-nowrap">{offer.startDate?.slice(0, 10) || 'N/A'}</td>
                <td className="whitespace-nowrap">{offer.endDate?.slice(0, 10) || 'N/A'}</td>
                <td className="flex gap-2">
                  <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(offer)}>Edit</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(offer._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr><td colSpan={7} className="text-center text-xs opacity-60 py-6">No offers</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2 text-sm sm:text-base">{editing ? 'Edit Offer' : 'Add New Offer'}</h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave(editing || undefined);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <div>
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              placeholder="Offer title" 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
              required 
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Type *</span>
            </label>
            <select 
              className="select select-bordered w-full" 
              value={form.type} 
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="popup">Popup</option>
              <option value="banner">Banner</option>
              <option value="flashSale">Flash Sale</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              min="1" 
              max="10" 
              value={form.priority} 
              onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))} 
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              type="date" 
              value={form.startDate} 
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} 
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">End Date</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              type="date" 
              value={form.endDate} 
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} 
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Image URL</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              placeholder="https://..." 
              value={form.imageUrl} 
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} 
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input 
              className="input input-bordered w-full" 
              placeholder="Offer description" 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">Content *</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full" 
              placeholder="Offer content (HTML/Text)" 
              value={form.content} 
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-4 sm:col-span-2 xl:col-span-3">
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Active</span>
              <input 
                type="checkbox" 
                className="checkbox" 
                checked={form.isActive} 
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} 
              />
            </label>
            
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editing ? 'Update Offer' : 'Create Offer'}
              </button>
              {editing && (
                <button 
                  className="btn btn-ghost" 
                  type="button" 
                  onClick={() => { setEditing(null); resetForm(); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
