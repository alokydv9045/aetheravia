import { SessionProvider } from 'next-auth/react';

import { auth } from '@/lib/auth';

import ClientProvider from './ClientProvider';

const Providers = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider 
      session={session}
      // Optimize session refresh for faster updates
      refetchInterval={60} // Refetch session every 60 seconds when tab is focused
      refetchOnWindowFocus={true} // Refetch immediately when window regains focus
      refetchWhenOffline={false} // Don't refetch when offline
    >
      <ClientProvider>{children}</ClientProvider>
    </SessionProvider>
  );
};

export default Providers;
