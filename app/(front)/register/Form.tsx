'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus, User, Mail, Lock, CheckCircle } from 'lucide-react';

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Form = () => {
  const { data: session } = useSession();

  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params?.get('callbackUrl') ?? '/';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (session && session.user) {
      // Immediate redirect without delay
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, session]);

  const formSubmit: SubmitHandler<Inputs> = async (form) => {
    const { name, email, password } = form;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      
      if (res.ok) {
        toast.success('Account created successfully! Redirecting to login...');
        
        // Force immediate page refresh and redirect
        router.refresh();
        setTimeout(() => {
          router.push(`/signin?callbackUrl=${callbackUrl}&success=Account has been created`);
        }, 500); // Small delay to show success message
        
        return;
      } else {
        const data = await res.json();
        
        // Handle new structured error format
        if (data.error) {
          // Single error object
          throw new Error(data.error.message);
        } else if (data.errors && Array.isArray(data.errors)) {
          // Multiple validation errors
          const errorMessages = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(errorMessages);
        } else if (data.message) {
          // Fallback to old format
          throw new Error(data.message);
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        if (err.message.indexOf('E11000') === 0) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (err.message.includes('Password must')) {
          errorMessage = err.message;
        } else if (err.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (err.message.includes('Name must')) {
          errorMessage = 'Please enter a valid name (2-50 characters).';
        } else if (err.message.includes('character types')) {
          errorMessage = 'Password must include at least 3 of: uppercase letters, lowercase letters, numbers, or symbols.';
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-8" />
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-8 border-b border-green-100">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h1>
            <p className="text-center text-gray-600 text-sm">Join Aetheravia and discover natural beauty</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(formSubmit)} className="px-8 py-8 space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Full Name
                </div>
              </label>
              <input
                type="text"
                id="name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters long',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must not exceed 50 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Name can only contain letters and spaces',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                }`}
                placeholder="John Doe"
              />
              {errors.name?.message && (
                <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.name.message}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email?.message && (
                <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </div>
              </label>
              <input
                type="password"
                id="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Enter a strong password"
              />
              {errors.password?.message && (
                <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.password.message}</span>
                </div>
              )}
              {!errors.password && (
                <p className="text-xs text-gray-500 mt-2">Minimum 6 characters for security</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Confirm Password
                </div>
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const { password } = getValues();
                    return password === value || 'Passwords do not match';
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword?.message && (
                <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:shadow-lg hover:scale-105 active:scale-95 mt-6"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-gray-700">
              Already have an account?{' '}
              <Link 
                href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mt-8" />
      </div>
    </div>
  );
};

export default Form;
