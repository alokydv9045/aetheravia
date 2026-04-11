'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { clearInvalidSession, isValidSession } from '@/lib/sessionRecovery';

export default function AuthErrorRecovery() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH RECOVERY] Session status:', status, 'Session:', session);
    }

    // If we're in an error state or have an invalid session
    if (status === 'unauthenticated' && session === null) {
      // Check if there might be corrupted cookies causing issues
      const cookies = document.cookie;
      if (cookies.includes('next-auth.session-token') || cookies.includes('__Secure-next-auth.session-token')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AUTH RECOVERY] Found potentially corrupted session cookies, clearing...');
        }
        clearInvalidSession();
      }
    }

    // If we have a session but it's invalid
    if (session && !isValidSession(session)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH RECOVERY] Invalid session detected, clearing...');
      }
      clearInvalidSession();
      // Reload the page to restart the auth flow
      window.location.reload();
    }
  }, [session, status]);

  return null; // This component doesn't render anything 
}