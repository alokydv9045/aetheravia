import { NextRequest } from 'next/server';

import { auth as getSession } from './auth';

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !(session as any).user?.isAdmin) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return session;
}
