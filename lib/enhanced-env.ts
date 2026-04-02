import { z } from 'zod';

/**
 * Enhanced environment configuration with security validation
 * Ensures all security-critical environment variables are properly configured
 */

// Enhanced environment schema with security requirements
const EnhancedEnvSchema = z.object({
  // Core Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).optional(),
  
  // Security-Critical - Required in production
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Enhanced Authentication Security
  AUTH_TRUST_HOST: z.string().default('true'),
  AUTH_DEBUG: z.string().default('false'),
  SESSION_MAX_AGE: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 86400),
  SESSION_UPDATE_AGE: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 3600),
  
  // Password Security
  PASSWORD_MIN_LENGTH: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 12),
  PASSWORD_SALT_ROUNDS: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 12),
  
  // Rate Limiting & Security
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ENABLE_RATE_LIMITING: z.string().default('true'),
  
  // CAPTCHA Configuration
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  RECAPTCHA_SITE_KEY: z.string().optional(),
  HCAPTCHA_SECRET_KEY: z.string().optional(),
  HCAPTCHA_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  
  // Security Monitoring
  SECURITY_WEBHOOK_URL: z.string().url().optional(),
  SECURITY_ALERT_EMAIL: z.string().email().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Payment Security
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // File Upload Security
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 10485760),
  ALLOWED_FILE_TYPES: z.string().optional().default('image/jpeg,image/png,image/gif,image/webp'),
  
  // Email Security
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // CORS & Security Headers
  ALLOWED_ORIGINS: z.string().optional().default(''),
  CORS_CREDENTIALS: z.string().default('true'),
  
  // Branding (Public)
  NEXT_PUBLIC_BRAND_NAME: z.string().optional(),
  NEXT_PUBLIC_BRAND_TAGLINE: z.string().optional(),
  NEXT_PUBLIC_SHOP_ADDRESS: z.string().optional(),
  
  // Advanced Security Features
  ENABLE_2FA: z.string().default('false'),
  ENABLE_EMAIL_VERIFICATION: z.string().default('true'),
  ENABLE_LOGIN_NOTIFICATIONS: z.string().default('true'),
  ENABLE_SUSPICIOUS_LOGIN_DETECTION: z.string().default('true'),
  
  // Compliance & Audit
  GDPR_COMPLIANCE: z.string().default('true'),
  AUDIT_LOG_RETENTION_DAYS: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 90),
  
  // Performance & Security
  REQUEST_TIMEOUT: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 30000),
  MAX_REQUEST_SIZE: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1048576),
  
  // Feature Flags
  FEATURE_ADMIN_DASHBOARD: z.string().default('true'),
  FEATURE_SECURITY_MONITORING: z.string().default('true'),
  FEATURE_ADVANCED_ANALYTICS: z.string().default('false'),
});

// Validate and parse environment variables
const parseEnvironment = () => {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    
    // Core
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    
    // Auth Security
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_DEBUG: process.env.AUTH_DEBUG,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
    SESSION_UPDATE_AGE: process.env.SESSION_UPDATE_AGE,
    
    // Password
    PASSWORD_MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH,
    PASSWORD_SALT_ROUNDS: process.env.PASSWORD_SALT_ROUNDS,
    
    // Rate Limiting
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
    
    // CAPTCHA
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
    HCAPTCHA_SITE_KEY: process.env.HCAPTCHA_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
    
    // Monitoring
    SECURITY_WEBHOOK_URL: process.env.SECURITY_WEBHOOK_URL,
    SECURITY_ALERT_EMAIL: process.env.SECURITY_ALERT_EMAIL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    
    // Payment
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    
    // File Upload
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
    
    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    
    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS,
    
    // Branding
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
    NEXT_PUBLIC_BRAND_TAGLINE: process.env.NEXT_PUBLIC_BRAND_TAGLINE,
    NEXT_PUBLIC_SHOP_ADDRESS: process.env.NEXT_PUBLIC_SHOP_ADDRESS,
    
    // Advanced Features
    ENABLE_2FA: process.env.ENABLE_2FA,
    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION,
    ENABLE_LOGIN_NOTIFICATIONS: process.env.ENABLE_LOGIN_NOTIFICATIONS,
    ENABLE_SUSPICIOUS_LOGIN_DETECTION: process.env.ENABLE_SUSPICIOUS_LOGIN_DETECTION,
    
    // Compliance
    GDPR_COMPLIANCE: process.env.GDPR_COMPLIANCE,
    AUDIT_LOG_RETENTION_DAYS: process.env.AUDIT_LOG_RETENTION_DAYS,
    
    // Performance
    REQUEST_TIMEOUT: process.env.REQUEST_TIMEOUT,
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE,
    
    // Features
    FEATURE_ADMIN_DASHBOARD: process.env.FEATURE_ADMIN_DASHBOARD,
    FEATURE_SECURITY_MONITORING: process.env.FEATURE_SECURITY_MONITORING,
    FEATURE_ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS,
  };

  const parsed = EnhancedEnvSchema.safeParse(env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n  - ');
    throw new Error(`❌ Invalid environment configuration:\n  - ${issues}`);
  }

  return parsed.data;
};

// Security configuration checks
export const checkSecurityConfiguration = () => {
  const env = getEnv();
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  // Critical security checks
  if (env.NODE_ENV === 'production') {
    if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters in production');
    }
    
    if (!env.MONGODB_URI.includes('mongodb+srv://') && !env.MONGODB_URI.includes('ssl=true')) {
      warnings.push('Consider using encrypted MongoDB connection in production');
    }
    
    if (!env.UPSTASH_REDIS_REST_URL) {
      warnings.push('Rate limiting disabled - consider setting up Upstash Redis');
    }
    
    if (!env.RECAPTCHA_SECRET_KEY && !env.HCAPTCHA_SECRET_KEY && !env.TURNSTILE_SECRET_KEY) {
      warnings.push('No CAPTCHA provider configured - consider adding for enhanced security');
    }
    
    if (!env.SECURITY_ALERT_EMAIL) {
      recommendations.push('Set SECURITY_ALERT_EMAIL for security notifications');
    }
  }

  // Password security checks
  if (env.PASSWORD_MIN_LENGTH < 12) {
    warnings.push('Password minimum length should be at least 12 characters');
  }
  
  if (env.PASSWORD_SALT_ROUNDS < 12) {
    warnings.push('Consider increasing password salt rounds to 12+ for better security');
  }

  // Feature recommendations
  if (env.ENABLE_2FA === 'false') {
    recommendations.push('Enable 2FA for enhanced account security');
  }
  
  if (env.ENABLE_EMAIL_VERIFICATION === 'false') {
    recommendations.push('Enable email verification for account validation');
  }

  return {
    score: calculateSecurityScore(env, warnings, errors),
    errors,
    warnings,
    recommendations,
    status: errors.length === 0 ? (warnings.length === 0 ? 'excellent' : 'good') : 'needs_attention'
  };
};

const calculateSecurityScore = (env: any, warnings: string[], errors: string[]): number => {
  let score = 100;
  
  // Deduct points for errors and warnings
  score -= errors.length * 20;
  score -= warnings.length * 5;
  
  // Bonus points for security features
  if (env.UPSTASH_REDIS_REST_URL) score += 5;
  if (env.RECAPTCHA_SECRET_KEY || env.HCAPTCHA_SECRET_KEY || env.TURNSTILE_SECRET_KEY) score += 5;
  if (env.ENABLE_2FA === 'true') score += 10;
  if (env.ENABLE_EMAIL_VERIFICATION === 'true') score += 5;
  if (env.PASSWORD_MIN_LENGTH >= 12) score += 5;
  if (env.PASSWORD_SALT_ROUNDS >= 14) score += 5;
  
  return Math.max(0, Math.min(100, score));
};

// Lazy initialization to handle startup errors gracefully
let envConfig: ReturnType<typeof parseEnvironment> | null = null;

export const getEnv = () => {
  if (!envConfig) {
    try {
      envConfig = parseEnvironment();
    } catch (error) {
      console.error('Environment configuration error:', error);
      
      // In development, provide helpful error messages
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔧 Environment Setup Help:');
        console.log('1. Copy .env.example to .env.local');
        console.log('2. Fill in required environment variables');
        console.log('3. Restart the development server');
        console.log('\nRequired variables:');
        console.log('- MONGODB_URI');
        console.log('- NEXTAUTH_SECRET (32+ characters)');
      }
      
      throw error;
    }
  }
  return envConfig;
};

// Utility functions for feature flags
export const isFeatureEnabled = (feature: string): boolean => {
  const env = getEnv();
  switch (feature) {
    case 'rate_limiting':
      return env.ENABLE_RATE_LIMITING === 'true' && !!env.UPSTASH_REDIS_REST_URL;
    case '2fa':
      return env.ENABLE_2FA === 'true';
    case 'email_verification':
      return env.ENABLE_EMAIL_VERIFICATION === 'true';
    case 'captcha':
      return !!(env.RECAPTCHA_SECRET_KEY || env.HCAPTCHA_SECRET_KEY || env.TURNSTILE_SECRET_KEY);
    case 'security_monitoring':
      return env.FEATURE_SECURITY_MONITORING === 'true';
    default:
      return false;
  }
};

// Security configuration export
export const securityConfig = {
  getEnv,
  checkSecurityConfiguration,
  isFeatureEnabled,
  
  // Quick access to common security settings
  get isProduction() { return getEnv().NODE_ENV === 'production'; },
  get isDevelopment() { return getEnv().NODE_ENV === 'development'; },
  get rateLimitingEnabled() { return isFeatureEnabled('rate_limiting'); },
  get captchaEnabled() { return isFeatureEnabled('captcha'); },
  get twoFactorEnabled() { return isFeatureEnabled('2fa'); },
};

export default getEnv();