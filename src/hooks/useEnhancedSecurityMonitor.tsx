import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLogger } from '@/utils/secureLogger';

interface SecurityEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const useEnhancedSecurityMonitor = () => {
  // Enhanced session validation
  const { data: sessionStatus, refetch: validateSession } = useQuery({
    queryKey: ['enhanced-session-validation'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('validate_admin_session_security');
      if (error) {
        throw new Error(`Session validation failed: ${error.message}`);
      }
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Security event logging with enhanced metadata
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Rate limiting for security events
      const eventKey = `${event.event_type}-${Date.now()}`;
      const lastEvent = localStorage.getItem(`security-event-${event.event_type}`);
      const now = Date.now();
      
      if (lastEvent && now - parseInt(lastEvent) < 60000) {
        return; // Rate limit: max 1 event per minute per type
      }
      
      localStorage.setItem(`security-event-${event.event_type}`, now.toString());

      const enhancedEvent = {
        ...event,
        details: {
          ...event.details,
          timestamp: new Date().toISOString(),
          session_fingerprint: generateSessionFingerprint(),
          page_url: window.location.href,
          referrer: document.referrer,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      const { error } = await supabase.rpc('log_security_event', {
        _event_type: enhancedEvent.event_type,
        _severity: enhancedEvent.severity,
        _details: enhancedEvent.details,
        _ip_address: null, // Will be captured server-side
        _user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Create alert for critical events
      if (event.severity === 'critical') {
        await createSecurityAlert(event);
      }

    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, []);

  // Create security alert for critical events
  const createSecurityAlert = useCallback(async (event: SecurityEvent) => {
    try {
      const { error } = await supabase.rpc('create_security_alert', {
        _type: event.event_type,
        _severity: event.severity,
        _title: `Critical Security Event: ${event.event_type}`,
        _description: `A critical security event has been detected. Event type: ${event.event_type}`,
        _metadata: event.details
      });

      if (error) {
        console.error('Failed to create security alert:', error);
      } else {
        // Show toast notification for critical alerts
        toast.error('Critical Security Alert', {
          description: `Security event detected: ${event.event_type}`,
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }, []);

  // Generate session fingerprint
  const generateSessionFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }, []);

  // Enhanced inactivity monitoring
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let warningShown = false;

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      warningShown = false;

      // Show warning after 25 minutes of inactivity
      warningTimer = setTimeout(() => {
        if (!warningShown) {
          warningShown = true;
          toast.warning('Session Warning', {
            description: 'You will be automatically logged out in 5 minutes due to inactivity.',
            duration: 10000,
          });
          
          logSecurityEvent({
            event_type: 'session_inactivity_warning',
            severity: 'medium',
            details: { warning_time: new Date().toISOString() }
          });
        }
      }, 25 * 60 * 1000); // 25 minutes

      // Auto logout after 30 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        logSecurityEvent({
          event_type: 'session_auto_logout',
          severity: 'medium',
          details: { reason: 'inactivity_timeout' }
        });
        
        toast.error('Session Expired', {
          description: 'You have been logged out due to inactivity.',
        });
        
        supabase.auth.signOut();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttled activity handler
    let lastActivity = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 30000) { // Throttle to once per 30 seconds
        lastActivity = now;
        resetTimers();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimers();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [logSecurityEvent]);

  // Tab visibility monitoring with enhanced logging
  useEffect(() => {
    let hiddenTime: number | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now();
        logSecurityEvent({
          event_type: 'tab_hidden',
          severity: 'low',
          details: { hidden_at: new Date().toISOString() }
        });
      } else if (hiddenTime) {
        const hiddenDuration = Date.now() - hiddenTime;
        
        logSecurityEvent({
          event_type: 'tab_visible',
          severity: 'low',
          details: { 
            visible_at: new Date().toISOString(),
            hidden_duration_ms: hiddenDuration 
          }
        });

        // Revalidate session if tab was hidden for more than 5 minutes
        if (hiddenDuration > 5 * 60 * 1000) {
          validateSession();
          logSecurityEvent({
            event_type: 'session_revalidation',
            severity: 'medium',
            details: { reason: 'tab_hidden_too_long', duration_ms: hiddenDuration }
          });
        }
        
        hiddenTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logSecurityEvent, validateSession]);

  // Enhanced threat detection
  useEffect(() => {
    let consoleWarningCount = 0;
    let devToolsDetected = false;

    // Console access monitoring
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      consoleWarningCount++;
      if (consoleWarningCount > 10 && !devToolsDetected) {
        devToolsDetected = true;
        logSecurityEvent({
          event_type: 'developer_tools_detected',
          severity: 'medium',
          details: { 
            console_access_count: consoleWarningCount,
            detection_method: 'console_override'
          }
        });
      }
      return originalConsoleLog.apply(console, args);
    };

    // Context menu monitoring (throttled)
    let lastContextMenu = 0;
    const handleContextMenu = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastContextMenu > 5000) { // Throttle to once per 5 seconds
        lastContextMenu = now;
        logSecurityEvent({
          event_type: 'context_menu_access',
          severity: 'low',
          details: { 
            target: (e.target as Element)?.tagName || 'unknown',
            position: { x: e.clientX, y: e.clientY }
          }
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Developer tools detection via timing
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if ((widthThreshold || heightThreshold) && !devToolsDetected) {
        devToolsDetected = true;
        logSecurityEvent({
          event_type: 'developer_tools_detected',
          severity: 'medium',
          details: { 
            detection_method: 'window_size',
            outer_dimensions: `${window.outerWidth}x${window.outerHeight}`,
            inner_dimensions: `${window.innerWidth}x${window.innerHeight}`
          }
        });
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 10000); // Check every 10 seconds

    return () => {
      console.log = originalConsoleLog;
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devToolsInterval);
    };
  }, [logSecurityEvent]);

  return {
    sessionStatus,
    logSecurityEvent,
    validateSession,
  };
};