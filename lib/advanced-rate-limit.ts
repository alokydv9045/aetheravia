import { NextRequest } from 'next/server';

// Advanced rate limiting with multiple strategies
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  skipIf?: (req: NextRequest) => boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, key: string) => void;
}

interface RateLimitRecord {
  requests: number[];
  blocked: boolean;
  blockUntil: number;
  firstRequest: number;
}

// In-memory store (use Redis in production)
class RateLimitStore {
  private store = new Map<string, RateLimitRecord>();
  private readonly maxStoreSize = 10000; // Prevent memory leaks

  get(key: string): RateLimitRecord | undefined {
    return this.store.get(key);
  }

  set(key: string, record: RateLimitRecord): void {
    // Prevent memory overflow
    if (this.store.size >= this.maxStoreSize) {
      this.cleanup();
    }
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, record] of this.store.entries()) {
      // Remove records older than 1 hour
      if (now - record.firstRequest > 3600000) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  size(): number {
    return this.store.size;
  }
}

class AdvancedRateLimit {
  private store = new RateLimitStore();
  private configs = new Map<string, RateLimitConfig>();

  // Register rate limit configuration for endpoints
  registerEndpoint(pattern: string, config: RateLimitConfig): void {
    this.configs.set(pattern, config);
  }

  // Check if request should be rate limited
  async checkLimit(request: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    reason?: string;
  }> {
    const path = request.nextUrl.pathname;
    const config = this.findMatchingConfig(path);
    
    if (!config) {
      return { allowed: true, limit: 0, remaining: 0, resetTime: 0 };
    }

    // Skip rate limiting if condition met
    if (config.skipIf && config.skipIf(request)) {
      return { allowed: true, limit: config.maxRequests, remaining: config.maxRequests, resetTime: 0 };
    }

    const key = config.keyGenerator ? config.keyGenerator(request) : this.defaultKeyGenerator(request);
    const now = Date.now();
    
    let record = this.store.get(key);
    
    if (!record) {
      record = {
        requests: [now],
        blocked: false,
        blockUntil: 0,
        firstRequest: now
      };
      this.store.set(key, record);
      return { 
        allowed: true, 
        limit: config.maxRequests, 
        remaining: config.maxRequests - 1, 
        resetTime: now + config.windowMs 
      };
    }

    // Check if currently blocked
    if (record.blocked && now < record.blockUntil) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: record.blockUntil,
        reason: 'Rate limit exceeded'
      };
    }

    // Remove blocked status if block period expired
    if (record.blocked && now >= record.blockUntil) {
      record.blocked = false;
      record.requests = [];
    }

    // Remove requests outside the window
    const windowStart = now - config.windowMs;
    record.requests = record.requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (record.requests.length >= config.maxRequests) {
      record.blocked = true;
      record.blockUntil = now + config.blockDurationMs;
      
      if (config.onLimitReached) {
        config.onLimitReached(request, key);
      }

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: record.blockUntil,
        reason: 'Rate limit exceeded'
      };
    }

    // Add current request
    record.requests.push(now);
    this.store.set(key, record);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.requests.length,
      resetTime: now + config.windowMs
    };
  }

  private findMatchingConfig(path: string): RateLimitConfig | undefined {
    for (const [pattern, config] of this.configs.entries()) {
      if (pattern === '*' || path.includes(pattern) || new RegExp(pattern).test(path)) {
        return config;
      }
    }
    return undefined;
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    return `${ip}:${request.nextUrl.pathname}`;
  }

  // Get rate limit statistics
  getStats(): any {
    return {
      storeSize: this.store.size(),
      configuredEndpoints: Array.from(this.configs.keys()),
      totalConfigs: this.configs.size
    };
  }

  // Manual cleanup
  cleanup(): void {
    this.store.cleanup();
  }
}

// Global rate limiter instance
const advancedRateLimit = new AdvancedRateLimit();

// Initialize default rate limit configurations
advancedRateLimit.registerEndpoint('/api/auth/register', {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 10, // 10 registration attempts per IP per hour (more reasonable)
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes (shorter block)
  onLimitReached: (req, key) => {
    console.warn(`[RATE_LIMIT] Registration limit exceeded for ${key}`);
  }
});

advancedRateLimit.registerEndpoint('/api/auth/signin', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  onLimitReached: (req, key) => {
    console.warn(`[RATE_LIMIT] Login limit exceeded for ${key}`);
  }
});

advancedRateLimit.registerEndpoint('/api/admin', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 admin API calls per minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
  skipIf: (req) => {
    // Skip for localhost in development
    const ip = req.headers.get('x-forwarded-for') || req.ip;
    return process.env.NODE_ENV === 'development' && (ip === '127.0.0.1' || ip === '::1');
  }
});

advancedRateLimit.registerEndpoint('/api/orders', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 order operations per minute
  blockDurationMs: 10 * 60 * 1000, // Block for 10 minutes
});

advancedRateLimit.registerEndpoint('/api/user', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 user API calls per minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

// General API rate limit (catch-all)
advancedRateLimit.registerEndpoint('/api', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 API calls per minute
  blockDurationMs: 2 * 60 * 1000, // Block for 2 minutes
});

// Aggressive rate limiting for suspicious patterns
export function createSuspiciousActivityLimiter(identifier: string): Promise<boolean> {
  const suspiciousConfig: RateLimitConfig = {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 1, // Only 1 request per 10 minutes for suspicious IPs
    blockDurationMs: 24 * 60 * 60 * 1000, // Block for 24 hours
  };

  // Create a mock request for the limiter
  const mockRequest = {
    nextUrl: { pathname: '/suspicious' },
    headers: new Map([['x-forwarded-for', identifier]]),
    ip: identifier
  } as any;

  return advancedRateLimit.checkLimit(mockRequest).then(result => result.allowed);
}

// CAPTCHA integration helper
interface CaptchaConfig {
  enabled: boolean;
  threshold: number; // Number of failed attempts before requiring CAPTCHA
  providers: ('recaptcha' | 'hcaptcha' | 'turnstile')[];
}

class CaptchaManager {
  private failedAttempts = new Map<string, number>();
  private config: CaptchaConfig = {
    enabled: process.env.NODE_ENV === 'production',
    threshold: 3,
    providers: ['recaptcha']
  };

  requiresCaptcha(identifier: string): boolean {
    if (!this.config.enabled) return false;
    
    const attempts = this.failedAttempts.get(identifier) || 0;
    return attempts >= this.config.threshold;
  }

  recordFailedAttempt(identifier: string): void {
    const current = this.failedAttempts.get(identifier) || 0;
    this.failedAttempts.set(identifier, current + 1);
  }

  recordSuccessfulAttempt(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  async verifyCaptcha(token: string, provider: string = 'recaptcha'): Promise<boolean> {
    if (!this.config.enabled) return true;

    try {
      switch (provider) {
        case 'recaptcha':
          return await this.verifyRecaptcha(token);
        case 'hcaptcha':
          return await this.verifyHCaptcha(token);
        case 'turnstile':
          return await this.verifyTurnstile(token);
        default:
          return false;
      }
    } catch (error) {
      console.error(`CAPTCHA verification failed:`, error);
      return false;
    }
  }

  private async verifyRecaptcha(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return true; // Skip if not configured

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });

    const data = await response.json();
    return data.success === true;
  }

  private async verifyHCaptcha(token: string): Promise<boolean> {
    const secret = process.env.HCAPTCHA_SECRET_KEY;
    if (!secret) return true;

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });

    const data = await response.json();
    return data.success === true;
  }

  private async verifyTurnstile(token: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true;

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });

    const data = await response.json();
    return data.success === true;
  }
}

// Global CAPTCHA manager
const captchaManager = new CaptchaManager();

// Export functions
export async function checkRateLimit(request: NextRequest) {
  return advancedRateLimit.checkLimit(request);
}

export function requiresCaptcha(identifier: string): boolean {
  return captchaManager.requiresCaptcha(identifier);
}

export function recordAuthAttempt(identifier: string, success: boolean): void {
  if (success) {
    captchaManager.recordSuccessfulAttempt(identifier);
  } else {
    captchaManager.recordFailedAttempt(identifier);
  }
}

export async function verifyCaptcha(token: string, provider?: string): Promise<boolean> {
  return captchaManager.verifyCaptcha(token, provider);
}

export function getRateLimitStats(): any {
  return advancedRateLimit.getStats();
}

export function cleanupRateLimit(): void {
  advancedRateLimit.cleanup();
}

export default {
  checkRateLimit,
  requiresCaptcha,
  recordAuthAttempt,
  verifyCaptcha,
  getRateLimitStats,
  cleanupRateLimit,
  createSuspiciousActivityLimiter
};