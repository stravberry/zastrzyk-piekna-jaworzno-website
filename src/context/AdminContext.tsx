
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { hasRole, getCurrentUserRole, isAdmin, UserRole } from "@/services/auth/userRoles";
import { logSecurityEvent, cleanupAuthState } from "@/services/securityService";

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
  const permissionsCache = useRef<{ [key: string]: boolean }>({});

  // Simplified permission checking with caching
  const checkPermissions = async (useCache = true): Promise<boolean> => {
    console.log('[AUTH] Checking permissions (fast mode)');
    try {
      const cacheKey = `${user?.id}_permissions`;
      
      // Use cache if available and not expired (5 minutes)
      if (useCache && permissionsCache.current[cacheKey]) {
        console.log('[AUTH] Using cached permissions');
        return permissionsCache.current[cacheKey];
      }

      // Quick permission check without heavy validation
      const adminStatus = await isAdmin();
      const role = await getCurrentUserRole();
      const editorStatus = await hasRole('editor');
      
      console.log('[AUTH] Fast permissions check result:', { adminStatus, role, editorStatus });
      
      // Update state
      setIsAdminUser(adminStatus);
      setIsEditor(editorStatus);
      setUserRole(role);
      
      const hasPermissions = adminStatus || editorStatus;
      
      // Cache result for 5 minutes
      permissionsCache.current[cacheKey] = hasPermissions;
      setTimeout(() => {
        delete permissionsCache.current[cacheKey];
      }, 5 * 60 * 1000);
      
      // Log security events asynchronously (non-blocking)
      setTimeout(() => {
        logSecurityEvent('permissions_checked', 'low', {
          user_id: user?.id,
          has_permissions: hasPermissions,
          role
        });
      }, 0);
      
      return hasPermissions;
    } catch (error) {
      console.error('[AUTH] Error checking permissions:', error);
      // Log error asynchronously
      setTimeout(() => {
        logSecurityEvent('permission_check_error', 'medium', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }, 0);
      return false;
    }
  };

  // Update activity without debouncing for simpler performance
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Simplified session validity checking (runs less frequently)
  const checkSessionValidity = async () => {
    try {
      // Basic session timeout check (30 minutes)
      const SESSION_TIMEOUT = 30 * 60 * 1000;
      if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT) {
        console.log("[AUTH] Session timed out due to inactivity");
        await handleInvalidSession();
        return;
      }

      // Simple session check
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession && isAuthenticated) {
        console.log("[AUTH] Session lost, cleaning up");
        await handleInvalidSession();
        return;
      }

      // Check if session expires soon (5 minutes)
      if (currentSession?.expires_at) {
        const expiresAt = new Date(currentSession.expires_at).getTime();
        const timeUntilExpiry = expiresAt - Date.now();
        
        if (timeUntilExpiry < 0) {
          console.log("[AUTH] Session expired");
          await handleInvalidSession();
          return;
        }
      }
    } catch (error) {
      console.error("[AUTH] Error checking session validity:", error);
      // Don't fail on session check errors in optimized mode
    }
  };

  // Simplified invalid session handling
  const handleInvalidSession = async () => {
    try {
      console.log('[AUTH] Handling invalid session (fast cleanup)');
      
      // Stop session checking first
      stopSessionCheck();
      
      // Clean up state quickly
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      permissionsCache.current = {};
      
      // Enhanced cleanup
      cleanupAuthState();
      
      // Quick sign out (don't wait for response)
      supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      
      // Fast redirect
      if (window.location.pathname.startsWith('/admin') && 
          window.location.pathname !== '/admin/login') {
        console.log('[AUTH] Fast redirect to login');
        navigate("/admin/login", { replace: true });
      }
    } catch (error) {
      console.error('[AUTH] Error during fast session cleanup:', error);
      // Force redirect on any error
      window.location.href = '/admin/login';
    }
  };

  // Simplified session checking (every 5 minutes instead of 1 minute)
  const startSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      if (isAuthenticated && !initializingRef.current) {
        checkSessionValidity();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  };

  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Optimized initialization
  useEffect(() => {
    const initAuth = async () => {
      if (initializingRef.current) {
        console.log('[AUTH] Already initializing, skipping');
        return;
      }
      
      initializingRef.current = true;
      console.log('[AUTH] Fast auth initialization');

      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("[AUTH] Auth state change:", event, !!session);
            
            // Update state immediately
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);

            if (session?.user) {
              updateActivity();
              // Defer permission check to avoid blocking
              setTimeout(async () => {
                await checkPermissions(false); // Don't use cache on auth change
                startSessionCheck();
              }, 50);
            } else {
              setUserRole(null);
              setIsAdminUser(false);
              setIsEditor(false);
              permissionsCache.current = {};
              stopSessionCheck();
            }
          }
        );

        // Quick session check
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AUTH] Initial session check:', !!currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          updateActivity();
          
          // Defer permission check
          setTimeout(async () => {
            await checkPermissions(false);
            startSessionCheck();
          }, 50);
        }

        setLoading(false);
        initializingRef.current = false;

        // Simplified activity listeners
        const activityEvents = ['mousedown', 'keypress', 'scroll'];
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
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initAuth();
  }, []);

  // Optimized login with minimal security checks
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AUTH] Starting fast login process');
    try {
      // Quick cleanup
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AUTH] Login error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('[AUTH] Login successful, checking permissions');
        
        // Quick permission check
        const hasPermissions = await checkPermissions(false);
        
        if (!hasPermissions) {
          console.log('[AUTH] User lacks admin permissions');
          await supabase.auth.signOut();
          throw new Error('Brak uprawnień do panelu administracyjnego');
        }

        // Log success asynchronously
        setTimeout(() => {
          logSecurityEvent('admin_login_success', 'low', {
            user_id: data.user.id,
            email: email.substring(0, 3) + '***',
            login_time: new Date().toISOString()
          });
        }, 0);

        console.log('[AUTH] Fast login completed successfully');
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

  // Fast logout
  const logout = async () => {
    console.log('[AUTH] Starting fast logout process');
    try {
      stopSessionCheck();
      
      // Log logout asynchronously
      if (isAuthenticated && user) {
        setTimeout(() => {
          logSecurityEvent('admin_logout', 'low', {
            user_id: user.id,
            logout_time: new Date().toISOString()
          });
        }, 0);
      }
      
      // Clean state first
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      permissionsCache.current = {};
      
      // Enhanced cleanup
      cleanupAuthState();
      
      // Quick sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success('Wylogowano bezpiecznie');
      navigate("/admin/login", { replace: true });
      console.log('[AUTH] Fast logout completed successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
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
