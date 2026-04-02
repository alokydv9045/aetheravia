"use client";
import React from 'react';
import useSWR from 'swr';
import { formatNumber } from '@/lib/utils';

const LoyaltyDetails = () => {
  const { data, error } = useSWR('/api/user/loyalty');

  if (error) return <div className="text-red-500">Failed to load loyalty info.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Points</h2>
        <div className="text-3xl font-bold text-primary">{formatNumber(data.points)}</div>
        <div className="text-gray-500">Tier: <span className="font-semibold">{data.tier}</span></div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-1">Available Rewards</h3>
        <ul className="list-disc ml-6">
          {data.rewards.length === 0 && <li>No rewards available.</li>}
          {data.rewards.map((reward: any) => (
            <li key={reward.id} className="mb-1">
              <span className="font-medium">{reward.name}</span> - {reward.points} pts
              {reward.redeemable && <button className="ml-2 px-2 py-1 bg-primary text-white rounded text-xs">Redeem</button>}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Points History</h3>
        <ul className="divide-y divide-gray-200">
          {data.history.length === 0 && <li>No history yet.</li>}
          {data.history.map((entry: any) => (
            <li key={entry.id} className="py-1 flex justify-between text-sm">
              <span>{entry.description}</span>
              <span className={entry.points > 0 ? 'text-green-600' : 'text-red-600'}>
                {entry.points > 0 ? '+' : ''}{entry.points}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyDetails;
