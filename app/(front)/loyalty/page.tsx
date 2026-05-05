'use client';

import { motion } from 'framer-motion';
import { Award, Gift, Sparkles, TrendingUp, ShieldCheck, History, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LoyaltyPage() {
  const { data: session } = useSession();
  const { data: loyaltyData, isLoading } = useSWR(session ? '/api/user/loyalty' : null, fetcher);

  const tiers = [
    { name: 'Novice', range: '0 - 500', benefits: ['Standard support', 'Birthday gift'], color: 'bg-stone-200' },
    { name: 'Seeker', range: '501 - 2000', benefits: ['5% off all orders', 'Early access to drops', 'Priority support'], color: 'bg-amber-100' },
    { name: 'Keeper', range: '2001 - 5000', benefits: ['10% off all orders', 'Free express shipping', 'Exclusive ritual kits'], color: 'bg-primary/20' },
    { name: 'Sage', range: '5001+', benefits: ['15% off all orders', 'Personal concierge', 'VIP heritage events'], color: 'bg-primary text-white' },
  ];

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-24">
        <div className="mb-20 text-center">
           <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-4">Heritage Rewards</p>
           <h1 className="font-headline text-5xl md:text-8xl text-on-surface italic mb-8">The Vault of Aether</h1>
           <p className="text-secondary font-body max-w-3xl mx-auto opacity-70 leading-relaxed text-lg">
             Your journey with AetherAvia is more than acquisition—it's an evolution. 
             Every ritual you bring home earns you points in the Vault, unlocking exclusive access to ancient wisdom and artisanal treasures.
           </p>
        </div>

        {/* User Stats Card */}
        {session ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/40 backdrop-blur-2xl border border-primary/10 rounded-[3rem] p-8 md:p-16 mb-24 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-2">Member Identity</p>
                <h2 className="text-4xl font-headline text-primary italic mb-1">{session.user.name}</h2>
                <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-4">
                  {loyaltyData?.tier || 'Novice'} Member
                </span>
              </div>
              
              <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-primary/5 py-12 md:py-0">
                <Award size={48} className="text-primary mb-6" strokeWidth={1} />
                <p className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-2">Vault Points</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-headline text-primary italic leading-none">{loyaltyData?.points || 0}</span>
                  <Sparkles size={20} className="text-primary animate-pulse" />
                </div>
              </div>
              
              <div className="text-center md:text-right flex flex-col items-center md:items-end">
                <p className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-4">Current Progress</p>
                <div className="w-full h-2 bg-primary/5 rounded-full overflow-hidden mb-4">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '45%' }}
                     className="h-full bg-primary"
                   />
                </div>
                <p className="text-[10px] text-secondary/60 font-medium">Next Tier: <span className="text-primary font-bold">Seeker</span> (350 points to go)</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-12 text-center mb-24">
            <h2 className="text-3xl font-headline text-primary italic mb-6">Enter the Vault</h2>
            <p className="text-secondary max-w-xl mx-auto mb-10 opacity-70">Sign in to track your points and unlock member-only heritage rewards.</p>
            <Link 
              href="/signin?callbackUrl=/loyalty" 
              className="bg-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary-container transition-all shadow-xl"
            >
              Sign In to Archive
            </Link>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-10 rounded-[2.5rem] border border-primary/5 transition-all hover:shadow-2xl hover:-translate-y-2 ${tier.color === 'bg-primary text-white' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/60 text-on-surface'}`}
            >
              <div className="mb-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">{tier.range} Pts</p>
                <h3 className="text-3xl font-headline italic">{tier.name}</h3>
              </div>
              <ul className="space-y-4">
                {tier.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-xs font-medium">
                    <ShieldCheck size={14} className={tier.color === 'bg-primary text-white' ? 'text-white' : 'text-primary'} />
                    <span className="opacity-80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* How it Works */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-headline text-primary italic mb-6">How to Accumulate Wisdom</h2>
              <p className="text-secondary opacity-70 leading-relaxed">
                Points are earned through interaction with the heritage. 
                For every ₹1 spent, you earn 1 Vault Point. You can also earn points through reviews and community engagement.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Gift size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">Acquisitions</h4>
                  <p className="text-xs text-secondary opacity-60">Earn 1 point for every ₹1 spent on any ritual artifact.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">Chronicles</h4>
                  <p className="text-xs text-secondary opacity-60">Submit a detailed review with images to earn 50 bonus points.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <History size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">Heritage Cycles</h4>
                  <p className="text-xs text-secondary opacity-60">Earn bonus points for consistent monthly ritual refills.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH8AX3rmkoojzeqfztDH33C-ozpMi8xQjEKjhtji4ruOcVsb0954dA2GzcdzSrw46FoznwjkYQZxwfDzwf4QR1UHwHCiW3tS109MOYGYhhgZgDkr23CBEtCAO5qH3esVdkE_Sr1MFgvW1Y-RaTZcYnD7z6zMWMKqNGH6g1l9KSDOISKVP8SBRSwIxD6y2Ul4BZTUJW_rvvdWaeuEQeB3ITG9URJYJq98lm5qkGV0X67XJ49vsGDAc1_E7N2Ty90IEzjdHaU_DvllbV" 
                className="w-full h-full object-cover"
                alt="AetherAvia Heritage"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 p-8 flex flex-col justify-center z-20 shadow-2xl">
               <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-2 opacity-60">Authenticity</p>
               <h4 className="text-white font-headline italic text-2xl">Grounded Rituals</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
