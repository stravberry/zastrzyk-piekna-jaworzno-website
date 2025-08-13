/**
 * Enhanced input security utilities
 * Provides comprehensive protection against XSS, injection attacks, and other threats
 */

// Enhanced XSS protection patterns
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /<object[^>]*>[\s\S]*?<\/object>/gi,
  /<embed[^>]*>[\s\S]*?<\/embed>/gi,
  /<applet[^>]*>[\s\S]*?<\/applet>/gi,
  /<form[^>]*>[\s\S]*?<\/form>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<\s*\/?\s*(script|iframe|object|embed|applet|form|meta|link)\b[^>]*>/gi
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/gi,
  /(['"])\s*(or|and)\s*\1\s*=\s*\1/gi,
  /\'\s*(or|and)\s*\'\s*=\s*\'/gi,
  /"\s*(or|and)\s*"\s*=\s*"/gi,
  /;\s*(drop|delete|update|insert)\s+/gi,
  /\/\*[\s\S]*?\*\//gi,
  /--[\s\S]*$/gm
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]\\]/g,
  /\.\.\//g,
  /(cat|ls|pwd|whoami|id|uname|wget|curl|chmod|rm|mv|cp)\s+/gi
];

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

export class InputSecurityValidator {
  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(
    input: string, 
    context: 'general' | 'html' | 'sql' | 'filename' | 'email' | 'url' = 'general',
    maxLength: number = 1000
  ): SecurityValidationResult {
    if (!input || typeof input !== 'string') {
      return { isValid: false, errors: ['Invalid input type'] };
    }

    const errors: string[] = [];
    let sanitized = input.trim();

    // Length validation
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
      errors.push(`Input truncated to ${maxLength} characters`);
    }

    // Context-specific sanitization
    switch (context) {
      case 'html':
        sanitized = this.sanitizeHtml(sanitized);
        break;
      case 'sql':
        sanitized = this.sanitizeSql(sanitized);
        break;
      case 'filename':
        sanitized = this.sanitizeFilename(sanitized);
        break;
      case 'email':
        sanitized = this.sanitizeEmail(sanitized);
        break;
      case 'url':
        sanitized = this.sanitizeUrl(sanitized);
        break;
      default:
        sanitized = this.sanitizeGeneral(sanitized);
    }

    // Check for malicious patterns
    const threats = this.detectThreats(sanitized);
    if (threats.length > 0) {
      return { 
        isValid: false, 
        errors: [`Security threats detected: ${threats.join(', ')}`] 
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * General input sanitization
   */
  private static sanitizeGeneral(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/vbscript:/gi, '') // Remove vbscript: protocols
      .replace(/data:\s*text\/html/gi, '') // Remove data:text/html
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, ''); // Remove control characters
  }

  /**
   * HTML sanitization
   */
  private static sanitizeHtml(input: string): string {
    // Remove dangerous HTML elements and attributes
    let sanitized = input;
    
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * SQL sanitization
   */
  private static sanitizeSql(input: string): string {
    let sanitized = input;
    
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.replace(/['"]/g, ''); // Remove quotes
  }

  /**
   * Filename sanitization
   */
  private static sanitizeFilename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow safe filename characters
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.{2,}/g, '.') // Replace multiple dots
      .slice(0, 255); // Limit length
  }

  /**
   * Email sanitization
   */
  private static sanitizeEmail(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-zA-Z0-9@._-]/g, '')
      .slice(0, 254); // RFC 5321 limit
  }

  /**
   * URL sanitization
   */
  private static sanitizeUrl(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9:/?#[\]@!$&'()*+,;=._-]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
  }

  /**
   * Detect security threats in input
   */
  private static detectThreats(input: string): string[] {
    const threats: string[] = [];

    // Check for XSS
    if (XSS_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('XSS attempt');
    }

    // Check for SQL injection
    if (SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('SQL injection attempt');
    }

    // Check for command injection
    if (COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('Command injection attempt');
    }

    return threats;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9 && cleanPhone.length <= 15;
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Rate limiting helper
   */
  static isRateLimited(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
      return false;
    }

    const data = JSON.parse(stored);
    
    if (now - data.timestamp > windowMs) {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
      return false;
    }

    if (data.count >= maxAttempts) {
      return true;
    }

    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return false;
  }
}