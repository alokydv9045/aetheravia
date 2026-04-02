"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
    <div className="card bg-base-300 transition-shadow hover:shadow-md">
      <div className="card-body">
        <h2 className="card-title text-base-content">Account Overview</h2>
        {user?.createdAt && (
          <p className="mb-3 text-sm opacity-70">
            Member since: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="tooltip tooltip-bottom" data-tip="Click to change photo">
          <div className="group relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border border-base-300 cursor-pointer"
               onClick={() => fileRef.current?.click()}
               aria-label="Change profile photo">
            <Image src={avatar} alt={name || "Avatar"} fill sizes="(max-width: 640px) 64px, 80px" style={{ objectFit: "cover" }} />
            <div className={`absolute inset-0 flex items-center justify-center text-xs text-base-content transition-opacity ${uploading ? 'opacity-100 bg-base-300/70' : 'opacity-0 group-hover:opacity-100 bg-base-300/60'}`}>
              {uploading ? 'Uploading…' : 'Change'}
            </div>
          </div>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
              <input className="input input-bordered w-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input input-bordered w-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {onUpdateAvatar && (
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
            )}
          </div>
        </div>
        {onSaveAbout && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              className="btn btn-primary transition hover:brightness-110"
              disabled={saving}
              onClick={async () => {
                setSaving(true); setError(null);
                try {
                  const n = (name || '').trim();
                  const e = (email || '').trim();
                  if (!n) throw new Error('Name is required');
                  if (!e) throw new Error('Email is required');
                  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRx.test(e)) throw new Error('Invalid email format');
                  await onSaveAbout({ name: n, email: e });
                } catch (e: any) {
                  setError(e?.message || 'Update failed');
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {error && <span className="text-error text-sm opacity-90">{error}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
