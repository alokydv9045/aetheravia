/**
 * Security monitoring and event logging utilities
 * Tracks security events and suspicious activities
 */

interface SecurityEvent {
  type: 'auth_attempt' | 'failed_login' | 'admin_access' | 'api_abuse' | 'input_validation' | 'rate_limit';
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  route?: string;
  details?: any;
  timestamp: string;
}

// In-memory store for failed attempts (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const logSecurityEvent = (
  type: SecurityEvent['type'],
  details: Omit<SecurityEvent, 'type' | 'timestamp'>
) => {
  const event: SecurityEvent = {
    type,
    ...details,
    timestamp: new Date().toISOString(),
  };

  // Mask sensitive information for logging
  const safeEvent = {
    ...event,
    email: event.email ? `${event.email.substring(0, 3)}***@${event.email.split('@')[1] || 'hidden'}` : undefined,
    ip: event.ip ? `${event.ip.substring(0, 8)}***` : 'unknown',
    userAgent: event.userAgent ? event.userAgent.substring(0, 50) : undefined,
  };

  console.log(`[SECURITY] ${type.toUpperCase()}:`, safeEvent);

  // Store failed attempts for rate limiting
  if (type === 'failed_login' && details.ip) {
    const attempts = failedAttempts.get(details.ip) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    failedAttempts.set(details.ip, attempts);

    // Clean up old attempts (older than 1 hour)
    if (Date.now() - attempts.lastAttempt > 60 * 60 * 1000) {
      failedAttempts.delete(details.ip);
    }
  }
};

export const getFailedAttempts = (ip: string): number => {
  const attempts = failedAttempts.get(ip);
  if (!attempts) return 0;
  
  // Reset if older than 1 hour
  if (Date.now() - attempts.lastAttempt > 60 * 60 * 1000) {
    failedAttempts.delete(ip);
    return 0;
  }
  
  return attempts.count;
};

export const clearFailedAttempts = (ip: string): void => {
  failedAttempts.delete(ip);
};

export const isIPBlocked = (ip: string): boolean => {
  const attempts = getFailedAttempts(ip);
  return attempts >= 5; // Block after 5 failed attempts
};

// Security middleware helper
export const createSecurityLogger = (request: Request) => {
  const ip = (request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown').split(',')[0].trim();
  
  const userAgent = request.headers.get('user-agent') || '';
  
  return {
    logAuth: (userId?: string, email?: string, success: boolean = true) => {
      logSecurityEvent(success ? 'auth_attempt' : 'failed_login', {
        ip,
        userAgent,
        userId,
        email,
        route: new URL(request.url).pathname,
      });
    },
    logAdminAccess: (userId: string, email: string) => {
      logSecurityEvent('admin_access', {
        ip,
        userAgent,
        userId,
        email,
        route: new URL(request.url).pathname,
      });
    },
    logAPIAbuse: (details: any) => {
      logSecurityEvent('api_abuse', {
        ip,
        userAgent,
        route: new URL(request.url).pathname,
        details,
      });
    },
    logInputValidation: (field: string, value: string) => {
      logSecurityEvent('input_validation', {
        ip,
        userAgent,
        route: new URL(request.url).pathname,
        details: { field, invalidValue: value.substring(0, 20) },
      });
    },
  };
};

export default {
  logSecurityEvent,
  getFailedAttempts,
  clearFailedAttempts,
  isIPBlocked,
  createSecurityLogger,
};