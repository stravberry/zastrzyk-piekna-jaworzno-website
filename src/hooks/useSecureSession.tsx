
import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logSecurityEvent, generateSessionFingerprint } from "@/services/securityService";

interface UseSecureSessionReturn {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionFingerprint: string | null;
  forceLogout: () => Promise<void>;
}

export const useSecureSession = (): UseSecureSessionReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionFingerprint, setSessionFingerprint] = useState<string | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

  const forceLogout = async () => {
    try {
      await logSecurityEvent('forced_logout', 'medium', {
        reason: 'Security violation or manual logout',
        session_id: session?.access_token?.substring(0, 10) + '...'
      });
      
      // Clear all auth state
      setUser(null);
      setSession(null);
      setSessionFingerprint(null);
      
      // Clear storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Redirect to login
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('[SECURITY] Error during forced logout:', error);
      // Force redirect even if logout fails
      window.location.href = '/admin/login';
    }
  };

  const validateSession = async (currentSession: Session | null) => {
    if (!currentSession) return false;

    try {
      // Check if session is expired
      const now = Date.now();
      const expiresAt = new Date(currentSession.expires_at || 0).getTime();
      
      if (now >= expiresAt) {
        await logSecurityEvent('session_expired_detected', 'medium', {
          expires_at: currentSession.expires_at,
          current_time: new Date().toISOString()
        });
        return false;
      }

      // Validate session with server
      const { data: { user: serverUser }, error } = await supabase.auth.getUser();
      
      if (error || !serverUser) {
        await logSecurityEvent('session_validation_failed', 'high', {
          error: error?.message || 'No user returned',
          session_exists: !!currentSession
        });
        return false;
      }

      // Check if user IDs match
      if (serverUser.id !== currentSession.user.id) {
        await logSecurityEvent('session_user_id_mismatch', 'critical', {
          session_user_id: currentSession.user.id,
          server_user_id: serverUser.id
        });
        return false;
      }

      return true;
    } catch (error) {
      await logSecurityEvent('session_validation_error', 'high', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        // Generate session fingerprint
        const fingerprint = generateSessionFingerprint();
        setSessionFingerprint(fingerprint);

        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          await logSecurityEvent('session_init_error', 'medium', {
            error: error.message
          });
          setLoading(false);
          return;
        }

        if (currentSession && mounted) {
          const isValid = await validateSession(currentSession);
          
          if (isValid) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            await logSecurityEvent('session_initialized', 'low', {
              user_id: currentSession.user.id,
              fingerprint: fingerprint.substring(0, 8) + '...'
            });
          } else {
            await forceLogout();
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('[SECURITY] Session initialization failed:', error);
        await logSecurityEvent('session_init_failed', 'high', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[SECURITY] Auth state change:', event);
        
        if (mounted) {
          if (event === 'SIGNED_OUT' || !newSession) {
            setUser(null);
            setSession(null);
            setSessionFingerprint(null);
            
            if (event === 'SIGNED_OUT') {
              await logSecurityEvent('user_signed_out', 'low', {
                timestamp: new Date().toISOString()
              });
            }
          } else if (event === 'SIGNED_IN' && newSession) {
            const isValid = await validateSession(newSession);
            
            if (isValid) {
              setSession(newSession);
              setUser(newSession.user);
              
              await logSecurityEvent('user_signed_in', 'low', {
                user_id: newSession.user.id,
                method: event
              });
            } else {
              await forceLogout();
              return;
            }
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            const isValid = await validateSession(newSession);
            
            if (isValid) {
              setSession(newSession);
              setUser(newSession.user);
              
              await logSecurityEvent('token_refreshed', 'low', {
                user_id: newSession.user.id
              });
            } else {
              await forceLogout();
              return;
            }
          }
        }
      }
    );

    initializeSession();

    // Set up periodic session validation
    sessionCheckRef.current = setInterval(async () => {
      if (session && mounted) {
        const isValid = await validateSession(session);
        if (!isValid) {
          await forceLogout();
        }
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, []);

  return {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    sessionFingerprint,
    forceLogout
  };
};
