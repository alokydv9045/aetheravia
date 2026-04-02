import mongoSanitize from 'mongo-sanitize';

/**
 * Comprehensive input sanitization and validation utilities
 * Prevents NoSQL injection, XSS, and other injection attacks
 */

// Sanitize MongoDB queries
export const sanitizeInput = (input: any): any => {
  if (input === null || input === undefined) {
    return input;
  }
  
  if (typeof input === 'string') {
    // Remove potential MongoDB operators and sanitize
    const sanitized = mongoSanitize(input);
    // Additional XSS protection
    return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        // Sanitize both key and value
        const sanitizedKey = mongoSanitize(key);
        sanitized[sanitizedKey] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return mongoSanitize(input);
};

// Validate and sanitize specific data types
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateObjectId = (id: string): boolean => {
  const objectIdRegex = /^[a-fA-F0-9]{24}$/;
  return objectIdRegex.test(id);
};

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
};

export const validateNumeric = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Sanitize API request body
export const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return {};
  }
  
  const sanitized = sanitizeInput(body);
  
  // Remove any properties that start with $ or contain dots (MongoDB operators)
  const cleaned: any = {};
  for (const key in sanitized) {
    if (key.startsWith('$') || key.includes('.')) {
      continue; // Skip potentially dangerous keys
    }
    cleaned[key] = sanitized[key];
  }
  
  return cleaned;
};

// Validate required fields
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Sanitize query parameters
export const sanitizeQueryParams = (params: any): any => {
  const sanitized: any = {};
  
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key];
      
      // Skip MongoDB operators in query params
      if (key.startsWith('$')) continue;
      
      if (typeof value === 'string') {
        sanitized[key] = mongoSanitize(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => mongoSanitize(item));
      } else {
        sanitized[key] = mongoSanitize(value);
      }
    }
  }
  
  return sanitized;
};

// Rate limiting helper
export const createRateLimiter = (max: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return {
    check: (identifier: string): { allowed: boolean; resetTime?: number } => {
      const now = Date.now();
      const record = attempts.get(identifier);
      
      if (!record || now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
      }
      
      if (record.count >= max) {
        return { allowed: false, resetTime: record.resetTime };
      }
      
      record.count++;
      return { allowed: true };
    },
    reset: (identifier: string) => {
      attempts.delete(identifier);
    }
  };
};

// Security headers helper
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const securityUtils = {
  sanitizeInput,
  sanitizeRequestBody,
  sanitizeQueryParams,
  validateEmail,
  validateObjectId,
  validateSlug,
  validateNumeric,
  validateRequiredFields,
  validatePassword,
  createRateLimiter,
  getSecurityHeaders,
};

export default securityUtils;
