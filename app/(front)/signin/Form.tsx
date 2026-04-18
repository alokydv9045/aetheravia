'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

type Inputs = {
  email: string;
  password: string;
  otp: string;
};

const Form = () => {
  const params = useSearchParams();
  const { data: session } = useSession();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [resending, setResending] = useState(false);

  const callbackUrl = params?.get('callbackUrl') ?? '/';
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      email: '',
      password: '',
      otp: '',
    },
  });

  useEffect(() => {
    if (session && session.user) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, session]);

  const sendOtp = async () => {
    const { email, password } = getValues();
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      toast.success(data.message);
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formSubmit: SubmitHandler<Inputs> = async (form) => {
    const { email, password } = form;
    
    const result = await signIn('credentials', {
      email,
      password,
      // Pass a dummy OTP since the backend now ignores it but the provider might still expect the field
      otp: '000000', 
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      toast.error(result.error === 'CredentialsSignin' 
        ? 'Invalid email or password' 
        : result.error,
        { id: 'signin-error' }
      );
    } else if (result?.ok) {
      toast.success('Login successful! Welcome back.', { id: 'signin-success' });
      router.refresh();
      router.push(callbackUrl);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    await sendOtp();
    setTimeout(() => setResending(false), 30000); // 30s cooldown
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Noise grain for tactile texture */}
      <div className="fixed inset-0 noise-overlay z-[100] pointer-events-none"></div>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col md:flex-row w-full overflow-hidden">
        {/* Editorial Image Side */}
        <div className="hidden md:flex md:w-1/2 h-[calc(100vh-100px)] sticky top-0 bg-surface-container overflow-hidden">
          <div className="relative w-full h-full p-12 lg:p-20 flex items-center justify-center">
            {/* Asymmetric Image Layout */}
            <div className="relative w-full h-full">
              <Image 
                className="w-full h-full object-cover rounded shadow-sm grayscale-[20%]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYPGw_IvTtJyadjquc80iyRZtUZk-KYwK8xYFlnXifY4-cIEuZR_4c5VV63RbRXWe6VCQuxdSPlZwxQKVadMgXVvUbRD-MewRYgY1E-IrBp0karW0U2Nb_Kr5vZfBAQoIvxfsFPbD6hFanKS6H8VTbeYHBCYr765-E1yV5AAW1OmsFy7qO1qrMCta4-RU3c5rxjTDlnZKKB9cMEHItLQdY51J9MvHbyKlyajebezGZ21kHV5-JvIWes6EbHDvJJlm_0YocVD7A54eL"
                alt="Artisanal textures"
                fill
                priority
              />
              {/* Overlapping Caption Element */}
              <div className="absolute -bottom-4 -left-4 bg-surface-container-lowest p-6 max-w-xs shadow-xl rounded border border-outline-variant/10 z-20">
                <p className="font-headline italic text-primary text-xl leading-relaxed">
                  A synergy of Heritage: Multani Mitti, Chandan, and Reetha blended for timeless skin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface min-h-[calc(100vh-100px)]">
          <div className="w-full max-w-md">
            {/* Brand Header */}
            <div className="mb-12">
              <h1 className="text-2xl font-headline tracking-tight text-primary italic mb-2">The Artisanal Archive</h1>
              <h2 className="text-4xl font-headline font-bold text-on-surface leading-tight mb-4">Welcome back</h2>
              <p className="text-secondary font-body font-light">Return to your curated rituals of self-care.</p>
            </div>

            {/* Google Login Action */}
            <button 
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-outline-variant/30 rounded bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-300 group mb-8 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-label font-medium text-on-surface">Continue with Google</span>
            </button>

            <div className="relative mb-8 flex items-center">
              <div className="flex-grow border-t border-outline-variant/20"></div>
              <span className="px-4 text-[10px] font-label uppercase tracking-widest text-[#725a39]/60">Or use email</span>
              <div className="flex-grow border-t border-outline-variant/20"></div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
              {step === 'credentials' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="email">Email Address</label>
                    <input 
                      className={`w-full bg-surface-container border-0 border-b-2 transition-all duration-300 px-4 py-4 rounded-t focus:ring-0 font-body text-on-surface ${
                        errors.email ? 'border-error' : 'border-transparent focus:border-primary'
                      }`} 
                      id="email" 
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      placeholder="your@archive.com" 
                      type="email"
                    />
                    {errors.email?.message && <p className="text-error text-[10px] font-bold uppercase tracking-widest mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="password">Password</label>
                      <Link href="/contact" className="text-[10px] font-label text-primary hover:text-primary-container transition-colors uppercase tracking-widest font-bold">Forgot Password?</Link>
                    </div>
                    <input 
                      className={`w-full bg-surface-container border-0 border-b-2 transition-all duration-300 px-4 py-4 rounded-t focus:ring-0 font-body text-on-surface ${
                        errors.password ? 'border-error' : 'border-transparent focus:border-primary'
                      }`} 
                      id="password" 
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 1,
                          message: 'Password cannot be empty',
                        },
                      })}
                      placeholder="••••••••" 
                      type="password"
                    />
                    {errors.password?.message && <p className="text-error text-[10px] font-bold uppercase tracking-widest mt-1">{errors.password.message}</p>}
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-label text-secondary uppercase tracking-[0.2em] font-bold" htmlFor="otp">Verification Code</label>
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending || isSubmitting}
                        className="text-[10px] font-label text-primary hover:text-primary-container transition-colors uppercase tracking-widest font-bold disabled:opacity-50"
                      >
                        {resending ? 'Sending...' : 'Resend Code'}
                      </button>
                    </div>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                      <input 
                        className={`w-full bg-surface-container border-0 border-b-2 transition-all duration-300 pl-12 pr-4 py-4 rounded-t focus:ring-0 font-headline text-2xl tracking-[0.5em] text-center text-on-surface ${
                          errors.otp ? 'border-error' : 'border-transparent focus:border-primary'
                        }`} 
                        id="otp" 
                        {...register('otp', {
                          required: 'Verification code is required',
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: 'Please enter a 6-digit code',
                          },
                        })}
                        placeholder="000000" 
                        maxLength={6}
                        type="text"
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-secondary font-body mt-2">
                      Enter the 6-digit code sent to your archive email.
                    </p>
                    {errors.otp?.message && <p className="text-error text-[10px] font-bold uppercase tracking-widest mt-1">{errors.otp.message}</p>}
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setStep('credentials')}
                    className="text-[10px] font-label text-secondary hover:text-primary transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Change Email/Password
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-container text-white font-label font-bold py-5 rounded shadow-lg transition-all duration-300 tracking-[0.15em] text-[10px] uppercase flex items-center justify-center gap-3 disabled:opacity-70" 
                  type="submit"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {step === 'credentials' ? 'Access My Archive' : 'Verify My Identity'}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Navigation */}
            <div className="mt-12 text-center">
              <p className="font-body text-sm text-secondary">
                New to our heritage? 
                <Link 
                  href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="text-primary font-bold hover:underline underline-offset-4 ml-2 transition-all"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Embedded Footer (Page Specific Layout) */}
      <footer className="bg-surface-container-highest text-primary font-body text-[10px] uppercase tracking-[0.2em] font-bold w-full mt-auto flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8">
        <div className="flex-shrink-0">
          <span className="font-headline italic text-lg normal-case">The Artisanal Archive</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <Link className="text-secondary hover:text-primary transition-colors" href="/our-story">Sustainability</Link>
          <Link className="text-secondary hover:text-primary transition-colors" href="/shipping">Shipping</Link>
          <Link className="text-secondary hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="text-secondary hover:text-primary transition-colors" href="/terms">Terms</Link>
        </div>
        <div className="text-[#a09e9a]">
          © 2024 The Artisanal Archive. Handcrafted Heritage.
        </div>
      </footer>
    </div>
  );
};

export default Form;
