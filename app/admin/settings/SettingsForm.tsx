'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { motion } from 'framer-motion';

const SettingsForm = () => {
  const { data: settings, error, isLoading } = useSWR('/api/admin/settings');
  const [shippingCharge, setShippingCharge] = useState<number>(99);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (settings) {
      const shippingSetting = settings.find((s: any) => s.key === 'shipping_charge');
      if (shippingSetting) {
        setShippingCharge(Number(shippingSetting.value));
      }
    }
  }, [settings]);

  const handleUpdateShipping = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'shipping_charge',
          value: shippingCharge,
          description: 'Flat shipping rate applied to all orders'
        }),
      });

      if (res.ok) {
        toast.success('Shipping charge updated successfully');
        mutate('/api/admin/settings');
      } else {
        toast.error('Failed to update shipping charge');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="animate-pulse">Loading settings...</div>;
  if (error) return <div className="text-error">Error loading settings</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm"
      >
        <h2 className="text-xl font-headline text-secondary mb-6 italic">Logistics & Shipping</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold">
              Flat Shipping Rate (₹)
            </label>
            <div className="flex gap-4">
              <input 
                type="number"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                className="flex-1 bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface text-lg"
              />
              <button 
                onClick={handleUpdateShipping}
                disabled={isUpdating}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold tracking-widest uppercase text-[10px] hover:bg-primary-container transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
            <p className="text-[11px] text-secondary/60 italic mt-2">
              This value will be applied as the standard shipping/convenience fee for all future orders.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Additional settings can be added here later */}
    </div>
  );
};

export default SettingsForm;
