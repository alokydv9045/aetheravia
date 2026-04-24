"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  user?: {
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
  onUpdateAvatar?: (url: string) => Promise<void>;
  onSaveAbout?: (payload: { name?: string; email?: string; avatar?: string }) => Promise<void>;
};

export default function Overview({ user, onUpdateAvatar, onSaveAbout }: Props) {
  const avatar = (user?.avatar && typeof user.avatar === "string" && user.avatar) || "/images/banner/banner1.jpg";
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file'); return; }
    if (file.size > 4 * 1024 * 1024) { setError('Image must be 4MB or smaller'); return; }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/auth/profile/avatar', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (onUpdateAvatar && data?.url) {
        await onUpdateAvatar(data.url);
      }
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-surface-container-low p-8 md:p-12 rounded-lg border border-outline-variant/10 shadow-xl"
    >
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="relative group">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 relative cursor-pointer ring-offset-4 ring-offset-surface ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-500"
            onClick={() => fileRef.current?.click()}
          >
            <Image 
              src={avatar} 
              alt={name || "Avatar"} 
              fill 
              sizes="128px" 
              className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
            />
            <div className={`absolute inset-0 bg-primary/40 flex flex-col items-center justify-center text-[9px] font-bold uppercase tracking-widest text-white transition-opacity duration-500 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              ) : (
                <span className="material-symbols-outlined mb-1">photo_camera</span>
              )}
              {uploading ? 'Syncing...' : 'Modify'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">Artisan Identity</p>
            <h2 className="font-headline text-4xl text-on-surface italic">{name || 'Unnamed Heritage Seeker'}</h2>
            <p className="text-secondary font-body text-sm opacity-60 mt-1">{email}</p>
          </div>

          {user?.createdAt && (
            <div className="flex items-center gap-2 py-2 px-4 bg-primary/5 rounded-full w-fit border border-primary/10">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                Established {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
           <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Display Name</label>
           <input 
             className="w-full bg-surface border-b border-outline-variant/30 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
             value={name} 
             onChange={(e) => setName(e.target.value)} 
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Contact Archive</label>
           <input 
             className="w-full bg-surface border-b border-outline-variant/30 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
             value={email} 
             onChange={(e) => setEmail(e.target.value)} 
           />
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between gap-4">
        <div className="flex-1">
          <AnimatePresence>
            {error && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-error text-[10px] font-bold uppercase tracking-widest"
              >
                {error}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/10 flex items-center gap-3 disabled:opacity-50"
          disabled={saving}
          onClick={async () => {
            setSaving(true); setError(null);
            try {
              const n = (name || '').trim();
              const e = (email || '').trim();
              if (!n) throw new Error('Name required');
              if (!e) throw new Error('Email required');
              if (onSaveAbout) await onSaveAbout({ name: n, email: e });
              toast.success('Archive updated');
            } catch (e: any) {
              setError(e?.message || 'Update failure');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Syncing...' : 'Commit Changes'}
          {!saving && <span className="material-symbols-outlined text-sm">auto_fix_high</span>}
        </button>
      </div>
    </motion.div>
  );
}
