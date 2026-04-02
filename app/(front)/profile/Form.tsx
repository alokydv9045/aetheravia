'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

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
    // Load profile from DB instead of relying on session values
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          credentials: 'include',
        });
        if (!res.ok) return; // fall back silently
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
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      if (res.status === 200) {
        toast.success('Profile updated successfully');
        const newSession = {
          ...session,
          user: {
            ...session?.user,
            name,
            email,
          },
        };
        await update(newSession);
      } else {
        const data = await res.json();
        toast.error(data.message || 'error');
      }
    } catch (err: any) {
      const error =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message;
      toast.error(error);
    }
  };

  return (
    <div className='card mx-auto my-4 max-w-sm bg-base-300'>
      <div className='card-body'>
        <h1 className='card-title'>Profile</h1>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className='my-2'>
            <label className='label' htmlFor='name'>
              Name
            </label>
            <input
              type='text'
              id='name'
              {...register('name', {
                required: 'Name is required',
              })}
              className='input input-bordered w-full max-w-sm'
            />
            {errors.name?.message && (
              <div className='text-error'>{errors.name.message}</div>
            )}
          </div>
          <div className='my-2'>
            <label className='label' htmlFor='email'>
              Email
            </label>
            <input
              type='text'
              id='email'
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
                  message: 'Email is invalid',
                },
              })}
              className='input input-bordered w-full max-w-sm'
            />
            {errors.email?.message && (
              <div className='text-error'>{errors.email.message}</div>
            )}
          </div>
          <div className='my-2'>
            <label className='label' htmlFor='password'>
              New Password
            </label>
            <input
              type='password'
              id='password'
              {...register('password', {})}
              className='input input-bordered w-full max-w-sm'
            />
            {errors.password?.message && (
              <div className='text-error'>{errors.password.message}</div>
            )}
          </div>
          <div className='my-2'>
            <label className='label' htmlFor='confirmPassword'>
              Confirm New Password
            </label>
            <input
              type='password'
              id='confirmPassword'
              {...register('confirmPassword', {
                validate: (value) => {
                  const { password } = getValues();
                  return password === value || 'Passwords should match!';
                },
              })}
              className='input input-bordered w-full max-w-sm'
            />
            {errors.confirmPassword?.message && (
              <div className='text-error'>{errors.confirmPassword.message}</div>
            )}
          </div>

          <div className='my-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting && (
                <span className='loading loading-spinner'></span>
              )}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
