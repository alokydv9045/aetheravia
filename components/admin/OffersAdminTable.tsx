"use client";
import useSWR from 'swr';
import { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Users,
  Image as ImageIcon,
  ChevronRight,
  X,
  Zap,
  Layout,
  MessageSquare,
  Ticket,
  Percent,
  Package,
  Check,
  Settings,
  Sparkles,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function OffersAdminTable() {
  const { data, error, mutate, isLoading } = useSWR('/api/admin/offers', fetcher);
  const { data: productsData } = useSWR('/api/admin/products', fetcher);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'popup',
    startDate: '',
    endDate: '',
    isActive: true,
    imageUrl: '',
    linkUrl: '',
    priority: 1,
    content: '',
    promoCode: '',
    discountPercentage: 0,
    products: [] as string[],
    targetAudience: 'all',
  });

  const offers = useMemo(() => {
    if (!data) return [];
    const list = data.offers || data;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const allProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData.products || productsData;
  }, [productsData]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o: any) => {
      const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           o.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           o.promoCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || o.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [offers, searchTerm, typeFilter]);

  const getStatus = (offer: any) => {
    if (!offer.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-500', icon: AlertCircle };
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    if (now < start) return { label: 'Scheduled', color: 'bg-blue-50 text-blue-600', icon: Clock };
    if (now > end) return { label: 'Expired', color: 'bg-red-50 text-red-600', icon: AlertCircle };
    return { label: 'Active', color: 'bg-green-50 text-green-600', icon: CheckCircle2 };
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'popup',
      startDate: '',
      endDate: '',
      isActive: true,
      imageUrl: '',
      linkUrl: '',
      priority: 1,
      content: '',
      promoCode: '',
      discountPercentage: 0,
      products: [],
      targetAudience: 'all',
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (offer: any) => {
    setEditingId(offer._id);
    setForm({
      title: offer.title,
      description: offer.description || '',
      type: offer.type,
      startDate: offer.startDate?.slice(0, 10) || '',
      endDate: offer.endDate?.slice(0, 10) || '',
      isActive: offer.isActive,
      imageUrl: offer.imageUrl || '',
      linkUrl: offer.linkUrl || '',
      priority: offer.priority || 1,
      content: offer.content || '',
      promoCode: offer.promoCode || '',
      discountPercentage: offer.discountPercentage || 0,
      products: offer.products || [],
      targetAudience: offer.targetAudience || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? 'Updating offer...' : 'Creating offer...');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { offerId: editingId, ...form } : form;
      const res = await fetch('/api/admin/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save offer');
      
      toast.success(editingId ? 'Offer updated successfully' : 'Offer created successfully', { id: loadingToast });
      setIsModalOpen(false);
      resetForm();
      mutate();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    const loadingToast = toast.loading('Deleting offer...');
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: id }),
      });
      if (!res.ok) throw new Error('Failed to delete offer');
      toast.success('Offer deleted', { id: loadingToast });
      mutate();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const toggleStatus = async (offer: any) => {
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: offer._id, isActive: !offer.isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleProduct = (productId: string) => {
    setForm(f => {
      const exists = f.products.includes(productId);
      if (exists) return { ...f, products: f.products.filter(id => id !== productId) };
      return { ...f, products: [...f.products, productId] };
    });
  };

  const selectByCategory = (category: string) => {
    const categoryProducts = allProducts
      .filter((p: any) => p.category.toLowerCase().replace(/\s+/g, '') === category.toLowerCase().replace(/\s+/g, ''))
      .map((p: any) => p._id);
    
    setForm(f => {
      const allSelected = categoryProducts.length > 0 && categoryProducts.every((id: string) => f.products.includes(id));
      if (allSelected) {
        return { ...f, products: f.products.filter(id => !categoryProducts.includes(id)) };
      } else {
        return { ...f, products: [...new Set([...f.products, ...categoryProducts])] };
      }
    });
  };

  const categories = [
    { id: 'bodywash', label: 'Body Wash', icon: '🛁' },
    { id: 'bodyscrub', label: 'Body Scrub', icon: '✨' },
    { id: 'facewash', label: 'Face Wash', icon: '🧴' },
    { id: 'combo', label: 'Combo', icon: '🎁' },
  ];

  if (error) return (
    <div className="p-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-red-600">Failed to load offers</h3>
    </div>
  );

  return (
    <div className="p-2 sm:p-6 w-full space-y-6 lg:space-y-8 relative overflow-hidden max-w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-headline italic font-bold text-primary">Offer Management</h1>
          <p className="text-[10px] sm:text-sm opacity-70">Manage your promotional campaigns effortlessly.</p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          onClick={openAddModal}
        >
          <Plus size={16} /> New Offer
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Active" value={offers.filter(o => getStatus(o).label === 'Active').length} tone="primary" />
        <StatTile label="Upcoming" value={offers.filter(o => getStatus(o).label === 'Scheduled').length} tone="info" />
        <StatTile label="Expired" value={offers.filter(o => getStatus(o).label === 'Expired').length} tone="error" />
        <StatTile label="Total" value={offers.length} tone="secondary" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            className="w-full pl-10 pr-4 py-3 bg-white/60 border border-primary/10 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none pl-4 pr-10 py-3 bg-white/60 border border-primary/10 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-bold uppercase tracking-widest appearance-none"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="popup">Popups</option>
            <option value="banner">Banners</option>
          </select>
        </div>
      </div>

      {/* List Section (Fixed Horizontal Scroll) */}
      <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-3xl sm:rounded-[2.5rem] shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
            <thead>
              <tr className="bg-primary/5 border-b border-primary/10">
                <th className="px-4 sm:px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-[45%]">Offer Details</th>
                <th className="px-4 sm:px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-[20%]">Discount</th>
                <th className="px-4 sm:px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-[20%] text-center">Status</th>
                <th className="px-4 sm:px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredOffers.map((offer: any) => {
                const status = getStatus(offer);
                return (
                  <tr key={offer._id} className="group hover:bg-primary/5 transition-colors">
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10 shrink-0">
                          {offer.imageUrl ? <img src={offer.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-primary/20" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-primary text-xs sm:text-sm truncate leading-tight mb-1">{offer.title}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">{offer.promoCode || 'NO CODE'}</span>
                            <span className="text-[8px] text-gray-400 opacity-60 whitespace-nowrap">Exp: {new Date(offer.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-bold text-green-600 leading-none">{offer.discountPercentage}% OFF</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary/40 mt-1">{offer.type}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest whitespace-nowrap shadow-sm ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => openEditModal(offer)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(offer._id)} className="p-1.5 sm:p-2 text-error hover:bg-error/10 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Form Modal (DAISYUI STYLE) */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl max-h-[95vh] overflow-y-auto p-0 rounded-3xl sm:rounded-[2.5rem] bg-white border border-primary/10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-gray-400 hover:text-primary transition-all z-10"><X size={20} /></button>
            <div className="p-6 sm:p-10 pb-4 sm:pb-6 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                 <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary text-white shadow-lg"><Settings size={20} /></div>
                 <div><h3 className="text-xl sm:text-2xl font-headline italic font-bold text-primary leading-none">{editingId ? 'Edit Campaign' : 'New Campaign'}</h3><p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Marketing Control Center</p></div>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-6 sm:p-10 pt-4 sm:pt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Campaign Title *</span></label><input required type="text" className="input input-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 py-4 sm:py-6 h-auto" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">UI Logic *</span></label><select className="select select-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 h-[50px] sm:h-[58px]" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}><option value="popup">Popup</option><option value="banner">Banner</option></select></div>
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Discount (%) *</span></label><input required type="number" min="0" max="100" className="input input-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 py-4 sm:py-6 h-auto font-bold" value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Promo Code</span></label><input type="text" className="input input-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 py-4 sm:py-6 h-auto font-bold uppercase" value={form.promoCode} onChange={e => setForm(f => ({ ...f, promoCode: e.target.value.toUpperCase() }))} /></div>
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Start Date *</span></label><input required type="date" className="input input-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 py-4 sm:py-6 h-auto" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div className="form-control"><label className="label"><span className="label-text text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Expiry Date *</span></label><input required type="date" className="input input-bordered w-full rounded-xl sm:rounded-2xl bg-primary/[0.02] border-primary/10 px-4 sm:px-6 py-4 sm:py-6 h-auto" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
              </div>
              <div className="space-y-6 pt-6 border-t border-primary/5">
                <div className="flex items-center justify-between px-1"><div className="flex items-center gap-2"><Layers size={16} className="text-primary/40" /><h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Inventory Targets</h4></div><span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{form.products.length} Selected</span></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => selectByCategory(cat.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${form.products.length > 0 && allProducts.filter((p: any) => p.category.toLowerCase().replace(/\s+/g, '') === cat.id).every((p: any) => form.products.includes(p._id)) ? 'bg-primary border-primary text-white' : 'bg-primary/[0.02] border-primary/5 text-gray-500 hover:border-primary/20'}`}><span className="text-xl">{cat.icon}</span><span className="text-[9px] font-bold uppercase tracking-widest">{cat.label}</span></button>
                  ))}
                </div>
                <div className="bg-primary/[0.02] border border-primary/10 rounded-3xl p-4 sm:p-6 shadow-inner max-h-[250px] overflow-y-auto custom-scrollbar"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allProducts.map((p: any) => (
                    <button key={p._id} type="button" onClick={() => toggleProduct(p._id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${form.products.includes(p._id) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-primary/5 text-gray-500'}`}><div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-black/5 bg-gray-100"><img src={p.image} className="w-full h-full object-cover" /></div><div className="min-w-0 flex-1"><div className="text-[10px] font-bold truncate leading-none mb-1">{p.name}</div><div className="text-[8px] truncate opacity-50 uppercase tracking-tighter">{p.category}</div></div>{form.products.includes(p._id) && <Check size={12} strokeWidth={4} />}</button>
                  ))}
                </div></div>
              </div>
              <div className="form-control"><div className="flex items-center gap-2 mb-2 ml-1 text-primary"><MessageSquare size={14} /><span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Narrative</span></div><textarea className="textarea textarea-bordered w-full rounded-2xl sm:rounded-3xl bg-primary/[0.02] border-primary/10 p-6 sm:p-8 text-xs sm:text-sm font-medium resize-none shadow-inner" rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
              <div className="modal-action bg-primary/[0.03] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-primary/5">
                <label className="flex items-center gap-3 cursor-pointer"><div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${form.isActive ? 'bg-primary shadow-lg' : 'bg-gray-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isActive ? 'right-1' : 'left-1'}`} /></div><div className="flex flex-col"><span className={`text-[9px] font-bold uppercase tracking-widest ${form.isActive ? 'text-primary' : 'text-gray-400'}`}>Deployment</span></div><input type="checkbox" className="hidden" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /></label>
                <div className="flex gap-3 w-full sm:w-auto"><button type="button" className="flex-1 sm:flex-none px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-all rounded-xl" onClick={() => setIsModalOpen(false)}>Discard</button><button type="submit" className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all">{editingId ? 'Sync' : 'Deploy'}</button></div>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-primary/10 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb), 0.15); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  const toneMap: Record<string, string> = {
    primary: 'text-primary',
    info: 'text-blue-500',
    error: 'text-red-500',
    secondary: 'text-amber-600'
  };
  return (
    <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
      <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">{label}</div>
      <div className={`text-xl sm:text-2xl font-bold ${toneMap[tone] || ''}`}>{value}</div>
    </div>
  );
}
