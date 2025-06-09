
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

// Log security events using admin_activity_log table for now
export const logSecurityEvent = async (
  eventType: string,
  metadata: any = {}
): Promise<void> => {
  try {
    // Use the existing log_admin_activity function
    await supabase.rpc('log_admin_activity', {
      _action: eventType,
      _resource_type: 'security',
      _resource_id: null,
      _details: metadata
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw error to avoid breaking user flow
  }
};

// Get security events from admin_activity_log table
export const getSecurityEvents = async (
  limit: number = 50
): Promise<SecurityEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .eq('resource_type', 'security')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Transform admin_activity_log to SecurityEvent format
    return (data || []).map(item => ({
      id: item.id,
      event_type: item.action,
      user_id: item.user_id,
      metadata: item.details,
      ip_address: item.ip_address?.toString(),
      user_agent: item.user_agent,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    throw error;
  }
};

// Enhanced user session validation
export const validateUserSession = async (): Promise<{
  isValid: boolean;
  user: any | null;
  needsReauth: boolean;
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await logSecurityEvent('session_validation_error', { error: error.message });
      return { isValid: false, user: null, needsReauth: true };
    }

    if (!session) {
      return { isValid: false, user: null, needsReauth: false };
    }

    // Check if session is expired
    const now = new Date().getTime();
    const expiresAt = new Date(session.expires_at || 0).getTime();
    
    if (now >= expiresAt) {
      await logSecurityEvent('session_expired', { 
        user_id: session.user.id,
        expires_at: session.expires_at 
      });
      return { isValid: false, user: null, needsReauth: true };
    }

    // Validate user still exists and has proper permissions
    const { data: userRole, error: roleError } = await supabase.rpc('get_current_user_role');
    
    if (roleError) {
      await logSecurityEvent('role_validation_error', { 
        user_id: session.user.id,
        error: roleError.message 
      });
      return { isValid: false, user: null, needsReauth: true };
    }

    return { 
      isValid: true, 
      user: { ...session.user, role: userRole }, 
      needsReauth: false 
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    await logSecurityEvent('session_validation_failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { isValid: false, user: null, needsReauth: true };
  }
};

// Rate limiting helper (client-side basic implementation)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Input sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .trim()
    .slice(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 9;
};
