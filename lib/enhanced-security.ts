import mongoSanitize from 'mongo-sanitize';
import { NextRequest } from 'next/server';

/**
 * Enterprise-grade security utilities for BellaModa
 * Provides comprehensive protection against all major security threats
 * Edge Runtime compatible implementation
 */

// Advanced input sanitization with threat detection
export class AdvancedSanitizer {
  private static suspiciousPatterns = {
    // SQL Injection patterns
    sql: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
      /(UNION\s+SELECT|UNION\s+ALL)/i,
      /('|\"|;|--|\/\*|\*\/)/,
      /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
      /(EXEC|EXECUTE|sp_|xp_)/i
    ],
    
    // NoSQL Injection patterns
    nosql: [
      /(\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$exists|\$regex|\$where)/i,
      /(\$or|\$and|\$not|\$nor)/i,
      /(this\.|constructor|prototype)/i,
      /(\{\s*\$)/
    ],
    
    // XSS patterns
    xss: [
      /(<script|<\/script>|<iframe|<\/iframe>|<object|<\/object>|<embed|<\/embed>)/i,
      /(javascript:|data:|vbscript:|livescript:|mocha:|about:)/i,
      /(onload|onerror|onclick|onmouseover|onfocus|onblur)=/i,
      /(<img[^>]+src[^>]*=|<link[^>]+href[^>]*=)/i,
      /(eval\(|setTimeout\(|setInterval\(|Function\()/i,
      /(String\.fromCharCode|unescape|decodeURI|atob)/i
    ],
    
    // Command Injection patterns
    command: [
      /(;|\|{1,2}|&{1,2}|`|\$\()/,
      /\b(cat|ls|pwd|whoami|id|ps|kill|rm|mv|cp|chmod|chown)\b/i,
      /\b(cmd|powershell|bash|sh|zsh|csh|tcsh)\b/i,
      /(>\s*\/|<\s*\/|\|\s*\/)/
    ],
    
    // Path Traversal patterns
    traversal: [
      /(\.\.\/|\.\.\\)/,
      /(\/etc\/passwd|\/etc\/shadow|\/etc\/hosts)/i,
      /(\\windows\\system32|\\windows\\system)/i,
      /(\.\.%2F|\.\.%5C|%2E%2E%2F|%2E%2E%5C)/i
    ],
    
    // LDAP Injection patterns
    ldap: [
      /(\*|\(|\)|\\|\||&)/,
      /(objectClass=|cn=|ou=|dc=)/i,
      /(\(\||\(&|\(!)/ 
    ],
    
    // SSRF patterns
    ssrf: [
      /(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
      /(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/,
      /(file:\/\/|ftp:\/\/|gopher:\/\/|dict:\/\/)/i,
      /(169\.254\.|metadata\.google|169\.254\.169\.254)/i
    ]
  };

  static sanitizeInput(input: any): { sanitized: any; threats: string[] } {
    const threats: string[] = [];
    
    if (input === null || input === undefined) {
      return { sanitized: input, threats };
    }
    
    if (typeof input === 'string') {
      // Detect threats before sanitization
      threats.push(...AdvancedSanitizer.detectThreats(input));
      
      // Advanced sanitization
      let sanitized = mongoSanitize(input);
      
      // Remove potential XSS vectors
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/data:/gi, '');
      sanitized = sanitized.replace(/vbscript:/gi, '');
      
      // Remove potential command injection
      sanitized = sanitized.replace(/[;&|`$(){}[\]]/g, '');
      
      // Normalize Unicode to prevent bypass attempts
      sanitized = sanitized.normalize('NFC');
      
      // Limit length to prevent DoS
      if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
        threats.push('oversized_input');
      }
      
      return { sanitized, threats };
    }
    
    if (Array.isArray(input)) {
      const sanitizedArray: any[] = [];
      for (const item of input) {
        const result = AdvancedSanitizer.sanitizeInput(item);
        sanitizedArray.push(result.sanitized);
        threats.push(...result.threats);
      }
      return { sanitized: sanitizedArray, threats };
    }
    
    if (typeof input === 'object') {
      const sanitized: any = {};
      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          // Sanitize both key and value
          const keyResult = AdvancedSanitizer.sanitizeInput(key);
          const valueResult = AdvancedSanitizer.sanitizeInput(input[key]);
          
          if (keyResult.sanitized && !keyResult.sanitized.startsWith('$')) {
            sanitized[keyResult.sanitized] = valueResult.sanitized;
          }
          
          threats.push(...keyResult.threats, ...valueResult.threats);
        }
      }
      return { sanitized, threats };
    }
    
    return { sanitized: mongoSanitize(input), threats };
  }

  private static detectThreats(input: string): string[] {
    const threats: string[] = [];
    
    // Check each threat category
    for (const [category, patterns] of Object.entries(AdvancedSanitizer.suspiciousPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          threats.push(`${category}_injection`);
          break; // Only add category once
        }
      }
    }
    
    // Check for encoded attempts
    if (AdvancedSanitizer.hasEncodedThreats(input)) {
      threats.push('encoded_attack');
    }
    
    // Check for unusual patterns
    if (AdvancedSanitizer.hasUnusualPatterns(input)) {
      threats.push('suspicious_pattern');
    }
    
    return threats;
  }

  private static hasEncodedThreats(input: string): boolean {
    try {
      // Check URL encoding
      const decoded = decodeURIComponent(input);
      if (decoded !== input && AdvancedSanitizer.detectThreats(decoded).length > 0) {
        return true;
      }
      
      // Check Base64 encoding
      if (/^[A-Za-z0-9+/]{4,}={0,2}$/.test(input)) {
        try {
          const base64Decoded = Buffer.from(input, 'base64').toString('utf-8');
          if (AdvancedSanitizer.detectThreats(base64Decoded).length > 0) {
            return true;
          }
        } catch {}
      }
      
      // Check HTML entity encoding
      const htmlDecoded = input.replace(/&#(\d+);/g, (match, dec) => 
        String.fromCharCode(parseInt(dec, 10))
      );
      if (htmlDecoded !== input && AdvancedSanitizer.detectThreats(htmlDecoded).length > 0) {
        return true;
      }
      
    } catch {}
    
    return false;
  }

  private static hasUnusualPatterns(input: string): boolean {
    // Check for excessive special characters
    const specialCharCount = (input.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > input.length * 0.3) {
      return true;
    }
    
    // Check for very long words (potential buffer overflow)
    const words = input.split(/\s+/);
    if (words.some(word => word.length > 100)) {
      return true;
    }
    
    // Check for repeated patterns (potential DoS)
    if (/(.{3,})\1{5,}/.test(input)) {
      return true;
    }
    
    return false;
  }
}

// Password security enhancements
export class PasswordSecurity {
  private static readonly minLength = 6; // Simple and user-friendly
  private static readonly maxLength = 128;
  
  // Common password patterns to reject
  private static readonly forbiddenPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i,
    /^monkey/i,
    /^dragon/i,
    /^master/i,
    /^shadow/i
  ];
  
  // Dictionary of most common passwords (subset)
  private static readonly commonPasswords = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password1',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'shadow',
    'superman', 'michael', 'football', 'baseball', 'computer', 'jordan'
  ]);

  static validatePassword(password: string): { 
    isValid: boolean; 
    score: number; 
    errors: string[]; 
    suggestions: string[] 
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 50; // Base score for simple validation
    
    // Basic length check - simple and user-friendly
    if (password.length < PasswordSecurity.minLength) {
      errors.push(`Password must be at least ${PasswordSecurity.minLength} characters long`);
      suggestions.push('Use a longer password for better security');
    } else if (password.length >= PasswordSecurity.minLength) {
      score += 20;
    }
    
    if (password.length > PasswordSecurity.maxLength) {
      errors.push(`Password must not exceed ${PasswordSecurity.maxLength} characters`);
    }
    
    // Bonus points for character variety (optional, not required)
    if (/[A-Z]/.test(password)) score += 5;
    if (/[a-z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~`]/.test(password)) score += 10;
    
    // Additional length bonus
    if (password.length >= 10) score += 10;
    if (password.length >= 12) score += 5;
    
    // Only reject very common/weak passwords
    if (PasswordSecurity.commonPasswords.has(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a different password');
      suggestions.push('Try adding numbers or special characters');
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
      isValid: errors.length === 0,
      score,
      errors,
      suggestions
    };
  }

  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      // Check for ascending or descending sequences
      if ((char2 === char1 + 1 && char3 === char2 + 1) ||
          (char2 === char1 - 1 && char3 === char2 - 1)) {
        return true;
      }
    }
    return false;
  }

  private static hasRepeatedChars(password: string): boolean {
    const charCount = new Map<string, number>();
    for (const char of password) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    
    // Check if any character appears more than 1/3 of the time
    const maxRepeats = Math.floor(password.length / 3);
    return Array.from(charCount.values()).some(count => count > maxRepeats);
  }

  private static calculateEntropy(password: string): number {
    const charset = this.getCharsetSize(password);
    return Math.log2(Math.pow(charset, password.length));
  }

  private static getCharsetSize(password: string): number {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) size += 22;
    if (/[~`]/.test(password)) size += 2;
    return size;
  }

  private static hasPersonalInfo(password: string): boolean {
    // Basic check for common personal info patterns
    const patterns = [
      /\b(19|20)\d{2}\b/, // Years
      /\b(0[1-9]|1[0-2])[0-9]{2}\b/, // Dates
      /\b[A-Z][a-z]{2,}\b/, // Names (simple check)
      /\b\d{4,}\b/ // Longer numbers (could be SSN, phone, etc.)
    ];
    
    return patterns.some(pattern => pattern.test(password));
  }

  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// CSRF Protection
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expiry: number }>();
  
  static generateToken(sessionId: string): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expiry });
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const record = this.tokens.get(sessionId);
    if (!record) return false;
    
    if (Date.now() > record.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return record.token === token; // Note: In production, use constant-time comparison
  }
  
  static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, record] of this.tokens.entries()) {
      if (now > record.expiry) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Session Security
export class SessionSecurity {
  static generateSecureSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  static isSessionIdSecure(sessionId: string): boolean {
    // Check length (at least 32 characters)
    if (sessionId.length < 32) return false;
    
    // Check entropy (should be hex)
    if (!/^[a-f0-9]+$/i.test(sessionId)) return false;
    
    return true;
  }
  
  static rotateSession(oldSessionId: string): string {
    // In production, invalidate old session in database
    return this.generateSecureSessionId();
  }
}

// Content validation
export function validateFileUpload(file: File | { name: string; type: string; size: number }): {
  isValid: boolean;
  errors: string[];
  sanitizedName: string;
} {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // Size validation
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Extension validation
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push('File extension not allowed');
  }
  
  // Filename sanitization
  let sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .toLowerCase();
  
  // Prevent path traversal
  sanitizedName = sanitizedName.replace(/\.\./g, '');
  
  // Add timestamp to prevent conflicts
  const timestamp = Date.now();
  const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
  sanitizedName = `${nameWithoutExt}_${timestamp}${extension}`;
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName
  };
}

// Export enhanced security utilities
export const enhancedSecurity = {
  sanitizeInput: AdvancedSanitizer.sanitizeInput,
  validatePassword: PasswordSecurity.validatePassword,
  generateSecurePassword: PasswordSecurity.generateSecurePassword,
  generateCSRFToken: CSRFProtection.generateToken,
  validateCSRFToken: CSRFProtection.validateToken,
  generateSecureSessionId: SessionSecurity.generateSecureSessionId,
  validateFileUpload,
  
  // Existing functions
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  validateObjectId: (id: string): boolean => {
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    return objectIdRegex.test(id);
  },
  
  validateRequiredFields: (data: any, requiredFields: string[]): { 
    isValid: boolean; 
    missingFields: string[] 
  } => {
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
  }
};

export default enhancedSecurity;