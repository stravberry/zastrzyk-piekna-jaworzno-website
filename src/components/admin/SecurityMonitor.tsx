
import React, { useEffect, useRef } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate, useLocation } from "react-router-dom";
import { logSecurityEvent } from "@/services/securityService";

const SecurityMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, session } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const lastActivityRef = useRef<number>(Date.now());
  const securityChecksRef = useRef<number>(0);

  // Lightweight session monitoring (runs every 10 minutes)
  useEffect(() => {
    if (!isAuthenticated) {
      // Fast redirect when no authentication
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        console.log('[SECURITY] No authentication detected, fast redirect to login');
        // Log asynchronously to avoid blocking
        setTimeout(() => {
          logSecurityEvent('unauthenticated_access_redirect', 'medium', {
            attempted_path: location.pathname,
            timestamp: new Date().toISOString()
          });
        }, 0);
        navigate('/admin/login', { replace: true });
      }
      return;
    }

    const lightweightSecurityCheck = async () => {
      try {
        securityChecksRef.current++;
        
        // Basic session expiry check only
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at).getTime();
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          if (timeUntilExpiry < 0) {
            console.error('[SECURITY] Expired session detected');
            navigate('/admin/login', { replace: true });
            return;
          }
        }

        // Log successful check every 6 checks (1 hour)
        if (securityChecksRef.current % 6 === 0) {
          setTimeout(() => {
            logSecurityEvent('security_check_passed', 'low', {
              check_number: securityChecksRef.current,
              last_activity: new Date(lastActivityRef.current).toISOString()
            });
          }, 0);
        }
      } catch (error) {
        console.error('[SECURITY] Security check failed:', error);
        // Log errors asynchronously
        setTimeout(() => {
          logSecurityEvent('security_check_failed', 'medium', {
            error: error instanceof Error ? error.message : 'Unknown error',
            check_number: securityChecksRef.current
          });
        }, 0);
      }
    };

    // Run security checks every 10 minutes (instead of 30 seconds)
    const securityInterval = setInterval(lightweightSecurityCheck, 10 * 60 * 1000);
    
    // Run initial check after 5 seconds
    const initialCheck = setTimeout(lightweightSecurityCheck, 5000);

    return () => {
      clearInterval(securityInterval);
      clearTimeout(initialCheck);
    };
  }, [isAuthenticated, user, session, navigate, location.pathname]);

  // Simplified activity monitoring
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Monitor fewer events for better performance
    const activityEvents = ['mousedown', 'keypress', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Fast URL manipulation detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
      if (!isAuthenticated) {
        // Log asynchronously to avoid blocking
        setTimeout(() => {
          logSecurityEvent('unauthorized_admin_access_attempt', 'high', {
            attempted_path: currentPath,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }, 0);
        // Fast redirect
        navigate('/admin/login', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

export default SecurityMonitor;
