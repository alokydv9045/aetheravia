"use client";

import { useState } from "react";

export default function Security() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const updatePassword = async () => {
    if (!password || password !== confirm) {
      setStatus("Passwords do not match");
      return;
    }
    const res = await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setStatus(res.ok ? 'Password updated' : 'Update failed');
    setPassword(""); setConfirm("");
  };

  return (
    <div className='w-full max-w-lg'>
      <h2 className='mb-4 text-lg font-semibold'>Security Settings</h2>
      <div className='space-y-6'>
        <div className='form-control gap-3'>
          <label className='label'>
            <span className='label-text font-medium'>Change Password</span>
          </label>
          <input className='input input-bordered w-full' type='password' placeholder='New password' value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className='input input-bordered w-full' type='password' placeholder='Confirm password' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className='btn btn-primary' onClick={updatePassword}>Change Password</button>
          {status && <p className='text-sm opacity-80'>{status}</p>}
        </div>
        
        <div className='card bg-base-200 border border-base-300'>
          <div className='card-body'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <div className='font-medium'>Two-Factor Authentication</div>
                <div className='text-sm opacity-80'>Add an extra layer of security to your account</div>
              </div>
              <input type='checkbox' className='toggle toggle-primary' checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} aria-label='Toggle 2FA' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
