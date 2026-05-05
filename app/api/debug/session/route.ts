import { auth } from '@/lib/auth';

export const GET = auth(async (req) => {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ message: 'This endpoint is disabled in production' }, { status: 403 });
  }

  const session = req.auth;
  
  return Response.json({
    authenticated: !!session,
    user: session?.user || null,
    sessionData: session || null
  });
});