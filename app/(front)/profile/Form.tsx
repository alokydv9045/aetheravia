'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Form = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.name) setValue('name', data.name);
        if (data?.email) setValue('email', data.email);
      } catch {
        // ignore prefill errors
      }
    };
    loadProfile();
  }, [setValue]);

  const formSubmit: SubmitHandler<Inputs> = async (form) => {
    const { name, email, password } = form;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.status === 200) {
        toast.success('Identity record updated');
        const newSession = {
          ...session,
          user: { ...session?.user, name, email },
        };
        await update(newSession);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error updating archive');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-low p-8 md:p-12 rounded-lg border border-outline-variant/10 shadow-2xl shadow-primary/5"
    >
      <div className="mb-12">
        <h2 className="font-headline text-3xl text-primary italic mb-2">Core Identity</h2>
        <p className="text-secondary font-body text-sm opacity-60">Manage your central archive credentials.</p>
      </div>

      <form onSubmit={handleSubmit(formSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block pl-1" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="w-full bg-surface border-b border-outline-variant/30 px-4 py-4 font-body focus:border-primary transition-colors outline-none text-on-surface"
              placeholder="Your artisanal identifier"
            />
            {errors.name?.message && <p className="text-[10px] text-error font-bold uppercase tracking-widest mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block pl-1" htmlFor="email">
              Email Archive
            </label>
            <input
              type="text"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, message: 'Invalid archive link' }
              })}
              className="w-full bg-surface border-b border-outline-variant/30 px-4 py-4 font-body focus:border-primary transition-colors outline-none text-on-surface"
              placeholder="email@heritage.com"
            />
            {errors.email?.message && <p className="text-[10px] text-error font-bold uppercase tracking-widest mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block pl-1" htmlFor="password">
              New Cipher (Password)
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="w-full bg-surface border-b border-outline-variant/30 px-4 py-4 font-body focus:border-primary transition-colors outline-none text-on-surface"
              placeholder="Leave blank to preserve current"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block pl-1" htmlFor="confirmPassword">
              Confirm Cipher
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                validate: (value) => {
                  const { password } = getValues();
                  return !password || password === value || 'Ciphers must match';
                },
              })}
              className="w-full bg-surface border-b border-outline-variant/30 px-4 py-4 font-body focus:border-primary transition-colors outline-none text-on-surface"
              placeholder="Re-enter your cipher"
            />
            {errors.confirmPassword?.message && <p className="text-[10px] text-error font-bold uppercase tracking-widest mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="pt-12 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/10 flex items-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? 'Syncing...' : 'Update Record'}
            {!isSubmitting && <span className="material-symbols-outlined text-sm">save</span>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Form;
