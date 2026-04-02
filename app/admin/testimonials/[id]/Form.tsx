'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';

type T = {
  name: string;
  quote: string;
  role?: string;
  city?: string;
  rating?: number;
  published?: boolean;
  order?: number;
};

export default function TestimonialForm({ id }: { id: string }) {
  const { data, error } = useSWR(`/api/admin/testimonials/${id}`);
  const router = useRouter();
  const [isMutating, setIsMutating] = ((): [boolean, (b: boolean) => void] => {
    let flag = false;
    return [flag, (b: boolean) => { flag = b; }];
  })();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<T>();

  useEffect(() => {
    if (!data) return;
    setValue('name', data.name);
    setValue('quote', data.quote);
    setValue('role', data.role || '');
    setValue('city', data.city || '');
    setValue('rating', data.rating ?? 5);
    setValue('published', data.published ?? true);
    setValue('order', data.order ?? 0);
  }, [data, setValue]);

  if (error) return error.message;
  if (!data) return 'Loading...';

  const onSubmit = async (form: T) => {
    const toastId = toast.loading('Updating...');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to update');
      toast.success('Testimonial updated', { id: toastId });
      router.push('/admin/testimonials');
    } catch (e: any) {
      toast.error(e?.message || 'Update failed', { id: toastId });
    }
  };

  return (
    <div>
      <h1 className='py-4 text-2xl'>Edit Testimonial</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='name'>Name</label>
          <div className='md:w-4/5'>
            <input id='name' className='input input-bordered w-full max-w-md' {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className='text-error'>{errors.name.message}</p>}
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='role'>Role</label>
          <div className='md:w-4/5'>
            <input id='role' className='input input-bordered w-full max-w-md' {...register('role')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='city'>City</label>
          <div className='md:w-4/5'>
            <input id='city' className='input input-bordered w-full max-w-md' {...register('city')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='rating'>Rating</label>
          <div className='md:w-4/5'>
            <input id='rating' type='number' min={1} max={5} className='input input-bordered w-full max-w-md' {...register('rating', { valueAsNumber: true })} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='order'>Order</label>
          <div className='md:w-4/5'>
            <input id='order' type='number' className='input input-bordered w-full max-w-md' {...register('order', { valueAsNumber: true })} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='published'>Published</label>
          <div className='md:w-4/5'>
            <input id='published' type='checkbox' className='toggle' {...register('published')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='quote'>Quote</label>
          <div className='md:w-4/5'>
            <textarea id='quote' rows={4} className='textarea textarea-bordered w-full max-w-xl' {...register('quote', { required: 'Quote is required' })} />
            {errors.quote && <p className='text-error'>{errors.quote.message}</p>}
          </div>
        </div>
        <button type='submit' className='btn btn-primary' disabled={isMutating}>
          {isMutating && <span className='loading loading-spinner'></span>}
          Save
        </button>
        <Link href='/admin/testimonials' className='btn ml-3'>Cancel</Link>
      </form>
    </div>
  );
}
