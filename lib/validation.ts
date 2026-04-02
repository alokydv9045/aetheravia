import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format').max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const phoneSchema = z
  .string()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid Indian phone number format')
  .transform(phone => phone.startsWith('+91') ? phone : `+91${phone}`);

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const addressSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode format'),
  country: z.string().default('India')
});

export const orderFilterSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  paymentMethod: z.enum(['razorpay', 'cod', 'wallet']).optional(),
  deliveryPartner: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalPrice', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive().max(999999.99),
  category: z.string().min(2).max(100),
  brand: z.string().min(2).max(100),
  images: z.array(z.string().url()).min(1).max(10),
  stock: z.number().int().min(0).max(99999),
  variants: z.array(z.object({
    name: z.string().min(1).max(100),
    value: z.string().min(1).max(100),
    priceModifier: z.number().min(-99999).max(99999).default(0)
  })).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isActive: z.boolean().default(true),
  weight: z.number().positive().max(50000).optional(), // in grams
  dimensions: z.object({
    length: z.number().positive().max(1000).optional(),
    width: z.number().positive().max(1000).optional(),
    height: z.number().positive().max(1000).optional()
  }).optional()
});

// Validation middleware
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
  };
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 10000); // Prevent extremely long inputs
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10); // Keep only last 10 digits
}

// Rate limiting helpers
export async function checkRateLimitWithValidation(
  request: NextRequest,
  checkRateLimit: (req: NextRequest) => Promise<any>
) {
  const rateLimitResult = await checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    );
  }
  return null;
}

// SQL injection and XSS protection
export function isSafeString(input: string): boolean {
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\%27)|(\%22)|(\%3B)|(\%3C)|(\%3E)|(\%00))/i,
    /(<script|javascript:|vbscript:|onload=|onerror=|onclick=)/i
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
}

// File upload validation
export const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const maxFileSize = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!allowedImageTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedImageTypes.join(', ')}`
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxFileSize / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

// API response helpers
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  errors?: any[]
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Authentication validation
export function validateAuthToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  // Basic JWT format validation
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Check if payload is valid JSON
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// Input sanitization middleware
export function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeString(body);
  }

  if (Array.isArray(body)) {
    return body.map(item => sanitizeRequestBody(item));
  }

  if (body && typeof body === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = typeof value === 'string' ? sanitizeEmail(value) : value;
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = typeof value === 'string' ? sanitizePhone(value) : value;
      } else {
        sanitized[key] = sanitizeRequestBody(value);
      }
    }
    return sanitized;
  }

  return body;
}