"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  Package, 
  Settings, 
  Plus, 
  ShoppingCart, 
  Mail, 
  MapPin, 
  Activity, 
  ShieldCheck,
  Edit3,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  History,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatPrice } from "@/lib/utils";

type OrderLite = {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  items: Array<{
    name: string;
    image: string;
    slug: string;
    price: number;
  }>;
};

type Props = {
  user?: {
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    personalization?: {
      tags?: string[];
      segments?: string[];
    };
  };
  onUpdateAvatar?: (url: string) => Promise<void>;
  onSaveAbout?: (payload: { name?: string; email?: string; avatar?: string }) => Promise<void>;
};

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function Overview({ user, onUpdateAvatar, onSaveAbout }: Props) {
  const avatar = (user?.avatar && typeof user.avatar === "string" && user.avatar) || "/images/banner/banner1.jpg";
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data: orders } = useSWR<OrderLite[]>('/api/orders/mine', fetcher);
  const latestOrder = orders?.[0];
  
  // Mock data for ritual intelligence
  const [skinConstitution, setSkinConstitution] = useState(user?.personalization?.tags?.includes('Sensitive') ? 'Sensitive' : 'Combination');
  const [olfactoryAffinity, setOlfactoryAffinity] = useState(['Oud', 'Sandalwood', 'Vetiver']);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Image must be 4MB or smaller'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/auth/profile/avatar', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (onUpdateAvatar && data?.url) {
        await onUpdateAvatar(data.url);
        toast.success('Avatar synchronized');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-12 animate-reveal">
      {/* Texture Layer (Local to component for better control) */}
      <div className="fixed inset-0 pointer-events-none bg-noise z-0 opacity-10"></div>

      {/* Profile Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-8 mb-16">
        <div className="relative group">
          <div 
            className="w-32 h-32 rounded-2xl overflow-hidden bg-surface-container-high border-2 border-primary/10 relative cursor-pointer shadow-2xl transition-all duration-500 hover:border-primary/30"
            onClick={() => fileRef.current?.click()}
          >
            <Image 
              src={avatar} 
              alt={name} 
              fill 
              className="object-cover grayscale mix-blend-multiply opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            />
            {uploading && (
               <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
               </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg border-2 border-surface cursor-pointer hover:scale-110 transition-transform">
            <Edit3 size={18} className="text-on-primary" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
        </div>

        <div className="text-center md:text-left flex-1">
          <h1 className="font-headline text-5xl font-bold text-primary tracking-tight mb-2 italic">{name || 'Heritage Seeker'}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
            <p className="font-body text-secondary text-sm flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
              <ShieldCheck size={14} className="text-primary" />
              <span className="font-bold tracking-widest uppercase text-[10px]">
                {user?.loyaltyTier || 'Bronze'} Tier Member • Established {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </span>
            </p>
            <div className="flex items-center gap-2 text-primary/60 text-xs font-medium">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Ritual Cycle</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link 
            href="/shop"
            className="bg-primary text-on-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary-container transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
          >
            Start Ritual
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Side: Interactive & Stats */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Ongoing Ritual Journey */}
          <section className="bg-surface-container-low/80 backdrop-blur-md border border-surface-variant/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package size={20} />
                </div>
                <h2 className="font-headline text-2xl font-bold text-primary tracking-tight italic">Ongoing Ritual Journey</h2>
              </div>
              {latestOrder && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary bg-surface-container-high px-4 py-2 rounded-lg">
                  Manifest #{latestOrder._id.slice(-8).toUpperCase()}
                </span>
              )}
            </div>

            <div className="relative px-2">
              <div className="h-1.5 w-full bg-surface-variant/30 rounded-full mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: latestOrder?.isDelivered ? '100%' : latestOrder?.isPaid ? '60%' : '20%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full relative"
                >
                  <div className="absolute -right-2.5 -top-2 w-5 h-5 bg-primary rounded-full border-4 border-surface shadow-lg"></div>
                </motion.div>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline">
                <div className={`flex flex-col items-start gap-2 ${!latestOrder?.isPaid ? 'text-primary' : 'opacity-60'}`}>
                  <span>Preparation</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${!latestOrder?.isPaid ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                </div>
                <div className={`flex flex-col items-center gap-2 ${latestOrder?.isPaid && !latestOrder?.isDelivered ? 'text-primary' : 'opacity-60'}`}>
                  <span>En Route</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${latestOrder?.isPaid && !latestOrder?.isDelivered ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                </div>
                <div className={`flex flex-col items-end gap-2 ${latestOrder?.isDelivered ? 'text-primary' : 'opacity-60'}`}>
                  <span>Arriving Sanctuary</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${latestOrder?.isDelivered ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                </div>
              </div>
            </div>

            {latestOrder && latestOrder.items?.[0] && (
              <div className="mt-10 flex items-center gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/5 group">
                <div className="relative w-20 h-20 overflow-hidden rounded-xl bg-surface-container-high">
                  <Image 
                    src={latestOrder.items[0].image} 
                    alt={latestOrder.items[0].name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-on-surface text-lg">{latestOrder.items[0].name}</p>
                  <p className="text-xs text-secondary mt-1 flex items-center gap-2">
                    <Clock size={12} />
                    Expected arrival: {new Date(new Date(latestOrder.createdAt).getTime() + 5*24*60*60*1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <Link href={`/order/${latestOrder._id}`} className="p-3 rounded-xl border border-primary/20 hover:bg-primary hover:text-on-primary transition-all">
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </section>

          {/* Subscription / Recurring Rituals Sanctuary */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline text-3xl font-bold text-primary tracking-tight italic">Ritual Archive</h2>
                <p className="text-secondary text-sm mt-2 opacity-70">Revisit your most cherished earthen essentials.</p>
              </div>
              <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-b-2 border-primary/10 hover:border-primary transition-all pb-1">
                Refill Essentials
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recently ordered items acting as "subscriptions" for UI purposes */}
              {(orders?.slice(1, 3) || []).map((order, idx) => (
                <div key={order._id} className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 hover:shadow-xl transition-all group hover:-translate-y-1">
                  <div className="flex gap-5 mb-6">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container-low shadow-inner">
                      <Image 
                        src={order.items[0].image} 
                        alt={order.items[0].name} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-headline font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{order.items[0].name}</h4>
                      <p className="text-[10px] text-secondary mt-1.5 italic font-medium uppercase tracking-widest opacity-60">Frequent Ritual</p>
                      <p className="text-xs font-bold text-primary mt-3 flex items-center gap-1.5">
                        <History size={12} />
                        Last: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/product/${order.items[0].slug}`} className="flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 text-center border border-primary/10 rounded-xl hover:bg-primary/5 transition-colors">
                      View Ritual
                    </Link>
                    <button className="flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                      Quick Refill
                    </button>
                  </div>
                </div>
              ))}
              
              {(!orders || orders.length < 2) && (
                <div className="md:col-span-2 py-12 border-2 border-dashed border-primary/10 rounded-3xl flex flex-col items-center justify-center text-center px-8">
                  <Sparkles size={32} className="text-primary/30 mb-4" />
                  <p className="text-secondary font-headline italic text-lg">Establish your first heritage rituals to populate your archive.</p>
                  <Link href="/shop" className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline">Explore Collection</Link>
                </div>
              )}
            </div>
          </section>

          {/* Interactive Skin Profile / Ritual Intelligence */}
          <section className="bg-primary/[0.02] rounded-3xl p-10 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/10 rotate-12">
              <Zap size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-2xl font-bold text-primary tracking-tight mb-10 italic">Ritual Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-6 flex items-center gap-2">
                    <Activity size={12} />
                    Skin Constitution
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['Sensitive', 'Combination', 'Dry', 'Oily'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setSkinConstitution(type)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest transition-all ${
                          skinConstitution === type 
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                            : 'border border-primary/20 text-primary hover:bg-primary/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-[10px] text-secondary leading-relaxed uppercase tracking-[0.2em] font-medium italic opacity-60">
                    Precision selected for: Autumn / Winter Cycle
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-6 flex items-center gap-2">
                    <Sparkles size={12} />
                    Olfactory Affinity
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {olfactoryAffinity.map(scent => (
                      <span key={scent} className="px-4 py-2 bg-surface-container-high/60 backdrop-blur-sm text-on-surface-variant rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group cursor-pointer hover:bg-primary-fixed transition-colors">
                        {scent} <span className="opacity-30 group-hover:opacity-100 transition-opacity">×</span>
                      </span>
                    ))}
                    <button className="px-4 py-2 border border-dashed border-primary/30 text-primary/60 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                      <Plus size={12} /> Add Scent
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-primary/10 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity size={24} />
                </div>
                <p className="text-sm italic text-primary/70 font-medium leading-relaxed max-w-lg">
                  Synchronizing your preferences dynamically refines the <span className="text-primary font-bold">Heritage Vault</span> specifically for your unique constitution.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Sidebar Stats & Quick Reorder */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Ritual Progress Dashboard */}
          <section className="bg-primary text-on-primary rounded-3xl p-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 text-white/10 group-hover:scale-125 transition-transform duration-1000">
              <TrendingUp size={160} />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-xl font-bold mb-8 italic">Ritual Consistency</h2>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-5xl font-headline font-bold">14</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mt-1">Current Streak (Days)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold">82%</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mt-1">Monthly Goal</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {[1, 1, 1, 1, 0, 1, 1].map((active, i) => (
                    <div 
                      key={i} 
                      className={`h-10 rounded-lg transition-all duration-500 hover:scale-110 ${
                        active ? 'bg-white shadow-lg' : 'bg-white/20'
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Award size={18} />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Next Reward</p>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed font-medium">
                    6 more ritual cycles until your <span className="font-bold underline decoration-2 underline-offset-4">Hand-Carved Soap Stone Tray</span> is unlocked.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick-Reorder Vault */}
          <section className="bg-white border border-surface-variant/30 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl font-bold text-primary italic">The Vault</h2>
              <Link href="/shop" className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors">Archive</Link>
            </div>
            <div className="space-y-3">
              {Array.isArray(orders) && (
                orders.flatMap(o => o.items || []).slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group p-2 hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
                    <div className="relative w-12 h-12 bg-surface-container-high rounded-lg overflow-hidden shadow-inner">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors truncate">{item.name}</p>
                      <p className="text-[9px] text-secondary mt-0.5 font-medium italic opacity-60">Archive Record</p>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center border border-primary/10 rounded-full bg-white shadow-sm hover:bg-primary hover:text-on-primary transition-all hover:scale-110 flex-shrink-0">
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                ))
              )}
              
              {(!orders || orders.length === 0) && (
                <div className="text-center py-8 opacity-40 italic font-headline">The vault is currently empty.</div>
              )}
            </div>
          </section>

          {/* Quick Account Details / Your Sanctuary */}
          <section className="bg-surface-container-low/40 rounded-3xl p-8 border border-surface-variant/20">
            <h2 className="font-headline text-xl font-bold text-primary mb-8 italic">Your Sanctuary</h2>
            
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Display Name</label>
                    <input 
                      className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Primary Email</label>
                    <input 
                      className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Your email"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 border border-primary/10 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] text-secondary hover:bg-surface-container-high transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setSaving(true);
                        try {
                          if (onSaveAbout) await onSaveAbout({ name, email });
                          toast.success('Sanctuary updated');
                          setIsEditing(false);
                        } catch (e: any) {
                          toast.error(e.message || 'Update failed');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-primary-container transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {saving ? 'Syncing...' : 'Save Record'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Artisan Identity</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <Edit3 size={16} className="text-primary/40" />
                      {name || 'Unnamed'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Primary Email</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <Mail size={16} className="text-primary/40" />
                      {email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Sanctuary Location</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <MapPin size={16} className="text-primary/40" />
                      {latestOrder ? 'Lotus Gardens, Delhi' : 'Not Established'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm flex items-center justify-center gap-3"
                  >
                    <Settings size={14} />
                    Identity Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Curated Product Section */}
      <section className="mt-32 pt-24 border-t border-primary/10 relative">
        <div className="max-w-3xl mb-16 relative z-10">
          <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block">Evolved Selection</span>
          <h2 className="font-headline text-5xl font-bold text-on-surface tracking-tighter leading-tight italic">Curated for Your Heritage</h2>
          <p className="mt-6 text-on-surface-variant font-body text-xl max-w-xl leading-relaxed opacity-80">
            Intelligently synchronized based on your <span className="text-primary font-bold italic underline decoration-primary/20 decoration-2 underline-offset-8">{skinConstitution} Constitution</span> and affinity for earthen rituals.
          </p>
        </div>
        
        {/* We would typically fetch recommended products here, for now using a mock layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            { name: 'Vetiver Root Mist', price: 1200, category: 'Cooling Hydration', image: '/images/products/spa-arrangement-with-cremes.jpg' },
            { name: 'Oud & Saffron Elixir', price: 3450, category: 'Nocturnal Recovery', image: '/images/products/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background.jpg', mt: true },
            { name: 'Marigold Petal Mask', price: 2800, category: 'Soothing Brightness', image: '/images/products/natural-cosmetic-products-arrangement.jpg' },
            { name: 'Sandalwood Paste', price: 1950, category: 'Earthen Purification', image: '/images/products/serum-bottle-with-yellow-background.jpg', mt: true }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className={`group cursor-pointer ${item.mt ? 'lg:mt-12' : ''}`}
            >
              <div className="relative aspect-square mb-6 overflow-hidden bg-surface-container-low rounded-2xl shadow-xl shadow-primary/5">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button className="w-full bg-white/90 backdrop-blur-md py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary shadow-lg">
                    Begin Ritual
                  </button>
                </div>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary mb-2 opacity-60">{item.category}</p>
              <h3 className="font-headline text-lg lg:text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors italic leading-tight">{item.name}</h3>
              <p className="text-primary text-sm font-bold tracking-widest">{formatPrice(item.price)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Icons matching the reference style */}
      <style jsx>{`
        .animate-reveal {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Adding a missing ArrowRight icon as it was used in the code but not imported from Lucide
function ArrowRight({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
