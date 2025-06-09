
import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  validateUserSession, 
  logSecurityEvent, 
  generateSessionFingerprint,
  cleanupAuthState,
  checkRateLimit
} from "@/services/securityService";
import { toast } from "sonner";

export const useSecurityMonitor = () => {
  const queryClient = useQueryClient();

  // Monitor session validity with enhanced checking
  const { data: sessionStatus, refetch: recheckSession } = useQuery({
    queryKey: ['session-validation'],
    queryFn: validateUserSession,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });

  // Enhanced security event handler with rate limiting
  const handleSecurityEvent = useCallback(async (eventType: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', metadata: any = {}) => {
    try {
      // Check rate limit for security events to prevent spam
      const rateLimitResult = await checkRateLimit(
        `security_event_${eventType}`,
        'security_logging',
        10, // max 10 events per window
        5   // 5 minute window
      );

      if (!rateLimitResult.allowed) {
        console.warn('Security event rate limited:', eventType);
        return;
      }

      await logSecurityEvent(eventType, severity, {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionFingerprint: generateSessionFingerprint()
      });
      
      // Refresh security dashboard if it's being viewed
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-audit'] });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [queryClient]);

  // Enhanced inactivity monitoring with progressive warnings
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let finalWarningTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetInactivityTimer = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearTimeout(finalWarningTimer);
      
      // First warning at 110 minutes (10 minutes before auto-logout)
      warningTimer = setTimeout(() => {
        handleSecurityEvent('inactivity_warning_10min', 'low', { 
          warning_time: new Date().toISOString(),
          minutes_until_logout: 10
        });
        
        toast.warning('You will be logged out in 10 minutes due to inactivity', {
          duration: 30000
        });
      }, 110 * 60 * 1000);

      // Final warning at 117 minutes (3 minutes before auto-logout)
      finalWarningTimer = setTimeout(() => {
        handleSecurityEvent('inactivity_warning_3min', 'medium', { 
          warning_time: new Date().toISOString(),
          minutes_until_logout: 3
        });
        
        toast.error('You will be logged out in 3 minutes due to inactivity!', {
          duration: 20000
        });
      }, 117 * 60 * 1000);
      
      // Auto-logout after 2 hours of inactivity
      inactivityTimer = setTimeout(() => {
        handleSecurityEvent('auto_logout_inactivity', 'medium', { 
          last_activity: new Date(lastActivity).toISOString(),
          session_duration_minutes: 120
        });
        
        toast.error('Session expired due to inactivity. Please log in again.');
        
        // Enhanced cleanup and redirect
        cleanupAuthState();
        window.location.href = '/admin/login';
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    // Track user activity with improved throttling
    let activityThrottle: NodeJS.Timeout;
    const throttledActivityReset = () => {
      clearTimeout(activityThrottle);
      activityThrottle = setTimeout(resetInactivityTimer, 2000); // Throttle to once per 2 seconds
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityReset, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearTimeout(finalWarningTimer);
      clearTimeout(activityThrottle);
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivityReset, true);
      });
    };
  }, [handleSecurityEvent]);

  // Handle session validation results with enhanced error handling
  useEffect(() => {
    if (sessionStatus) {
      if (!sessionStatus.isValid && sessionStatus.needsReauth) {
        handleSecurityEvent('forced_logout', 'high', { 
          reason: 'session_invalid',
          timestamp: new Date().toISOString()
        });
        
        toast.error('Session invalid. Please log in again.');
        
        // Enhanced auth state cleanup and redirect
        cleanupAuthState();
        window.location.href = '/admin/login';
      }
    }
  }, [sessionStatus, handleSecurityEvent]);

  // Enhanced tab visibility monitoring
  useEffect(() => {
    let hiddenTime: number;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now();
        handleSecurityEvent('tab_hidden', 'low', { 
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      } else {
        const timeHidden = hiddenTime ? Date.now() - hiddenTime : 0;
        handleSecurityEvent('tab_visible', 'low', { 
          timestamp: new Date().toISOString(),
          time_hidden_ms: timeHidden,
          url: window.location.href
        });
        
        // Recheck session when tab becomes visible after being hidden for more than 5 minutes
        if (timeHidden > 5 * 60 * 1000) {
          recheckSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleSecurityEvent, recheckSession]);

  // Enhanced security threat monitoring
  useEffect(() => {
    // Monitor for console access (potential developer tools usage)
    const originalConsole = console.log;
    let consoleAccessCount = 0;
    
    console.log = (...args) => {
      consoleAccessCount++;
      
      // Only log every 10th console access to avoid spam
      if (consoleAccessCount % 10 === 0) {
        handleSecurityEvent('console_access_pattern', 'low', { 
          access_count: consoleAccessCount,
          timestamp: new Date().toISOString()
        });
      }
      
      originalConsole.apply(console, args);
    };

    // Monitor for right-click context menu with throttling
    let lastContextMenuTime = 0;
    const handleContextMenu = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastContextMenuTime > 5000) { // Throttle to once per 5 seconds
        lastContextMenuTime = now;
        handleSecurityEvent('context_menu_access', 'low', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    };

    // Monitor for potential debugging attempts
    const detectDevtools = () => {
      const threshold = 160;
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          handleSecurityEvent('devtools_detected', 'medium', {
            window_dimensions: {
              outer: { width: window.outerWidth, height: window.outerHeight },
              inner: { width: window.innerWidth, height: window.innerHeight }
            }
          });
        }
      }, 30000); // Check every 30 seconds
    };

    document.addEventListener('contextmenu', handleContextMenu);
    detectDevtools();

    return () => {
      console.log = originalConsole;
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleSecurityEvent]);

  return {
    sessionStatus,
    recheckSession,
    logSecurityEvent: handleSecurityEvent,
    isSessionValid: sessionStatus?.isValid ?? false,
    user: sessionStatus?.user ?? null
  };
};
