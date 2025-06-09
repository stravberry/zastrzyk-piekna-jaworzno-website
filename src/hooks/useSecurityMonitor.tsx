
import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { validateUserSession, logSecurityEvent } from "@/services/securityService";
import { toast } from "sonner";

export const useSecurityMonitor = () => {
  const queryClient = useQueryClient();

  // Monitor session validity
  const { data: sessionStatus, refetch: recheckSession } = useQuery({
    queryKey: ['session-validation'],
    queryFn: validateUserSession,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Handle security events
  const handleSecurityEvent = useCallback(async (eventType: string, metadata: any = {}) => {
    try {
      await logSecurityEvent(eventType, metadata);
      
      // Refresh security dashboard if it's being viewed
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [queryClient]);

  // Monitor for suspicious activity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetInactivityTimer = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);
      
      // Auto-logout after 2 hours of inactivity
      inactivityTimer = setTimeout(() => {
        handleSecurityEvent('auto_logout_inactivity', { 
          last_activity: new Date(lastActivity).toISOString() 
        });
        
        toast.warning('Session expired due to inactivity');
        window.location.href = '/admin/login';
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [handleSecurityEvent]);

  // Handle session validation results
  useEffect(() => {
    if (sessionStatus && !sessionStatus.isValid && sessionStatus.needsReauth) {
      toast.error('Session invalid. Please log in again.');
      window.location.href = '/admin/login';
    }
  }, [sessionStatus]);

  // Monitor for tab visibility changes (potential security risk)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityEvent('tab_hidden', { timestamp: new Date().toISOString() });
      } else {
        handleSecurityEvent('tab_visible', { timestamp: new Date().toISOString() });
        // Recheck session when tab becomes visible
        recheckSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleSecurityEvent, recheckSession]);

  return {
    sessionStatus,
    recheckSession,
    logSecurityEvent: handleSecurityEvent
  };
};
