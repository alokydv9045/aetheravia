'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, ValidationRule, useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import useCartService, { cartStore } from '@/lib/hooks/useCartStore';
import { ShippingAddress } from '@/lib/models/OrderModel';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const COUNTRIES = ['India'];

const Form = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { saveShippingAddress, shippingAddress } = useCartService();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      toast.error('Please sign in to continue checkout');
      router.push('/signin?callbackUrl=/shipping');
      return;
    }
    if (cartStore.getState().items.length === 0) {
      router.push('/cart');
    }
  }, [status, router]);

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  };

  const { data: addresses } = useSWR<any[]>(
    '/api/auth/profile/addresses',
    fetcher
  );

  const [selectedId, setSelectedId] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  useEffect(() => {
    if (shippingAddress) {
      setValue('fullName', shippingAddress.fullName || '');
      setValue('address', shippingAddress.address || '');
      setValue('city', shippingAddress.city || '');
      setValue('state', shippingAddress.state || '');
      setValue('postalCode', shippingAddress.postalCode || '');
      setValue('country', shippingAddress.country || 'India');
    }
  }, [setValue, shippingAddress]);

  const selected = useMemo(() => {
    return (addresses || []).find((a) => a._id === selectedId);
  }, [addresses, selectedId]);

  useEffect(() => {
    if (selected) {
      setValue('fullName', selected.fullName);
      setValue('address', selected.address);
      setValue('city', selected.city);
      setValue('state', selected.state || '');
      setValue('postalCode', selected.postalCode);
      setValue('country', selected.country || 'India');
    }
  }, [selected, setValue]);

  const formSubmit: SubmitHandler<ShippingAddress> = async (form) => {
    saveShippingAddress(form);
    router.push('/payment');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="animate-pulse font-headline italic text-2xl text-primary">Loading shipping details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Noise grain for tactile texture */}
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <CheckoutSteps current={1} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-8 md:p-12 rounded-lg border border-outline-variant/10 shadow-2xl shadow-primary/5"
        >
          <div className="mb-12 text-center md:text-left">
            <h1 className="font-headline text-4xl text-primary italic mb-4">Shipping Address</h1>
            <p className="text-secondary font-body tracking-wide opacity-70">Where should we send your items?</p>
          </div>

          {addresses && addresses.length > 0 && (
            <div className="mb-12">
              <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold block mb-4">Saved Locations</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedId(addr._id)}
                    className={`text-left p-4 rounded border transition-all duration-300 ${
                      selectedId === addr._id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-outline-variant/20 bg-surface hover:border-primary/40'
                    }`}
                  >
                    <p className="font-label font-bold text-on-surface text-sm">{addr.fullName}</p>
                    <p className="text-[11px] text-secondary mt-1 truncate">{addr.address}</p>
                    <p className="text-[11px] text-secondary">{addr.city}, {addr.postalCode}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(formSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="fullName">Full Name</label>
                <input 
                  className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                  id="fullName"
                  {...register('fullName', { required: 'Full name is required' })}
                  placeholder="The Receiver"
                />
                {errors.fullName && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="country">Country</label>
                <select 
                  className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                  id="country"
                  {...register('country', { required: 'Country is required' })}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.country.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="address">Detailed Address</label>
              <input 
                className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                id="address"
                {...register('address', { required: 'Address is required' })}
                placeholder="Suite, Street, Neighborhood"
              />
              {errors.address && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="city">City / Town</label>
                <input 
                  className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                  id="city"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Metropolis"
                />
                {errors.city && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="state">State / UT</label>
                <select 
                  className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                  id="state"
                  {...register('state', { required: 'State is required' })}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="postalCode">Postal Code</label>
                <input 
                  className="w-full bg-surface border-0 border-b border-outline-variant/30 focus:border-primary transition-all px-4 py-3 focus:ring-0 font-body text-on-surface"
                  id="postalCode"
                  {...register('postalCode', { 
                    required: 'Postal code is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Invalid Indian PIN code (6 digits)'
                    }
                  })}
                  placeholder="6 Digit PIN"
                />
                {errors.postalCode && <p className="text-error text-[10px] uppercase font-bold tracking-widest mt-1">{errors.postalCode.message}</p>}
              </div>
            </div>

            <div className="pt-12 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="text-[10px] font-label text-secondary hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Cart
              </button>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/10 flex items-center gap-3"
              >
                {isSubmitting ? 'Validating...' : 'Continue to Payment'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Form;
