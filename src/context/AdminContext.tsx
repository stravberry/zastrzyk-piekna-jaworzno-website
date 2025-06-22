
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { hasRole, getCurrentUserRole, isAdmin, UserRole } from "@/services/auth/userRoles";
import { logSecurityEvent, cleanupAuthState, validateUserSession } from "@/services/securityService";

interface AdminContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  checkPermissions: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isEditor, setIsEditor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const initializingRef = useRef<boolean>(false);
  const securityCheckCountRef = useRef<number>(0);

  // Session timeout (20 minutes for enhanced security)
  const SESSION_TIMEOUT = 20 * 60 * 1000;
  const MAX_FAILED_CHECKS = 3;
  const failedChecksRef = useRef<number>(0);

  // Enhanced permission checking with security logging
  const checkPermissions = async (retries = 2): Promise<boolean> => {
    console.log('[AUTH] Checking permissions, retries left:', retries);
    try {
      securityCheckCountRef.current++;
      
      // Validate session first
      const sessionValidation = await validateUserSession();
      if (!sessionValidation.isValid) {
        await logSecurityEvent('permission_check_failed_invalid_session', 'high', {
          needs_reauth: sessionValidation.needsReauth,
          check_count: securityCheckCountRef.current
        });
        
        if (sessionValidation.needsReauth) {
          await handleInvalidSession();
        }
        return false;
      }

      const adminStatus = await isAdmin();
      const role = await getCurrentUserRole();
      const editorStatus = await hasRole('editor');
      
      console.log('[AUTH] Permissions check result:', { adminStatus, role, editorStatus });
      
      // Log permission changes
      if (isAdminUser !== adminStatus || userRole !== role || isEditor !== editorStatus) {
        await logSecurityEvent('permissions_changed', 'medium', {
          old_admin: isAdminUser,
          new_admin: adminStatus,
          old_role: userRole,
          new_role: role,
          old_editor: isEditor,
          new_editor: editorStatus
        });
      }
      
      setIsAdminUser(adminStatus);
      setIsEditor(editorStatus);
      setUserRole(role);
      
      failedChecksRef.current = 0; // Reset failed checks on success
      
      return adminStatus || editorStatus;
    } catch (error) {
      console.error('[AUTH] Error checking permissions:', error);
      failedChecksRef.current++;
      
      await logSecurityEvent('permission_check_error', 'high', {
        error: error instanceof Error ? error.message : 'Unknown error',
        failed_checks: failedChecksRef.current,
        retries_left: retries
      });
      
      if (failedChecksRef.current >= MAX_FAILED_CHECKS) {
        await logSecurityEvent('max_permission_check_failures', 'critical', {
          failed_checks: failedChecksRef.current
        });
        await handleInvalidSession();
        return false;
      }
      
      if (retries > 0) {
        console.log('[AUTH] Retrying permissions check...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return checkPermissions(retries - 1);
      }
      return false;
    }
  };

  // Update last activity with debouncing
  const updateActivity = useRef(
    (() => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          lastActivityRef.current = Date.now();
        }, 1000);
      };
    })()
  ).current;

  // Enhanced session validity checking
  const checkSessionValidity = async () => {
    try {
      console.log('[AUTH] Checking session validity');
      
      // Check session timeout based on user activity
      if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT) {
        console.log("[AUTH] Session timed out due to inactivity");
        await logSecurityEvent('session_timeout_inactivity', 'medium', {
          last_activity: new Date(lastActivityRef.current).toISOString(),
          timeout_minutes: SESSION_TIMEOUT / 60000
        });
        await handleInvalidSession();
        return;
      }

      // Use enhanced session validation
      const validation = await validateUserSession();
      
      if (!validation.isValid) {
        console.log("[AUTH] Session validation failed");
        if (validation.needsReauth) {
          await handleInvalidSession();
        }
        return;
      }

      // Check for session changes
      if (validation.user && (!session || session.access_token !== validation.user.access_token)) {
        console.log("[AUTH] Session updated, refreshing user state");
        setSession(validation.user);
        setUser(validation.user.user || validation.user);
        setIsAuthenticated(true);
        await checkPermissions();
      }
    } catch (error) {
      console.error("[AUTH] Error checking session validity:", error);
      await logSecurityEvent('session_validity_check_error', 'high', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Enhanced invalid session handling
  const handleInvalidSession = async () => {
    try {
      console.log('[AUTH] Handling invalid session');
      
      await logSecurityEvent('invalid_session_handled', 'medium', {
        current_path: window.location.pathname,
        was_authenticated: isAuthenticated
      });
      
      // Stop session checking first
      stopSessionCheck();
      
      // Clean up state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      // Enhanced cleanup
      cleanupAuthState();
      
      // Try to sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.error('[AUTH] Error during signOut:', error);
      }
      
      // Only redirect if we're in admin area and not already on login
      if (window.location.pathname.startsWith('/admin') && 
          window.location.pathname !== '/admin/login') {
        console.log('[AUTH] Redirecting to login');
        toast.error('Sesja wygasła ze względów bezpieczeństwa. Zaloguj się ponownie.');
        navigate("/admin/login");
      }
    } catch (error) {
      console.error('[AUTH] Error during invalid session handling:', error);
      // Force redirect on any error
      window.location.href = '/admin/login';
    }
  };

  // Start enhanced session checking
  const startSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      if (isAuthenticated && !initializingRef.current) {
        checkSessionValidity();
      }
    }, 60 * 1000); // Check every minute for enhanced security
  };

  // Stop session checking
  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Enhanced initialization
  useEffect(() => {
    const initAuth = async () => {
      if (initializingRef.current) {
        console.log('[AUTH] Already initializing, skipping');
        return;
      }
      
      initializingRef.current = true;
      console.log('[AUTH] Initializing auth state');

      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("[AUTH] Auth state change:", event, !!session);
            
            await logSecurityEvent('auth_state_change', 'low', {
              event,
              has_session: !!session,
              user_id: session?.user?.id || 'none'
            });
            
            // Update state immediately
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);

            if (session?.user) {
              updateActivity();
              // Use setTimeout to avoid blocking the auth state change
              setTimeout(async () => {
                await checkPermissions();
                startSessionCheck();
              }, 100);
            } else {
              setUserRole(null);
              setIsAdminUser(false);
              setIsEditor(false);
              stopSessionCheck();
            }
          }
        );

        // Then check for existing session with validation
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AUTH] Initial session check:', !!currentSession);
        
        if (currentSession) {
          // Validate the existing session
          const validation = await validateUserSession();
          
          if (validation.isValid) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAuthenticated(true);
            updateActivity();
            
            // Check permissions after state is set
            setTimeout(async () => {
              await checkPermissions();
              startSessionCheck();
            }, 100);
          } else {
            console.log('[AUTH] Initial session invalid, cleaning up');
            await handleInvalidSession();
          }
        }

        setLoading(false);
        initializingRef.current = false;

        // Activity listeners
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
          document.addEventListener(event, updateActivity, { passive: true });
        });

        return () => {
          subscription.unsubscribe();
          stopSessionCheck();
          activityEvents.forEach(event => {
            document.removeEventListener(event, updateActivity);
          });
        };
      } catch (error) {
        console.error('[AUTH] Error during initialization:', error);
        await logSecurityEvent('auth_initialization_error', 'high', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initAuth();
  }, []);

  // Enhanced login with security checks
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AUTH] Starting secure login process');
    try {
      // Enhanced cleanup before login
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('[AUTH] No existing session to sign out');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AUTH] Login error:', error);
        await logSecurityEvent('login_failed', 'medium', {
          email: email.substring(0, 3) + '***',
          error: error.message,
          attempt_time: new Date().toISOString()
        });
        throw error;
      }
      
      if (data.user) {
        console.log('[AUTH] Login successful, checking permissions');
        
        // Check permissions with retry
        const hasPermissions = await checkPermissions();
        
        if (!hasPermissions) {
          console.log('[AUTH] User lacks admin permissions');
          await logSecurityEvent('unauthorized_login_attempt', 'high', {
            email: email.substring(0, 3) + '***',
            user_id: data.user.id
          });
          await supabase.auth.signOut();
          throw new Error('Brak uprawnień do panelu administracyjnego');
        }

        // Log successful admin login
        await logSecurityEvent('admin_login_success', 'low', {
          user_id: data.user.id,
          email: email.substring(0, 3) + '***',
          login_time: new Date().toISOString()
        });

        console.log('[AUTH] Login completed successfully');
        toast.success('Zalogowano pomyślnie');
        updateActivity();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      toast.error(error.message || 'Wystąpił błąd podczas logowania');
      return false;
    }
  };

  // Enhanced logout with security logging
  const logout = async () => {
    console.log('[AUTH] Starting secure logout process');
    try {
      stopSessionCheck();
      
      // Log admin activity before logout
      if (isAuthenticated && user) {
        try {
          await logSecurityEvent('admin_logout', 'low', {
            user_id: user.id,
            logout_time: new Date().toISOString(),
            session_duration: Math.floor((Date.now() - lastActivityRef.current) / 60000)
          });
        } catch (error) {
          console.error('[AUTH] Error logging logout activity:', error);
        }
      }
      
      // Clean state first
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      // Enhanced cleanup
      cleanupAuthState();
      
      // Then sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success('Wylogowano bezpiecznie');
      navigate("/admin/login");
      console.log('[AUTH] Secure logout completed successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      // Force cleanup even on error
      cleanupAuthState();
      toast.error('Wystąpił błąd podczas wylogowywania, ale sesja została zakończona');
      window.location.href = '/admin/login';
    }
  };

  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      userRole,
      isAdmin: isAdminUser,
      isEditor,
      login, 
      logout, 
      loading,
      checkPermissions
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
