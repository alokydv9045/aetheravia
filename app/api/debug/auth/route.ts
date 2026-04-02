import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const GET = auth(async (req: any) => {
  const authData = req.auth;
  
  return NextResponse.json({
    message: 'Auth Debug Endpoint',
    timestamp: new Date().toISOString(),
    hasAuth: !!authData,
    authKeys: authData ? Object.keys(authData) : [],
    user: authData?.user ? {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.name,
      isAdmin: authData.user.isAdmin
    } : null,
    cookies: {
      sessionToken: req.cookies.get('next-auth.session-token')?.value ? 'present' : 'missing',
      secureSessionToken: req.cookies.get('__Secure-next-auth.session-token')?.value ? 'present' : 'missing',
    },
    headers: {
      authorization: req.headers.get('authorization') ? 'present' : 'missing',
      cookie: req.headers.get('cookie') ? 'present' : 'missing',
    }
  });
}) as any;