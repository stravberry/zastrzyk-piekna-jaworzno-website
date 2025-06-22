import { supabase } from "@/integrations/supabase/client";

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Enhanced security event logging using the new audit table
export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata: any = {}
): Promise<void> => {
  try {
    // Use the new log_security_event function for enhanced monitoring
    await supabase.rpc('log_security_event', {
      _event_type: eventType,
      _severity: severity,
      _details: metadata,
      _ip_address: null, // Will be captured server-side when possible
      _user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Fallback to admin activity log
    try {
      await supabase.rpc('log_admin_activity', {
        _action: eventType,
        _resource_type: 'security',
        _resource_id: null,
        _details: { ...metadata, severity, fallback: true }
      });
    } catch (fallbackError) {
      console.error('Fallback security logging also failed:', fallbackError);
    }
  }
};

// REMOVED: Enhanced rate limiting - no longer needed for testing
// Simple rate limiter kept for backwards compatibility but not used
export const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  
  canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    return true; // Always allow for testing
  },
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
};

// Get security events from the new audit table
export const getSecurityEvents = async (
  limit: number = 50
): Promise<SecurityEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      event_type: item.event_type,
      user_id: item.user_id,
      metadata: item.details,
      ip_address: item.ip_address?.toString(),
      user_agent: item.user_agent,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    // Fallback to admin activity log
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .eq('resource_type', 'security')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        event_type: item.action,
        user_id: item.user_id,
        metadata: item.details,
        ip_address: item.ip_address?.toString(),
        user_agent: item.user_agent,
        created_at: item.created_at
      }));
    } catch (fallbackError) {
      console.error('Fallback security events fetch failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Enhanced user session validation with security logging
export const validateUserSession = async (): Promise<{
  isValid: boolean;
  user: any | null;
  needsReauth: boolean;
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await logSecurityEvent('session_validation_error', 'medium', { error: error.message });
      return { isValid: false, user: null, needsReauth: true };
    }

    if (!session) {
      return { isValid: false, user: null, needsReauth: false };
    }

    // Check if session is expired
    const now = new Date().getTime();
    const expiresAt = new Date(session.expires_at || 0).getTime();
    
    if (now >= expiresAt) {
      await logSecurityEvent('session_expired', 'low', { 
        user_id: session.user.id,
        expires_at: session.expires_at 
      });
      return { isValid: false, user: null, needsReauth: true };
    }

    // Validate user still exists and has proper permissions
    const { data: userRole, error: roleError } = await supabase.rpc('get_current_user_role');
    
    if (roleError) {
      await logSecurityEvent('role_validation_error', 'high', { 
        user_id: session.user.id,
        error: roleError.message 
      });
      return { isValid: false, user: null, needsReauth: true };
    }

    // Log successful session validation for audit purposes
    await logSecurityEvent('session_validated', 'low', { 
      user_id: session.user.id,
      role: userRole 
    });

    return { 
      isValid: true, 
      user: { ...session.user, role: userRole }, 
      needsReauth: false 
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    await logSecurityEvent('session_validation_failed', 'high', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { isValid: false, user: null, needsReauth: true };
  }
};

// Basic input sanitization helpers - simplified
export const sanitizeInput = (input: string, context: string = 'general'): string => {
  if (!input) return '';
  
  const sanitized = input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim()
    .slice(0, 1000); // Limit length

  return sanitized;
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 9 && cleanPhone.length <= 15;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): string | null => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
};

// DISABLED: Suspicious activity detection - only keep basic SQL injection protection
export const detectSuspiciousActivity = (formData: any, context: string = 'form'): boolean => {
  // Only check for really dangerous SQL injection attempts
  const dangerousPatterns = [
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/gi,
    /<script[^>]*>[\s\S]*?<\/script>/gi,
  ];
  
  const textToCheck = Object.values(formData).join(' ');
  
  const suspicious = dangerousPatterns.some(pattern => pattern.test(textToCheck));
  
  if (suspicious) {
    console.log('Basic SQL injection detected');
    logSecurityEvent('basic_sql_injection_detected', 'high', {
      context,
      blocked_content_preview: textToCheck.substring(0, 100) + '...'
    });
  }
  
  return suspicious;
};

// Enhanced security incident logging
export const logSecurityIncident = async (
  incidentType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
): Promise<void> => {
  await logSecurityEvent(`security_incident_${severity}`, severity, {
    incident_type: incidentType,
    details,
    timestamp: new Date().toISOString()
  });
};

// Session fingerprinting for enhanced security
export const generateSessionFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Session fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
};

// Enhanced auth state cleanup
export const cleanupAuthState = (): void => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });

    logSecurityEvent('auth_state_cleaned', 'low', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to cleanup auth state:', error);
  }
};

// Enhanced rate limiting check using the new system
export const checkRateLimit = async (
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15,
  blockDurationMinutes: number = 60
): Promise<{ allowed: boolean; blocked?: boolean; reason?: string; blockedUntil?: string }> => {
  try {
    const { data, error } = await supabase.rpc('enhanced_rate_limit_check', {
      _identifier: identifier,
      _action: action,
      _max_attempts: maxAttempts,
      _window_minutes: windowMinutes,
      _block_duration_minutes: blockDurationMinutes
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fallback to allowing the action but log the failure
      await logSecurityEvent('rate_limit_check_failed', 'medium', { 
        error: error.message, 
        action, 
        identifier 
      });
      return { allowed: true };
    }

    // Handle the case where data might be null or not match expected type
    if (!data || typeof data !== 'object') {
      return { allowed: true };
    }

    // Safely extract the expected properties
    const result = data as any;
    return {
      allowed: result.allowed ?? true,
      blocked: result.blocked ?? false,
      reason: result.reason,
      blockedUntil: result.blocked_until
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open for availability
  }
};
