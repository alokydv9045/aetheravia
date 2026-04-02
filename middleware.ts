// cspell:ignore nosniff gstatic
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequestSecurity, createSecurityLogger, SecurityEventType, ThreatLevel } from './lib/security-monitor-enhanced';
import { checkRateLimit } from './lib/advanced-rate-limit';

const authConfig = {
  providers: [],
  trustHost: true, // Essential for production deployment
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    authorized({ request, auth }: any) {
      // All routes now use client-side authentication
      // Middleware provides comprehensive security and logging
      const protectedPaths: RegExp[] = [
        // No routes protected by middleware - all use client-side auth
      ];
      
      // Handle all authentication-required routes with client-side auth
      const clientSideAuthPaths = [
        /\/profile/,
        /\/shipping/,
        /\/payment/,
        /\/place-order/,
        /\/order\/(.*)/,  // Order details and history
      ];
      
      const { pathname } = request.nextUrl;
      const isProtectedPath = protectedPaths.some((p) => p.test(pathname));
      const isClientSideAuthPath = clientSideAuthPaths.some((p) => p.test(pathname));
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] Path: ${pathname}, Protected: ${isProtectedPath}, ClientAuth: ${isClientSideAuthPath}, Auth: ${!!auth}`);
        if (auth?.user) {
          console.log(`[Middleware] User: ${auth.user.email}`);
        }
      }
      
      // Allow all client-side auth routes to handle their own authentication
      if (isClientSideAuthPath) {
        return true;
      }
      
      // Allow access if not a protected path
      if (!isProtectedPath) {
        return true;
      }
      
      // For protected paths, require authentication
      if (!auth?.user) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Middleware] Blocking access to ${pathname} - no auth`);
        }
        return false;
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;

const { auth } = NextAuth(authConfig);

// Enterprise-grade security middleware
export default async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const securityLogger = createSecurityLogger(request);
  const { pathname } = request.nextUrl;
  
  try {
    // 1. Advanced Security Analysis
    const securityAnalysis = analyzeRequestSecurity(request);
    
    // Block immediately if IP is blocked or highly suspicious
    if (securityAnalysis.isBlocked) {
      securityLogger.logAPIAbuse({
        reason: 'IP_BLOCKED',
        details: securityAnalysis.reasons
      });
      
      return new NextResponse('Access Denied', { 
        status: 429,
        headers: {
          'Retry-After': '3600', // 1 hour
          'X-Security-Block': 'IP_BLOCKED'
        }
      });
    }
    
    // 2. Rate Limiting Check
    const rateLimitResult = await checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      securityLogger.logRateLimitHit(pathname);
      
      return new NextResponse('Rate Limit Exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      });
    }
    
    // 3. Suspicious Activity Detection
    if (securityAnalysis.isSuspicious) {
      securityLogger.logSuspiciousActivity({
        threatLevel: securityAnalysis.threatLevel,
        reasons: securityAnalysis.reasons,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      });
    }
    
    // 4. Bot Detection and Blocking
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousBots = [
      /nikto|sqlmap|burp|metasploit|nmap|masscan/i,
      /havij|pangolin|sqlninja|bbqsql/i,
      /w3af|skipfish|wpscan|dirb|gobuster/i
    ];
    
    if (suspiciousBots.some(pattern => pattern.test(userAgent))) {
      securityLogger.logSuspiciousActivity({
        type: 'malicious_bot_detected',
        userAgent,
        threatLevel: ThreatLevel.HIGH
      });
      
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // 5. Get authentication result
    const authResult = await auth(request as any);
    
    // 6. Create response with proper headers
    const response = authResult instanceof Response 
      ? authResult 
      : NextResponse.next();
    
    // 7. Add Comprehensive Security Headers
    
    // Basic Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Permissions Policy (Feature Policy successor)
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=*',
      'usb=()',
      'serial=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ');
    response.headers.set('Permissions-Policy', permissionsPolicy);
    
    // Strict Transport Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Content Security Policy with comprehensive coverage
    const nonce = generateNonce();
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' checkout.razorpay.com js.razorpay.com`,
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com data:",
      "img-src 'self' data: blob: res.cloudinary.com *.cloudinary.com",
      "connect-src 'self' api.razorpay.com lumberjack.razorpay.com vitals.vercel-insights.com https://api.cloudinary.com",
      "frame-src 'self' checkout.razorpay.com api.razorpay.com",
      "media-src 'self' data: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];
    
    // Relax CSP for development
    if (process.env.NODE_ENV === 'development') {
      cspDirectives[1] = `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' checkout.razorpay.com js.razorpay.com localhost:* ws: wss:`;
      cspDirectives[2] = "style-src 'self' 'unsafe-inline' fonts.googleapis.com checkout.razorpay.com";
      cspDirectives[5] = "connect-src 'self' api.razorpay.com lumberjack.razorpay.com vitals.vercel-insights.com https://api.cloudinary.com localhost:* ws: wss:";
      cspDirectives[6] = "frame-src 'self' checkout.razorpay.com api.razorpay.com localhost:*";
    }
    
    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
    
    // Security monitoring headers
    response.headers.set('X-Security-Version', '2.0');
    response.headers.set('X-Request-ID', generateRequestId());
    
    // Rate limiting headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    // Security monitoring for admin access
    if (pathname.includes('/admin')) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      securityLogger.logAdminAccess(
        'anonymous', // Will be updated in the component with actual user
        `admin_page_access:${pathname}`
      );
      
      // Extra security for admin routes
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    // Log successful request processing
    const processingTime = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] Request processed: ${pathname} (${processingTime}ms)`);
    }
    
    return response;
    
  } catch (error: any) {
    // Log security middleware errors
    console.error('[SECURITY] Middleware error:', {
      error: error.message,
      path: pathname,
      timestamp: new Date().toISOString()
    });
    
    // Fail securely - allow request to continue but log the error
    securityLogger.logSuspiciousActivity({
      type: 'middleware_error',
      error: error.message,
      threatLevel: ThreatLevel.MEDIUM
    });
    
    // Return basic auth result in case of middleware failure
    return auth(request as any);
  }
}

// Generate cryptographic nonce for CSP using Web Crypto API
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

// Generate request ID using Web Crypto API
function generateRequestId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled separately with specific security)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - file extensions (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.[a-zA-Z]+$).*)',
  ],
};
