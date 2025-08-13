/**
 * Security configuration and CSP (Content Security Policy) utilities
 */

// Content Security Policy configuration
export const generateCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return cspDirectives.join('; ');
};

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Security constants
export const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MINUTES: 15,
  CONTACT_FORM_RATE_LIMIT: 3,
  CONTACT_FORM_WINDOW_MS: 300000, // 5 minutes
  
  // Session security
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_SESSION_REFRESH_ATTEMPTS: 3,
  
  // Input validation
  MAX_INPUT_LENGTH: 1000,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_FILENAME_LENGTH: 255,
  
  // File upload security
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // API security
  API_TIMEOUT_MS: 30000,
  MAX_CONCURRENT_REQUESTS: 10
} as const;

// Security validation patterns
export const SECURITY_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[0-9\-\s\(\)]{9,15}$/,
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
} as const;

// Threat detection patterns
export const THREAT_PATTERNS = {
  XSS: [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi
  ],
  SQL_INJECTION: [
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/gi,
    /(['"])\s*(or|and)\s*\1\s*=\s*\1/gi,
    /;\s*(drop|delete|update|insert)\s+/gi
  ],
  COMMAND_INJECTION: [
    /[;&|`$(){}[\]\\]/g,
    /\.\.\//g,
    /(cat|ls|pwd|whoami|wget|curl|chmod|rm)\s+/gi
  ]
} as const;

// Sensitive data patterns for redaction
export const SENSITIVE_DATA_PATTERNS = [
  /password[s]?[:\s=]+[^\s]+/gi,
  /token[s]?[:\s=]+[^\s]+/gi,
  /key[s]?[:\s=]+[^\s]+/gi,
  /secret[s]?[:\s=]+[^\s]+/gi,
  /auth[:\s=]+[^\s]+/gi,
  /bearer\s+[^\s]+/gi,
  /api[_-]?key[:\s=]+[^\s]+/gi
] as const;