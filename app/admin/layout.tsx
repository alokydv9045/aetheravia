'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    // Check if user is authenticated
    if (status === 'unauthenticated' || !session) {
      router.push('/signin?callbackUrl=/admin');
      return;
    }
    
    // Check if user is admin
    if (!session.user?.isAdmin) {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#725a39]"></div>
      </div>
    );
  }

  // Show redirecting message while redirecting
  if (status === 'unauthenticated' || !session || !session.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#725a39] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  return <AdminShell>{children}</AdminShell>;
}