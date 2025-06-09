
import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { validateUserSession, logSecurityEvent } from "@/services/securityService";
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

  // Handle security events with enhanced logging
  const handleSecurityEvent = useCallback(async (eventType: string, metadata: any = {}) => {
    try {
      await logSecurityEvent(eventType, {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Refresh security dashboard if it's being viewed
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-user-stats'] });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [queryClient]);

  // Enhanced inactivity monitoring
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetInactivityTimer = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      
      // Show warning 10 minutes before auto-logout
      warningTimer = setTimeout(() => {
        handleSecurityEvent('inactivity_warning', { 
          warning_time: new Date().toISOString(),
          minutes_until_logout: 10
        });
        
        toast.warning('You will be logged out in 10 minutes due to inactivity', {
          duration: 30000
        });
      }, 110 * 60 * 1000); // 110 minutes (10 minutes before 2-hour limit)
      
      // Auto-logout after 2 hours of inactivity
      inactivityTimer = setTimeout(() => {
        handleSecurityEvent('auto_logout_inactivity', { 
          last_activity: new Date(lastActivity).toISOString(),
          session_duration_minutes: 120
        });
        
        toast.error('Session expired due to inactivity. Please log in again.');
        
        // Clear all auth state and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/admin/login';
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    // Track user activity with throttling
    let activityThrottle: NodeJS.Timeout;
    const throttledActivityReset = () => {
      clearTimeout(activityThrottle);
      activityThrottle = setTimeout(resetInactivityTimer, 1000); // Throttle to once per second
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityReset, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
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
        handleSecurityEvent('forced_logout', { 
          reason: 'session_invalid',
          timestamp: new Date().toISOString()
        });
        
        toast.error('Session invalid. Please log in again.');
        
        // Clear auth state and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/admin/login';
      }
    }
  }, [sessionStatus, handleSecurityEvent]);

  // Monitor for tab visibility changes with enhanced tracking
  useEffect(() => {
    let hiddenTime: number;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now();
        handleSecurityEvent('tab_hidden', { 
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      } else {
        const timeHidden = hiddenTime ? Date.now() - hiddenTime : 0;
        handleSecurityEvent('tab_visible', { 
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

  // Monitor for potential security threats
  useEffect(() => {
    // Monitor for console access (potential developer tools usage)
    const originalConsole = console.log;
    console.log = (...args) => {
      handleSecurityEvent('console_access', { 
        args: args.map(arg => typeof arg === 'string' ? arg : '[object]'),
        timestamp: new Date().toISOString()
      });
      originalConsole.apply(console, args);
    };

    // Monitor for right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      handleSecurityEvent('context_menu_access', {
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);

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
