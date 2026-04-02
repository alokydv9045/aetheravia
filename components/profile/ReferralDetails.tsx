"use client";
import React from 'react';
import useSWR from 'swr';

const ReferralDetails = () => {
  const { data, error } = useSWR('/api/user/referral');

  if (error) return <div className="text-red-500">Failed to load referral info.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Referral Link</h2>
        <div className="flex items-center gap-2 mb-2">
          <input
            className="border px-2 py-1 rounded w-full"
            value={data.link}
            readOnly
            onFocus={e => e.target.select()}
          />
          <button
            className="bg-primary text-white px-3 py-1 rounded"
            onClick={() => navigator.clipboard.writeText(data.link)}
          >
            Copy
          </button>
        </div>
        <div className="text-gray-500 text-sm">Share this link to invite friends and earn rewards!</div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-1">Referred Users</h3>
        <ul className="list-disc ml-6">
          {data.referred.length === 0 && <li>No referrals yet.</li>}
          {data.referred.map((user: any) => (
            <li key={user.id} className="mb-1">
              <span className="font-medium">{user.name}</span> - Joined: {user.joined}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Earned Rewards</h3>
        <ul className="divide-y divide-gray-200">
          {data.rewards.length === 0 && <li>No rewards earned yet.</li>}
          {data.rewards.map((reward: any) => (
            <li key={reward.id} className="py-1 flex justify-between text-sm">
              <span>{reward.description}</span>
              <span className="text-green-600">+{reward.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReferralDetails;
