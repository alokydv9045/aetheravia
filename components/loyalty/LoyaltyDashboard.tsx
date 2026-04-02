"use client";
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';

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
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body text-center">
          <h2 className="card-title justify-center">Loyalty Program</h2>
          <p>Sign in to view your loyalty points and rewards!</p>
          <Link href="/signin" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="alert alert-error">
            <span>Failed to load loyalty data</span>
          </div>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '⭐';
    }
  };

  const progressPercentage = data.nextTierPoints > 0 
    ? ((data.points - (data.nextTierPoints - data.pointsToNextTier)) / data.pointsToNextTier) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Main Loyalty Card */}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title text-white text-2xl">
                Loyalty Rewards
              </h2>
              <p className="opacity-90">Member since {new Date().getFullYear()}</p>
            </div>
            <div className="text-right">
              <div className={`badge badge-lg ${getTierColor(data.tier)} text-lg font-bold px-4 py-2`}>
                {getTierIcon(data.tier)} {data.tier.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">Current Points</span>
              <span className="text-3xl font-bold">{data.points.toLocaleString()}</span>
            </div>
            
            {data.pointsToNextTier > 0 && (
              <>
                <div className="flex items-center justify-between text-sm opacity-90 mb-2">
                  <span>{data.pointsToNextTier} points to next tier</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="progress progress-accent bg-white bg-opacity-30">
                  <div 
                    className="progress-accent bg-white" 
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold">Total Spent</h3>
            <p className="text-2xl font-bold text-primary">
              ₹{data.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow">
          <div className="card-body text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-bold">Current Points</h3>
            <p className="text-2xl font-bold text-secondary">
              {data.points.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow">
          <div className="card-body text-center">
            <div className="text-3xl mb-2">{getTierIcon(data.tier)}</div>
            <h3 className="font-bold">Member Tier</h3>
            <p className="text-2xl font-bold text-accent">
              {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Points History */}
      {data.rewardsHistory && data.rewardsHistory.length > 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Recent Points Activity</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rewardsHistory.slice(0, 10).map((activity) => (
                    <tr key={activity._id}>
                      <td>{new Date(activity.date).toLocaleDateString()}</td>
                      <td>{activity.reason}</td>
                      <td>
                        <span className={`font-bold ${
                          activity.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.points > 0 ? '+' : ''}{activity.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Tier Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold text-orange-600">🥉 Bronze</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• 1 point per ₹1 spent</li>
                <li>• Birthday discount</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold text-gray-600">🥈 Silver</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• 1.5 points per ₹1 spent</li>
                <li>• Free shipping</li>
                <li>• Early sale access</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold text-yellow-600">🥇 Gold</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• 2 points per ₹1 spent</li>
                <li>• Priority support</li>
                <li>• Exclusive offers</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold text-purple-600">💎 Platinum</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• 3 points per ₹1 spent</li>
                <li>• Personal stylist</li>
                <li>• VIP events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}