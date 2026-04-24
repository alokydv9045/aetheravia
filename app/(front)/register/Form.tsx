'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type Inputs = {
  name: string;
  email: string;
  password: string;
  otp: string;
};

const Form = () => {
  const { data: session } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params?.get('callbackUrl') ?? '/';

  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      otp: '',
    },
  });

  const email = watch('email');

  useEffect(() => {
    // Capture referral code and store in cookie
    const ref = params?.get('ref');
    if (ref) {
      document.cookie = `referral_code=${ref}; path=/; max-age=3600; SameSite=Lax`;
    }

    if (session && session.user) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, session, params]);

  const sendOtp: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Verification code sent to your email');
        setStep(2);
      } else {
        toast.error(result.message || result.error?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Account created! Sign in to continue.');
        router.push(`/signin?callbackUrl=${callbackUrl}&success=Account has been created`);
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary-container relative overflow-hidden flex flex-col">
      {/* Grain Texture */}
      <div className="fixed inset-0 grain-texture z-0 pointer-events-none opacity-5"></div>

      <main className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Visual Column */}
        <section className="hidden lg:flex w-5/12 relative h-[calc(100vh-4rem)] p-4 pl-8 pt-8">
          <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl border border-outline-variant/10">
            <Image 
              alt="A synergy of Heritage" 
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4zU4jgi8b0gGvocqs3CaGPgcmqr3GiR0Z3oBRtzk8--Ut91qqu83xDrgaXJNCs9504zLaVzLFow6e3OST4dVq9Bwt1H88Iu6LO4qa2LDmRzcu_6Jhb63MbyozZuUyZ3w5khTtICQUuAFpa6r8FB3Lefup1idnlUlcqDiRzR3zMg_NS5fWWFX6PFEef6yhw9HYgqkduMBtWiLUd6NfVrrH1OYqpGmKadHQLC_00T7Tb9Clbk5zLBlkh2mhdRiAd2TmLvfXKJL-f5w6"
              fill
              sizes="40vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/10 to-transparent"></div>
            {/* Floating Text Box Overlay */}
            <div className="absolute bottom-8 left-8 max-w-[240px] p-5 bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 shadow-xl rounded-sm">
              <p className="text-primary italic text-[9px] mb-1 font-headline tracking-[0.2em] uppercase font-bold">The Alchemist's Blend</p>
              <p className="text-on-surface text-base leading-relaxed font-headline">A synergy of Heritage: Multani Mitti, Chandan, and Reetha.</p>
            </div>
          </div>
        </section>

        {/* Form Column */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 py-8 lg:px-16 bg-surface min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-sm space-y-8">
            {/* Step 1: Registration Form */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-headline text-on-surface tracking-tight leading-tight">Begin your Ritual</h1>
                  <p className="text-secondary font-body font-light text-base leading-relaxed opacity-70">Join our collective for a personalized artisanal experience.</p>
                </div>

                {/* Google Auth Button */}
                <div className="space-y-3">
                  <button 
                    disabled={isGoogleLoading || loading}
                    onClick={() => {
                      setIsGoogleLoading(true);
                      signIn('google', { callbackUrl });
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 group rounded-sm disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    )}
                    <span className="text-on-surface font-semibold font-label uppercase tracking-widest text-[9px]">
                      {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                    </span>
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="w-full border-t border-outline-variant/20"></div>
                    <span className="absolute px-4 bg-surface text-[9px] text-secondary font-label font-bold tracking-[0.2em] uppercase">OR USE EMAIL</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(sendOtp)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="name">FULL NAME</label>
                    <input 
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 placeholder:text-outline/30 rounded-t-sm text-sm" 
                      id="name" 
                      placeholder="Anya Sharma" 
                      type="text"
                    />
                    {errors.name && <p className="text-error text-[9px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="email">EMAIL ADDRESS</label>
                    <input 
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                      })}
                      className="w-full px-4 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 placeholder:text-outline/30 rounded-t-sm text-sm" 
                      id="email" 
                      placeholder="anya@archive.com" 
                      type="email"
                    />
                    {errors.email && <p className="text-error text-[9px] font-bold mt-1 ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="password">PASSWORD</label>
                    <div className="relative">
                      <input 
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Minimum 6 characters' }
                        })}
                        className="w-full px-4 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 placeholder:text-outline/30 rounded-t-sm text-sm" 
                        id="password" 
                        placeholder="••••••••" 
                        type={showPassword ? 'text' : 'password'}
                      />
                      <span 
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </div>
                    {errors.password && <p className="text-error text-[9px] font-bold mt-1 ml-1">{errors.password.message}</p>}
                  </div>

                  <div className="pt-2">
                    <button 
                      className="w-full bg-primary text-on-primary py-4 px-6 flex justify-between items-center group active:scale-[0.98] transition-all duration-300 disabled:opacity-50 rounded-sm shadow-xl shadow-primary/10" 
                      type="submit"
                      disabled={loading}
                    >
                      <span className="font-label uppercase font-bold tracking-[0.2em] text-[11px]">
                        {loading ? 'Processing...' : 'Send Verification Code'}
                      </span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-secondary font-body text-xs opacity-60">
                    Already have an account? 
                    <Link className="text-primary font-bold underline underline-offset-8 decoration-primary/20 hover:decoration-primary transition-all ml-2" href={`/signin?callbackUrl=${callbackUrl}`}>Login</Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="space-y-2">
                  <button 
                    onClick={() => setStep(1)} 
                    className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4 text-[9px] uppercase font-bold tracking-widest"
                  >
                    <span className="material-symbols-outlined text-xs">arrow_back</span>
                    Change details
                  </button>
                  <h1 className="text-3xl lg:text-4xl font-headline text-on-surface tracking-tight leading-tight">Secure your account</h1>
                  <p className="text-secondary font-body font-light text-base leading-relaxed opacity-70">
                    Verify it's you. We've sent a 6-digit code to <span className="text-primary font-semibold">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleSubmit(verifyOtp)} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="otp">VERIFICATION CODE</label>
                    <input 
                      {...register('otp', { 
                        required: 'OTP is required',
                        pattern: { value: /^\d{6}$/, message: 'Enter 6 digits' }
                      })}
                      className="w-full px-4 py-4 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 placeholder:text-outline/30 text-2xl tracking-[0.4em] text-center font-headline rounded-t-sm" 
                      id="otp" 
                      placeholder="000000" 
                      type="text"
                      maxLength={6}
                    />
                    {errors.otp && <p className="text-error text-[9px] font-bold mt-1 text-center">{errors.otp.message}</p>}
                  </div>

                  <div className="pt-2">
                    <button 
                      className="w-full bg-primary text-on-primary py-4 px-6 flex justify-between items-center group active:scale-[0.98] transition-all duration-300 disabled:opacity-50 rounded-sm shadow-xl shadow-primary/10" 
                      type="submit"
                      disabled={loading}
                    >
                      <span className="font-label uppercase font-bold tracking-[0.2em] text-[11px]">
                        {loading ? 'Verifying...' : 'Begin your Journey'}
                      </span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">auto_awesome</span>
                    </button>
                  </div>
                </form>

                <div className="text-center space-y-4">
                  <p className="text-secondary font-body text-[11px] opacity-60">
                    Didn't receive the code? 
                    <button 
                      onClick={() => sendOtp(getValues())} 
                      className="text-primary font-bold ml-2 hover:underline decoration-primary/20 transition-all uppercase tracking-widest text-[9px]"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        .grain-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default Form;
