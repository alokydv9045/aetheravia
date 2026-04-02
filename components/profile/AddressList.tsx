"use client";

import { useMemo, useState } from "react";

type Address = {
  _id: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  phone?: string;
};

type Props = {
  addresses?: Address[];
  reload: () => void;
};

export default function AddressList({ addresses, reload }: Props) {
  const [addrForm, setAddrForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [editing, setEditing] = useState<Address | null>(null);

  const canSubmit = useMemo(() => {
    const { fullName, address, city, postalCode } = addrForm;
    return [fullName, address, city, postalCode].every((v) => v && v.trim().length > 0);
  }, [addrForm]);

  const submit = async () => {
    if (!canSubmit) return;
    if (editing) {
      await fetch(`/api/auth/profile/addresses?id=${editing._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForm),
      });
      setEditing(null);
    } else {
      await fetch("/api/auth/profile/addresses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForm),
      });
    }
    setAddrForm({ fullName: "", address: "", city: "", postalCode: "", country: "", phone: "" });
    reload();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div role="region" aria-label="Address form" className="form-control gap-3">
        <label className="label">
          <span className="label-text font-medium">{editing ? "Edit address" : "Add a new address"}</span>
        </label>
        <input className="input input-bordered" placeholder="Full name" value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
        <textarea className="textarea textarea-bordered min-h-[80px]" placeholder="Street address" value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input input-bordered" placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
          <input className="input input-bordered" placeholder="Postal code" value={addrForm.postalCode} onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input input-bordered" placeholder="Country (optional)" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} />
          <input className="input input-bordered" placeholder="Phone (optional)" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn btn-primary flex-1" disabled={!canSubmit} onClick={submit}>{editing ? "Update Address" : "Save Address"}</button>
          {editing && <button className="btn btn-outline flex-1" onClick={() => { setEditing(null); setAddrForm({ fullName: "", address: "", city: "", postalCode: "", country: "", phone: "" }); }}>Cancel</button>}
        </div>
      </div>
      <div role="region" aria-label="Saved addresses list">
        {!addresses && <div className="flex items-center justify-center py-8"><span className="loading loading-spinner"></span> Loading addresses...</div>}
        {addresses && addresses.length === 0 && (
          <div className='text-center py-8'>
            <div className='text-4xl mb-2'>📍</div>
            <p className='opacity-70'>No saved addresses yet.</p>
            <p className='text-sm opacity-60 mt-1'>Add your first address using the form.</p>
          </div>
        )}
        {addresses && addresses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Saved Addresses ({addresses.length})</h3>
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a._id} className='card bg-base-200 p-4 transition hover:shadow-md'>
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                    <div className='text-sm flex-1'>
                      <div className='font-medium text-base mb-1'>{a.fullName}</div>
                      <div className='opacity-80 leading-relaxed'>{a.address}</div>
                      <div className='opacity-80'>
                        {a.city}, {a.postalCode} {a.country ? `• ${a.country}` : ''}
                      </div>
                      {a.phone && <div className='opacity-80 mt-1'>📞 {a.phone}</div>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className='btn btn-sm btn-outline' onClick={() => { setEditing(a); setAddrForm({ fullName: a.fullName, address: a.address, city: a.city, postalCode: a.postalCode, country: a.country || "", phone: a.phone || "" }); }}>Edit</button>
                      <button className='btn btn-sm btn-outline btn-error' aria-label={`Remove address for ${a.fullName}`} onClick={async () => { await fetch(`/api/auth/profile/addresses?id=${a._id}`, { method: 'DELETE', credentials: 'include' }); reload(); }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
