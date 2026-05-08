'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import ImageCropper from '@/components/admin/ImageCropper';

const TeamSettings = () => {
  const { data: settings, isLoading } = useSWR('/api/admin/settings');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  // Cropper State
  const [cropperData, setCropperData] = useState<{
    image: string;
    role: 'founder' | 'coFounder';
  } | null>(null);

  const [founder, setFounder] = useState({
    name: '',
    title: 'Founder',
    image: '',
    quote: '',
    bio: '',
  });

  const [coFounder, setCoFounder] = useState({
    name: '',
    title: 'Co-Founder',
    image: '',
    quote: '',
    bio: '',
  });

  useEffect(() => {
    if (settings) {
      const teamSetting = settings.find((s: any) => s.key === 'team_members');
      if (teamSetting && teamSetting.value) {
        setFounder(teamSetting.value.founder || { name: '', title: 'Founder', image: '', quote: '', bio: '' });
        setCoFounder(teamSetting.value.coFounder || { name: '', title: 'Co-Founder', image: '', quote: '', bio: '' });
      }
    }
  }, [settings]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, role: 'founder' | 'coFounder') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropperData({
        image: reader.result as string,
        role: role
      });
    };
    reader.readAsDataURL(file);
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleCroppedImage = async (blob: Blob) => {
    if (!cropperData) return;
    const { role } = cropperData;
    
    setCropperData(null);
    setIsUploading(role);
    
    const formData = new FormData();
    formData.append('file', blob, 'cropped-image.jpg');
    formData.append('folder', 'team');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (role === 'founder') {
          setFounder(prev => ({ ...prev, image: data.url }));
        } else {
          setCoFounder(prev => ({ ...prev, image: data.url }));
        }
        toast.success('Photo edited and uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(null);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'team_members',
          value: { founder, coFounder },
          description: 'Names, photos, and quotes of the store founders'
        }),
      });

      if (res.ok) {
        toast.success('Team settings updated successfully');
        mutate('/api/admin/settings');
      } else {
        toast.error('Failed to update team settings');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="animate-pulse">Loading team settings...</div>;

  return (
    <div className="max-w-6xl space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm"
      >
        <h2 className="text-xl font-headline text-secondary mb-6 italic">Founders & Leadership</h2>
        
        <div className="grid grid-cols-1 gap-12">
          {/* Founder Section */}
          <div className="space-y-6 p-8 bg-surface rounded-lg border border-outline-variant/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Founder</h3>
            
            <div className="flex flex-col md:flex-row gap-12">
              <div className="space-y-4">
                <div className="relative w-48 h-64 bg-surface-container rounded-lg overflow-hidden border border-outline-variant/20">
                  {founder.image ? (
                    <Image src={founder.image} alt={founder.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                  )}
                  {isUploading === 'founder' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="loading loading-spinner loading-sm text-white"></span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <label className="cursor-pointer bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                    {founder.image ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'founder')} />
                  </label>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Full Name</label>
                    <input 
                      type="text"
                      value={founder.name}
                      onChange={(e) => setFounder(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter founder name"
                      className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Role Title</label>
                    <input 
                      type="text"
                      value={founder.title}
                      onChange={(e) => setFounder(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Short Quote</label>
                  <input 
                    type="text"
                    value={founder.quote}
                    onChange={(e) => setFounder(prev => ({ ...prev, quote: e.target.value }))}
                    placeholder="Enter a short, inspiring quote"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface italic"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Biography / Message</label>
                  <textarea 
                    rows={3}
                    value={founder.bio}
                    onChange={(e) => setFounder(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter founder's message or biography"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Co-Founder Section */}
          <div className="space-y-6 p-8 bg-surface rounded-lg border border-outline-variant/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Co-Founder</h3>
            
            <div className="flex flex-col md:flex-row gap-12">
              <div className="space-y-4">
                <div className="relative w-48 h-64 bg-surface-container rounded-lg overflow-hidden border border-outline-variant/20">
                  {coFounder.image ? (
                    <Image src={coFounder.image} alt={coFounder.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                  )}
                  {isUploading === 'coFounder' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="loading loading-spinner loading-sm text-white"></span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <label className="cursor-pointer bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                    {coFounder.image ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'coFounder')} />
                  </label>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Full Name</label>
                    <input 
                      type="text"
                      value={coFounder.name}
                      onChange={(e) => setCoFounder(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter co-founder name"
                      className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Role Title</label>
                    <input 
                      type="text"
                      value={coFounder.title}
                      onChange={(e) => setCoFounder(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Short Quote</label>
                  <input 
                    type="text"
                    value={coFounder.quote}
                    onChange={(e) => setCoFounder(prev => ({ ...prev, quote: e.target.value }))}
                    placeholder="Enter a short, inspiring quote"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface italic"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Biography / Message</label>
                  <textarea 
                    rows={3}
                    value={coFounder.bio}
                    onChange={(e) => setCoFounder(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter co-founder's message or biography"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary transition-all py-3 px-1 focus:ring-0 font-body text-on-surface resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {cropperData && (
            <ImageCropper 
              image={cropperData.image}
              onCropComplete={handleCroppedImage}
              onCancel={() => setCropperData(null)}
            />
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-primary text-on-primary px-12 py-4 rounded-lg font-bold tracking-[0.2em] uppercase text-[11px] hover:bg-primary-container transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isUpdating ? 'Saving Ritual...' : 'Save Team Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamSettings;
