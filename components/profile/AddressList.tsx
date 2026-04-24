"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="space-y-8">
        <h3 className="font-headline text-2xl text-secondary italic">{editing ? "Refine Destination" : "New Logistics Record"}</h3>
        <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-60 ml-1">Full Identity</label>
             <input className="w-full bg-surface border border-outline-variant/30 px-4 py-3 font-body focus:border-primary outline-none transition-all rounded" placeholder="Receiver's name" value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
          </div>
          <div className="space-y-2">
             <label className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-60 ml-1">Street Conduit</label>
             <textarea className="w-full bg-surface border border-outline-variant/30 px-4 py-3 font-body focus:border-primary outline-none transition-all rounded min-h-[100px]" placeholder="Detailed address" value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-60 ml-1">City</label>
               <input className="w-full bg-surface border border-outline-variant/30 px-4 py-3 font-body focus:border-primary outline-none transition-all rounded" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-60 ml-1">Postal Code</label>
               <input className="w-full bg-surface border border-outline-variant/30 px-4 py-3 font-body focus:border-primary outline-none transition-all rounded" value={addrForm.postalCode} onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-primary text-on-primary py-4 rounded font-bold tracking-widest uppercase text-[9px] hover:bg-primary-container transition-all shadow-lg disabled:opacity-50" disabled={!canSubmit} onClick={submit}>
              {editing ? "Commit Revisions" : "Establish Address"}
            </button>
            {editing && (
              <button className="flex-1 border border-outline-variant/30 text-on-surface py-4 rounded font-bold tracking-widest uppercase text-[9px] hover:bg-surface-container-high transition-all" onClick={() => { setEditing(null); setAddrForm({ fullName: "", address: "", city: "", postalCode: "", country: "", phone: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="font-headline text-2xl text-secondary italic">Archived Destinations</h3>
        {!addresses && <div className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-secondary/40">Recalling records...</div>}
        {addresses && addresses.length === 0 && (
          <div className='py-12 px-8 bg-surface-container-high/20 rounded border border-dashed border-outline-variant/30 text-center'>
            <p className='text-secondary font-body italic opacity-60'>No logistical records established.</p>
          </div>
        )}
        <div className="space-y-4">
          <AnimatePresence>
            {addresses?.map((a) => (
              <motion.div 
                key={a._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className='bg-surface border border-outline-variant/20 p-6 rounded-lg group hover:border-primary/30 transition-all'
              >
                <div className='flex justify-between items-start gap-4'>
                  <div className='flex-1'>
                    <h4 className='font-label font-bold text-sm tracking-widest text-primary mb-2 uppercase'>{a.fullName}</h4>
                    <p className='font-body text-xs text-secondary opacity-80 leading-relaxed'>{a.address}</p>
                    <p className='font-body text-xs text-secondary opacity-60 mt-1 uppercase tracking-wider'>
                      {a.city}, {a.postalCode} {a.country && `• ${a.country}`}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className='p-2 hover:text-primary transition-colors' 
                      onClick={() => { setEditing(a); setAddrForm({ fullName: a.fullName, address: a.address, city: a.city, postalCode: a.postalCode, country: a.country || "", phone: a.phone || "" }); }}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                    <button 
                      className='p-2 hover:text-error transition-colors'
                      onClick={async () => { await fetch(`/api/auth/profile/addresses?id=${a._id}`, { method: 'DELETE', credentials: 'include' }); reload(); }}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
