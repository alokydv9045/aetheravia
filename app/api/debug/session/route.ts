import { auth } from '@/lib/auth';

export const GET = auth(async (req) => {
  const session = req.auth;
  
  return Response.json({
    authenticated: !!session,
    user: session?.user || null,
    sessionData: session || null
  });
});