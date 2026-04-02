'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, ValidationRule, useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import useCartService from '@/lib/hooks/useCartStore';
import { ShippingAddress } from '@/lib/models/OrderModel';

const Form = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { saveShippingAddress, shippingAddress } = useCartService();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      toast.error('Please sign in to continue checkout');
      router.push('/signin?callbackUrl=/shipping');
      return;
    }
  }, [status, router]);

  const fetcher = async (url: string) => {
    const res = await fetch(url, { credentials: 'include' as RequestCredentials });
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  };
  type Address = {
    _id: string;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
    phone?: string;
  };
  const { data: addresses } = useSWR<Address[]>(
    '/api/auth/profile/addresses',
    fetcher,
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
      postalCode: '',
      country: '',
    },
  });

  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, [setValue, shippingAddress]);

  const selected = useMemo(() => {
    return (addresses || []).find((a) => a._id === selectedId);
  }, [addresses, selectedId]);

  useEffect(() => {
    if (selected) {
      setValue('fullName', selected.fullName);
      setValue('address', selected.address);
      setValue('city', selected.city);
      setValue('postalCode', selected.postalCode);
      setValue('country', selected.country || '');
    }
  }, [selected, setValue]);

  const formSubmit: SubmitHandler<ShippingAddress> = async (form) => {
    saveShippingAddress(form);
    router.push('/payment');
  };

  const FormInput = ({
    id,
    name,
    required,
    pattern,
  }: {
    id: keyof ShippingAddress;
    name: string;
    required?: boolean;
    pattern?: ValidationRule<RegExp>;
  }) => (
    <div className='mb-2'>
      <label className='label' htmlFor={id}>
        {name}
      </label>
      <input
        type='text'
        id={id}
        {...register(id, {
          required: required && `${name} is required`,
          pattern,
        })}
        className='input input-bordered w-full max-w-sm'
      />
      {errors[id]?.message && (
        <div className='text-error'>{errors[id]?.message}</div>
      )}
    </div>
  );

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">Verifying authentication...</span>
      </div>
    );
  }

  // If not authenticated, this will be handled by the useEffect
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">Redirecting to sign in...</span>
      </div>
    );
  }

  return (
    <div>
      <CheckoutSteps current={1} />
      <div className='card mx-auto my-4 max-w-sm bg-base-300'>
        <div className='card-body'>
          <h1 className='card-title'>Shipping Address</h1>
          {addresses && addresses.length > 0 && (
            <div className='mb-4'>
              <label className='label'>Saved address</label>
              <select
                className='select select-bordered w-full max-w-sm'
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value=''>Select from saved...</option>
                {addresses.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.fullName} • {a.city}
                  </option>
                ))}
              </select>
            </div>
          )}
          <form onSubmit={handleSubmit(formSubmit)}>
            <FormInput name='Full Name' id='fullName' required />
            <FormInput name='Address' id='address' required />
            <FormInput name='City' id='city' required />
            <FormInput name='Postal Code' id='postalCode' required />
            <FormInput name='Country' id='country' required />
            <div className='my-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting && <span className='loading loading-spinner' />}
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;
