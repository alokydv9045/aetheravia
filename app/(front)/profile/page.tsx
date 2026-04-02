'use client';

import { Metadata } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import ProfileTabs from './ProfileTabs';

// Note: Since this is now a client component, metadata is handled by layout
const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Debug logging to understand the authentication flow
    console.log('[Profile Page Debug]', {
      status,
      hasSession: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isAdmin: session.user.isAdmin
      } : null
    });

    if (status === 'loading') {
      console.log('[Profile Page] Session still loading...');
      return;
    }
    
    if (status === 'unauthenticated' || !session) {
      console.log('[Profile Page] User not authenticated, redirecting to signin');
      // User is not authenticated, redirect to signin
      router.push('/signin?callbackUrl=/profile');
      return;
    }
    
    console.log('[Profile Page] User authenticated, showing profile');
    // User is authenticated, we can proceed
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Redirecting to sign in...</span>
      </div>
    );
  }

  return (
    <div>
      <ProfileTabs />
    </div>
  );
};

export default ProfilePage;
