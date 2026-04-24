import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal, stable security proxy for Next.js 16 + Node v24
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Simplified route handling (no NextAuth for now to avoid PostCSS crash)
  
  return response;
}

// Ensure the proxy only runs on relevant paths to minimize worker overhead
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
