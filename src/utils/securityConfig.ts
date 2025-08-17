/**
 * Security configuration and CSP (Content Security Policy) utilities
 */

// Enhanced Content Security Policy configuration
export const generateCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    // More restrictive script policy - removed unsafe-eval
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // More restrictive image policy - removed http: for better security
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com https://*.lovableproject.com",
    "frame-src 'self' https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Enhanced security directives
    "manifest-src 'self'",
    "worker-src 'self'",
    "child-src 'none'",
    "require-trusted-types-for 'script'",
    "trusted-types default",
    "upgrade-insecure-requests"
  ];
  
  return cspDirectives.join('; ');
};

// Enhanced security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Enhanced permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Additional security headers
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Clear-Site-Data': '"cache", "cookies", "storage"', // Only for logout endpoints
  'Feature-Policy': 'camera \'none\'; microphone \'none\'; geolocation \'none\';'
};

// Security constants (optimized configuration)
export const SECURITY_CONFIG = {
  // Enhanced rate limiting
  MAX_LOGIN_ATTEMPTS: 3, // Reduced from 5 for better security
  LOGIN_WINDOW_MINUTES: 15,
  LOGIN_BLOCK_DURATION_MINUTES: 30, // New: block duration for login attempts
  CONTACT_FORM_RATE_LIMIT: 2, // Reduced from 3
  CONTACT_FORM_WINDOW_MS: 300000, // 5 minutes
  
  // Enhanced session security
  SESSION_TIMEOUT_MINUTES: 120, // Aligned with inactivity monitor
  SESSION_REFRESH_THRESHOLD_MINUTES: 15, // New: refresh session if expires within 15min
  MAX_SESSION_REFRESH_ATTEMPTS: 3,
  INACTIVITY_WARNING_MINUTES: 10, // New: warn 10 minutes before logout
  INACTIVITY_FINAL_WARNING_MINUTES: 3, // New: final warning timing
  
  // Enhanced input validation
  MAX_INPUT_LENGTH: 500, // Reduced from 1000 for tighter validation
  MAX_MESSAGE_LENGTH: 2000, // Reduced from 5000
  MAX_FILENAME_LENGTH: 100, // Reduced from 255
  MIN_PASSWORD_LENGTH: 12, // New: minimum password requirement
  
  // Enhanced file upload security
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'], // Removed gif for security
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'], // New: document type restrictions
  MAX_FILE_SIZE: 5 * 1024 * 1024, // Reduced to 5MB from 10MB
  MAX_FILES_PER_UPLOAD: 10, // New: limit files per upload
  
  // Enhanced API security
  API_TIMEOUT_MS: 15000, // Reduced from 30000 for better UX
  MAX_CONCURRENT_REQUESTS: 5, // Reduced from 10
  REQUEST_RETRY_ATTEMPTS: 2, // New: API retry configuration
  REQUEST_RETRY_DELAY_MS: 1000, // New: delay between retries
  
  // New: Content security
  ALLOWED_ORIGINS: [
    'https://*.lovableproject.com',
    'https://*.supabase.co',
    'https://*.vercel.app'
  ],
  BLOCKED_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper'
  ],
  
  // New: Monitoring thresholds
  SECURITY_EVENT_RATE_LIMIT: 20, // Max security events per window
  SECURITY_EVENT_WINDOW_MINUTES: 5,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 10 // Events to trigger investigation
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