import { NextRequest } from 'next/server';

// Security event types
export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  INPUT_VALIDATION = 'input_validation',
  API_ABUSE = 'api_abuse',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_ACCESS = 'admin_access',
  DATA_ACCESS = 'data_access',
  RATE_LIMIT_HIT = 'rate_limit_hit',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration',
  BRUTE_FORCE = 'brute_force',
  SESSION_HIJACK = 'session_hijack',
  ACCOUNT_ENUMERATION = 'account_enumeration'
}

// Security threat levels
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// In-memory threat tracking (in production, use Redis/database)
class ThreatTracker {
  private failedAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
  private suspiciousIPs = new Set<string>();
  private blockedIPs = new Set<string>();
  private sessionTracker = new Map<string, { userId: string; lastActivity: number; suspicious: boolean }>();

  // Track failed authentication attempts
  trackFailedAuth(ip: string): boolean {
    const now = Date.now();
    const record = this.failedAttempts.get(ip) || { count: 0, lastAttempt: 0, blocked: false };
    
    // Reset count if more than 1 hour passed
    if (now - record.lastAttempt > 3600000) {
      record.count = 0;
    }
    
    record.count++;
    record.lastAttempt = now;
    
    // Block after 5 failed attempts
    if (record.count >= 5) {
      record.blocked = true;
      this.blockedIPs.add(ip);
    }
    
    this.failedAttempts.set(ip, record);
    return record.blocked;
  }

  // Check if IP is blocked
  isBlocked(ip: string): boolean {
    const record = this.failedAttempts.get(ip);
    if (!record) return false;
    
    // Auto-unblock after 24 hours
    if (Date.now() - record.lastAttempt > 86400000) {
      this.failedAttempts.delete(ip);
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return record.blocked;
  }

  // Track suspicious activity patterns
  markSuspicious(ip: string): void {
    this.suspiciousIPs.add(ip);
  }

  // Track session activity
  trackSession(sessionId: string, userId: string): void {
    this.sessionTracker.set(sessionId, {
      userId,
      lastActivity: Date.now(),
      suspicious: false
    });
  }

  // Get threat statistics
  getThreatStats(): any {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Array.from(this.suspiciousIPs),
      failedAttempts: this.failedAttempts.size,
      activeSessions: this.sessionTracker.size
    };
  }

  // Clear old records (call periodically)
  cleanup(): void {
    const now = Date.now();
    const dayAgo = now - 86400000;
    
    for (const [ip, record] of this.failedAttempts.entries()) {
      if (record.lastAttempt < dayAgo) {
        this.failedAttempts.delete(ip);
        this.blockedIPs.delete(ip);
      }
    }
    
    for (const [sessionId, session] of this.sessionTracker.entries()) {
      if (session.lastActivity < dayAgo) {
        this.sessionTracker.delete(sessionId);
      }
    }
  }
}

// Global threat tracker instance
const threatTracker = new ThreatTracker();

// Security event logger
interface SecurityEvent {
  id: string;
  timestamp: string;
  type: SecurityEventType;
  threatLevel: ThreatLevel;
  ip: string;
  userAgent: string;
  userId?: string;
  email?: string;
  path: string;
  details: any;
  fingerprint: string;
}

// Security logger class
export class SecurityLogger {
  private request: NextRequest;
  private ip: string;
  private userAgent: string;
  private fingerprint: string;

  constructor(request: NextRequest) {
    this.request = request;
    this.ip = this.extractIP(request);
    this.userAgent = request.headers.get('user-agent') || 'unknown';
    this.fingerprint = ''; // Will be set asynchronously
    this.initializeFingerprint();
  }

  private async initializeFingerprint(): Promise<void> {
    this.fingerprint = await this.generateFingerprint(this.request);
  }

  private extractIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const cfConnecting = request.headers.get('cf-connecting-ip');
    
    return (cfConnecting || real || forwarded || request.ip || 'unknown').split(',')[0].trim();
  }

  private async generateFingerprint(request: NextRequest): Promise<string> {
    const components = [
      request.headers.get('user-agent') || '',
      request.headers.get('accept-language') || '',
      request.headers.get('accept-encoding') || '',
      this.ip
    ];
    
    // Use Web Crypto API for Edge Runtime compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(components.join('|'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  private generateRandomId(): string {
    // Generate random UUID-like string using Web Crypto API
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

  private logEvent(event: Partial<SecurityEvent>): void {
    const fullEvent: SecurityEvent = {
      id: this.generateRandomId(),
      timestamp: new Date().toISOString(),
      ip: this.ip,
      userAgent: this.userAgent,
      path: this.request.nextUrl.pathname,
      fingerprint: this.fingerprint,
      threatLevel: ThreatLevel.LOW,
      ...event
    } as SecurityEvent;

    // In production, send to security monitoring service
    console.log(`[SECURITY] ${fullEvent.type.toUpperCase()}:`, {
      id: fullEvent.id,
      timestamp: fullEvent.timestamp,
      threatLevel: fullEvent.threatLevel,
      ip: fullEvent.ip.substring(0, 8) + '***',
      userId: fullEvent.userId?.substring(0, 8) + '***' || 'anonymous',
      path: fullEvent.path,
      details: fullEvent.details
    });

    // Trigger alerts for high/critical threats
    if (fullEvent.threatLevel === ThreatLevel.HIGH || fullEvent.threatLevel === ThreatLevel.CRITICAL) {
      this.triggerSecurityAlert(fullEvent);
    }
  }

  private triggerSecurityAlert(event: SecurityEvent): void {
    // In production, integrate with alerting service (email, Slack, PagerDuty)
    console.error(`🚨 SECURITY ALERT [${event.threatLevel.toUpperCase()}]:`, {
      type: event.type,
      ip: event.ip,
      userId: event.userId,
      details: event.details,
      timestamp: event.timestamp
    });
  }

  // Specific logging methods
  logAuth(userId?: string, email?: string, success: boolean = true): void {
    if (!success) {
      threatTracker.trackFailedAuth(this.ip);
    }

    this.logEvent({
      type: success ? SecurityEventType.AUTH_SUCCESS : SecurityEventType.AUTH_FAILURE,
      threatLevel: success ? ThreatLevel.LOW : ThreatLevel.MEDIUM,
      userId,
      email,
      details: { success, timestamp: Date.now() }
    });
  }

  logInputValidation(field: string, value: any, violation?: string): void {
    const isSuspicious = this.detectSuspiciousInput(value, violation);
    
    this.logEvent({
      type: SecurityEventType.INPUT_VALIDATION,
      threatLevel: isSuspicious ? ThreatLevel.HIGH : ThreatLevel.LOW,
      details: {
        field,
        violation: violation || 'format_error',
        suspicious: isSuspicious,
        valueLength: typeof value === 'string' ? value.length : 0
      }
    });

    if (isSuspicious) {
      threatTracker.markSuspicious(this.ip);
    }
  }

  logAPIAbuse(details: any): void {
    this.logEvent({
      type: SecurityEventType.API_ABUSE,
      threatLevel: ThreatLevel.HIGH,
      details
    });
    
    threatTracker.markSuspicious(this.ip);
  }

  logSuspiciousActivity(details: any): void {
    this.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      threatLevel: ThreatLevel.HIGH,
      details
    });
    
    threatTracker.markSuspicious(this.ip);
  }

  logAdminAccess(userId: string, action: string): void {
    this.logEvent({
      type: SecurityEventType.ADMIN_ACCESS,
      threatLevel: ThreatLevel.MEDIUM,
      userId,
      details: { action, timestamp: Date.now() }
    });
  }

  logDataAccess(userId: string, resource: string, operation: string): void {
    this.logEvent({
      type: SecurityEventType.DATA_ACCESS,
      threatLevel: ThreatLevel.LOW,
      userId,
      details: { resource, operation, timestamp: Date.now() }
    });
  }

  logRateLimitHit(endpoint: string): void {
    this.logEvent({
      type: SecurityEventType.RATE_LIMIT_HIT,
      threatLevel: ThreatLevel.MEDIUM,
      details: { endpoint, timestamp: Date.now() }
    });
  }

  async logInjectionAttempt(type: 'sql' | 'nosql' | 'xss' | 'cmd', payload: string): Promise<void> {
    const eventType = type === 'sql' ? SecurityEventType.SQL_INJECTION_ATTEMPT : 
                     type === 'xss' ? SecurityEventType.XSS_ATTEMPT : 
                     SecurityEventType.SUSPICIOUS_ACTIVITY;

    // Hash payload using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const payloadHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    this.logEvent({
      type: eventType,
      threatLevel: ThreatLevel.CRITICAL,
      details: {
        injectionType: type,
        payloadHash,
        payloadLength: payload.length
      }
    });

    threatTracker.markSuspicious(this.ip);
  }

  logUnauthorizedAccess(resource: string, requiredRole?: string): void {
    this.logEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      threatLevel: ThreatLevel.HIGH,
      details: {
        resource,
        requiredRole,
        timestamp: Date.now()
      }
    });
  }

  logPrivilegeEscalation(userId: string, attemptedRole: string): void {
    this.logEvent({
      type: SecurityEventType.PRIVILEGE_ESCALATION,
      threatLevel: ThreatLevel.CRITICAL,
      userId,
      details: {
        attemptedRole,
        timestamp: Date.now()
      }
    });
  }

  private detectSuspiciousInput(value: any, violation?: string): boolean {
    if (typeof value !== 'string') return false;
    
    const suspiciousPatterns = [
      /(<script|<iframe|<object|<embed)/i,
      /(union\s+select|drop\s+table|delete\s+from)/i,
      /(\$ne|\$gt|\$lt|\$in|\$regex)/i,
      /(javascript:|data:|vbscript:)/i,
      /(eval\(|setTimeout\(|setInterval\()/i,
      /(\.\.\/)|(\\\.\\\.\\)/,
      /(cmd|powershell|bash|sh)\s/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(value));
  }
}

// Factory function to create security logger
export function createSecurityLogger(request: NextRequest): SecurityLogger {
  return new SecurityLogger(request);
}

// Check if IP is blocked
export function isIPBlocked(ip: string): boolean {
  return threatTracker.isBlocked(ip);
}

// Get threat statistics
export function getThreatStats(): any {
  return threatTracker.getThreatStats();
}

// Manual cleanup function
export function cleanupThreatTracker(): void {
  threatTracker.cleanup();
}

// Advanced security middleware helper
export function analyzeRequestSecurity(request: NextRequest): {
  isBlocked: boolean;
  isSuspicious: boolean;
  threatLevel: ThreatLevel;
  reasons: string[];
} {
  const logger = createSecurityLogger(request);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  const reasons: string[] = [];
  let threatLevel = ThreatLevel.LOW;
  let isSuspicious = false;

  // Check if IP is blocked
  const isBlocked = threatTracker.isBlocked(ip);
  if (isBlocked) {
    reasons.push('IP_BLOCKED');
    threatLevel = ThreatLevel.HIGH;
  }

  // Analyze user agent
  if (!userAgent || userAgent.length < 10) {
    reasons.push('SUSPICIOUS_USER_AGENT');
    isSuspicious = true;
    threatLevel = ThreatLevel.MEDIUM;
  }

  // Check for bot patterns
  const botPatterns = [
    /curl|wget|python|java|go-http|php/i,
    /scanner|crawler|bot|spider/i,
    /nikto|sqlmap|burp|metasploit/i
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('BOT_DETECTED');
    isSuspicious = true;
    threatLevel = ThreatLevel.MEDIUM;
  }

  // Analyze request frequency
  const path = request.nextUrl.pathname;
  if (path.includes('admin') || path.includes('api')) {
    if (threatLevel === ThreatLevel.LOW) {
      threatLevel = ThreatLevel.MEDIUM;
    }
  }

  return {
    isBlocked,
    isSuspicious,
    threatLevel,
    reasons
  };
}

export default {
  createSecurityLogger,
  isIPBlocked,
  getThreatStats,
  cleanupThreatTracker,
  analyzeRequestSecurity,
  SecurityEventType,
  ThreatLevel
};