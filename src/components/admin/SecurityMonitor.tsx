
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

  // Monitor session integrity
  useEffect(() => {
    if (!isAuthenticated) {
      // Automatyczne przekierowanie gdy nie ma autoryzacji
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        console.log('[SECURITY] No authentication detected, redirecting to login');
        logSecurityEvent('unauthenticated_access_redirect', 'medium', {
          attempted_path: location.pathname,
          timestamp: new Date().toISOString()
        });
        navigate('/admin/login', { replace: true });
      }
      return;
    }

    const checkSessionIntegrity = async () => {
      try {
        securityChecksRef.current++;
        
        // Check if user/session data is consistent
        if (user && session) {
          if (user.id !== session.user.id) {
            console.error('[SECURITY] User/session ID mismatch detected');
            await logSecurityEvent('session_integrity_violation', 'critical', {
              user_id: user.id,
              session_user_id: session.user.id,
              check_number: securityChecksRef.current
            });
            // Force redirect to login on integrity violation
            navigate('/admin/login', { replace: true });
            return;
          }
        }

        // Check session expiry
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at).getTime();
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          if (timeUntilExpiry < 0) {
            console.error('[SECURITY] Expired session detected');
            await logSecurityEvent('expired_session_detected', 'high', {
              expires_at: session.expires_at,
              current_time: new Date().toISOString()
            });
            navigate('/admin/login', { replace: true });
            return;
          }
          
          // Warn if session expires soon (less than 5 minutes)
          if (timeUntilExpiry < 5 * 60 * 1000) {
            await logSecurityEvent('session_expiring_soon', 'medium', {
              time_until_expiry_minutes: Math.floor(timeUntilExpiry / 60000)
            });
          }
        }

        // Log successful security check
        if (securityChecksRef.current % 10 === 0) {
          await logSecurityEvent('security_check_passed', 'low', {
            check_number: securityChecksRef.current,
            last_activity: new Date(lastActivityRef.current).toISOString()
          });
        }
      } catch (error) {
        console.error('[SECURITY] Security check failed:', error);
        await logSecurityEvent('security_check_failed', 'high', {
          error: error instanceof Error ? error.message : 'Unknown error',
          check_number: securityChecksRef.current
        });
      }
    };

    // Run security checks every 30 seconds
    const securityInterval = setInterval(checkSessionIntegrity, 30000);
    
    // Run initial check
    checkSessionIntegrity();

    return () => clearInterval(securityInterval);
  }, [isAuthenticated, user, session, navigate, location.pathname]);

  // Monitor user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Monitor for suspicious URL manipulation
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
      if (!isAuthenticated) {
        logSecurityEvent('unauthorized_admin_access_attempt', 'critical', {
          attempted_path: currentPath,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
        // Automatyczne przekierowanie
        navigate('/admin/login', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

export default SecurityMonitor;
