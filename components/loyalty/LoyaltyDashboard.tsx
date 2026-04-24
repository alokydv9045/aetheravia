"use client";
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LoyaltyData {
  points: number;
  tier: string;
  totalSpent: number;
  nextTierPoints: number;
  pointsToNextTier: number;
  rewardsHistory: Array<{
    _id: string;
    points: number;
    reason: string;
    date: string;
  }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LoyaltyDashboard() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR<LoyaltyData>(
    session ? '/api/user/loyalty' : null,
    fetcher
  );

  if (!session) {
    return (
      <div className="bg-surface-container-low p-12 text-center rounded-lg border border-outline-variant/10">
        <h2 className="font-headline text-3xl text-primary italic mb-6">Heritage Loyalty</h2>
        <p className="text-secondary font-body mb-8 opacity-70">Establish your credentials to view your heritage points and rewards!</p>
        <Link href="/signin" className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-surface-container-high rounded-lg"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-24 bg-surface-container-low rounded-lg"></div>
          <div className="h-24 bg-surface-container-low rounded-lg"></div>
          <div className="h-24 bg-surface-container-low rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-error/5 text-error rounded border border-error/10 font-body text-sm text-center">
        An anomaly occurred while sourcing your heritage records.
      </div>
    );
  }

  const getTierInfo = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return { label: 'Bronze', icon: '🥉', color: 'text-orange-700 bg-orange-50' };
      case 'silver': return { label: 'Silver', icon: '🥈', color: 'text-stone-600 bg-stone-100' };
      case 'gold': return { label: 'Gold', icon: '🥇', color: 'text-amber-700 bg-amber-50' };
      case 'platinum': return { label: 'Platinum', icon: '💎', color: 'text-primary bg-primary/5' };
      default: return { label: 'Seeker', icon: '⭐', color: 'text-secondary bg-secondary/5' };
    }
  };

  const tierInfo = getTierInfo(data.tier);
  const progressPercentage = data.nextTierPoints > 0 
    ? ((data.points - (data.nextTierPoints - data.pointsToNextTier)) / data.pointsToNextTier) * 100
    : 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Main Loyalty Card */}
      <div className="relative overflow-hidden bg-primary p-12 rounded-lg text-on-primary shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 pointer-events-none">
           <span className="material-symbols-outlined text-[120px]">auto_fix_high</span>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">Heritage Program</p>
              <h2 className="font-headline text-5xl italic">Ritual Rewards</h2>
            </div>
            <div className={`px-6 py-2 rounded-full font-label font-bold text-sm tracking-widest flex items-center gap-3 ${tierInfo.color}`}>
              <span>{tierInfo.icon}</span>
              {tierInfo.label.toUpperCase()} RANK
            </div>
          </div>
          
          <div className="max-w-md">
            <div className="flex items-end justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cumulative Essence (Points)</span>
              <span className="font-headline text-5xl">{data.points.toLocaleString()}</span>
            </div>
            
            {data.pointsToNextTier > 0 && (
              <div className="space-y-4">
                <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    className="absolute inset-0 bg-white" 
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  {data.pointsToNextTier.toLocaleString()} Essence required to attain higher rank
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Collective Exchange', val: `₹${data.totalSpent.toLocaleString('en-IN')}`, icon: 'payments' },
          { label: 'Essence Reserved', val: data.points.toLocaleString(), icon: 'stars' },
          { label: 'Current Rank', val: tierInfo.label, icon: 'military_tech' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 shadow-lg text-center">
            <span className="material-symbols-outlined text-primary/30 text-3xl mb-4">{stat.icon}</span>
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-60 mb-2">{stat.label}</h3>
            <p className="font-headline text-2xl text-primary italic">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Points History */}
      {data.rewardsHistory && data.rewardsHistory.length > 0 && (
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/10 overflow-hidden shadow-xl">
          <div className="p-8 border-b border-outline-variant/10">
            <h3 className="font-headline text-2xl text-secondary italic">Activity Record</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="bg-surface-container-high/50 text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60">
                <tr>
                  <th className="px-8 py-4">Epoch</th>
                  <th className="px-8 py-4">Interaction</th>
                  <th className="px-8 py-4 text-right">Essence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {data.rewardsHistory.slice(0, 5).map((activity) => (
                  <tr key={activity._id} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-8 py-6 opacity-60">{new Date(activity.date).toLocaleDateString()}</td>
                    <td className="px-8 py-6 font-medium">{activity.reason}</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`font-headline text-lg ${activity.points > 0 ? 'text-primary' : 'text-error'}`}>
                        {activity.points > 0 ? '+' : ''}{activity.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      <div className="space-y-8">
        <h3 className="font-headline text-3xl text-primary italic">Heritage Ranks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Bronze', p: '1 pt per ₹1', b: ['Birthday Ritual', 'Early Access'], c: 'text-orange-800' },
            { t: 'Silver', p: '1.5 pts per ₹1', b: ['Free Logistics', 'Curated Samples'], c: 'text-stone-600' },
            { t: 'Gold', p: '2 pts per ₹1', b: ['Priority Support', 'Exclusive Rituals'], c: 'text-amber-700' },
            { t: 'Platinum', p: '3 pts per ₹1', b: ['Personal Curator', 'VIP Heritage Events'], c: 'text-primary' }
          ].map((tier, i) => (
            <div key={i} className="p-8 bg-surface-container-low rounded border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <h4 className={`font-headline text-2xl italic mb-1 ${tier.c}`}>{tier.t}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-6">{tier.p}</p>
              <ul className="space-y-3">
                {tier.b.map((b, j) => (
                  <li key={j} className="text-[11px] font-body flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}