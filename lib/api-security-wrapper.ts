import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSecurityLogger, SecurityEventType, ThreatLevel } from '@/lib/security-monitor-enhanced';
import { checkRateLimit, requiresCaptcha, recordAuthAttempt, verifyCaptcha } from '@/lib/advanced-rate-limit';
import { enhancedSecurity } from '@/lib/enhanced-security';

/**
 * Enterprise-grade API security wrapper
 * Provides comprehensive protection for all API endpoints
 */

interface SecurityOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  validateInput?: boolean;
  logAccess?: boolean;
  requireCaptcha?: boolean;
  customValidation?: (req: NextRequest) => Promise<boolean>;
}

interface ApiHandler {
  GET?: (req: NextRequest, context?: any) => Promise<NextResponse>;
  POST?: (req: NextRequest, context?: any) => Promise<NextResponse>;
  PUT?: (req: NextRequest, context?: any) => Promise<NextResponse>;
  DELETE?: (req: NextRequest, context?: any) => Promise<NextResponse>;
  PATCH?: (req: NextRequest, context?: any) => Promise<NextResponse>;
}

export function withApiSecurity(handlers: ApiHandler, options: SecurityOptions = {}) {
  const {
    requireAuth = false,
    requireAdmin = false,
    validateInput = true,
    logAccess = true,
    requireCaptcha = false,
    customValidation
  } = options;

  const secureHandler = async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const securityLogger = createSecurityLogger(req);
    const startTime = Date.now();
    const method = req.method as keyof ApiHandler;
    const { pathname } = req.nextUrl;

    try {
      // 1. Rate Limiting Check
      const rateLimitResult = await checkRateLimit(req);
      if (!rateLimitResult.allowed) {
        securityLogger.logRateLimitHit(pathname);
        
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: rateLimitResult.reason || 'Too many requests'
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }

      // 2. Authentication Check
      let session = null;
      if (requireAuth || requireAdmin) {
        const authResult = await auth();
        
        if (!authResult?.user) {
          securityLogger.logUnauthorizedAccess(pathname, 'authenticated_user');
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        session = authResult;
        
        // Admin check
        if (requireAdmin && !authResult.user.isAdmin) {
          securityLogger.logUnauthorizedAccess(pathname, 'admin');
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }
      }

      // 3. CAPTCHA Verification (for sensitive operations)
      if (requireCaptcha) {
        const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
        
        if (requiresCaptcha(clientIP)) {
          const captchaToken = req.headers.get('x-captcha-token');
          
          if (!captchaToken) {
            return NextResponse.json(
              { error: 'CAPTCHA verification required', requiresCaptcha: true },
              { status: 400 }
            );
          }
          
          const captchaValid = await verifyCaptcha(captchaToken);
          if (!captchaValid) {
            securityLogger.logSuspiciousActivity({
              type: 'captcha_failure',
              ip: clientIP,
              endpoint: pathname
            });
            
            return NextResponse.json(
              { error: 'CAPTCHA verification failed' },
              { status: 400 }
            );
          }
        }
      }

      // 4. Input Validation and Sanitization
      let sanitizedBody = null;
      if (validateInput && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        try {
          const rawBody = await req.json();
          const { sanitized, threats } = enhancedSecurity.sanitizeInput(rawBody);
          
          // Log any detected threats
          if (threats.length > 0) {
            securityLogger.logInputValidation('request_body', rawBody, threats.join(','));
            
            // Block request if critical threats detected
            const criticalThreats = threats.filter(threat => 
              threat.includes('injection') || threat.includes('xss') || threat.includes('command')
            );
            
            if (criticalThreats.length > 0) {
              securityLogger.logSuspiciousActivity({
                type: 'injection_attempt',
                threats: criticalThreats,
                threatLevel: ThreatLevel.CRITICAL,
                payload: JSON.stringify(rawBody).substring(0, 200)
              });
              
              return NextResponse.json(
                { error: 'Invalid input detected' },
                { status: 400 }
              );
            }
          }
          
          sanitizedBody = sanitized;
          
          // Replace request body with sanitized version
          (req as any)._sanitizedBody = sanitizedBody;
          
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
          );
        }
      }

      // 5. Custom Validation
      if (customValidation) {
        const isValid = await customValidation(req);
        if (!isValid) {
          securityLogger.logSuspiciousActivity({
            type: 'custom_validation_failure',
            endpoint: pathname
          });
          
          return NextResponse.json(
            { error: 'Validation failed' },
            { status: 400 }
          );
        }
      }

      // 6. Security Headers for API Response
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'X-API-Version': '2.0',
        'X-Security-Scan': 'passed'
      };

      // 7. Execute the handler
      const handler = handlers[method];
      if (!handler) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: { 'Allow': Object.keys(handlers).join(', ') } }
        );
      }

      // Log successful API access
      if (logAccess) {
        securityLogger.logDataAccess(
          session?.user?.id || 'anonymous',
          pathname,
          method
        );
      }

      // Execute handler with enhanced context
      const enhancedContext = {
        ...context,
        session,
        sanitizedBody,
        securityLogger,
        clientIP: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown'
      };

      const response = await handler(req, enhancedContext);

      // Add security headers to response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

      // Log response time for monitoring
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) { // Log slow responses
        securityLogger.logSuspiciousActivity({
          type: 'slow_response',
          endpoint: pathname,
          responseTime,
          threatLevel: ThreatLevel.LOW
        });
      }

      return response;

    } catch (error: any) {
      // Log security errors
      securityLogger.logSuspiciousActivity({
        type: 'api_error',
        error: error.message,
        endpoint: pathname,
        threatLevel: ThreatLevel.MEDIUM
      });

      console.error(`[API_SECURITY] Error in ${pathname}:`, error);

      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        },
        { status: 500 }
      );
    }
  };

  // Return handlers for each HTTP method
  const securedHandlers: any = {};
  
  Object.keys(handlers).forEach(method => {
    securedHandlers[method] = (req: NextRequest, context?: any) => 
      secureHandler(req, context);
  });

  return securedHandlers;
}

// Pre-configured security wrappers for common scenarios
export const withBasicSecurity = (handlers: ApiHandler) => 
  withApiSecurity(handlers, {
    validateInput: true,
    logAccess: true
  });

export const withAuthSecurity = (handlers: ApiHandler) => 
  withApiSecurity(handlers, {
    requireAuth: true,
    validateInput: true,
    logAccess: true
  });

export const withAdminSecurity = (handlers: ApiHandler) => 
  withApiSecurity(handlers, {
    requireAuth: true,
    requireAdmin: true,
    validateInput: true,
    logAccess: true,
    rateLimit: {
      maxRequests: 30,
      windowMs: 60 * 1000 // 1 minute
    }
  });

export const withHighSecurity = (handlers: ApiHandler) => 
  withApiSecurity(handlers, {
    requireAuth: true,
    validateInput: true,
    logAccess: true,
    requireCaptcha: true,
    rateLimit: {
      maxRequests: 10,
      windowMs: 60 * 1000 // 1 minute
    }
  });

// Utility function to get sanitized body from request
export async function getSanitizedBody(req: NextRequest): Promise<any> {
  // Check if body was already sanitized
  if ((req as any)._sanitizedBody) {
    return (req as any)._sanitizedBody;
  }
  
  // If not sanitized, parse it directly
  try {
    const body = await req.json();
    return body;
  } catch (error) {
    return {};
  }
}

// Helper for common validation patterns
export const validationHelpers = {
  // Validate MongoDB ObjectId
  isValidObjectId: (id: string): boolean => {
    return /^[a-fA-F0-9]{24}$/.test(id);
  },
  
  // Validate email format
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  },
  
  // Validate URL format
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Validate numeric range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
  
  // Validate string length
  isValidLength: (str: string, min: number, max: number): boolean => {
    return str.length >= min && str.length <= max;
  }
};

export default {
  withApiSecurity,
  withBasicSecurity,
  withAuthSecurity,
  withAdminSecurity,
  withHighSecurity,
  getSanitizedBody,
  validationHelpers
};