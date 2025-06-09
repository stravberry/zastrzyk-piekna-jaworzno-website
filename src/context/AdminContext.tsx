
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { hasRole, getCurrentUserRole, isAdmin, UserRole } from "@/services/auth/userRoles";

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

// Clean up auth state - less aggressive
const cleanupAuthState = () => {
  console.log('[AUTH] Cleaning up auth state');
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('supabase.auth.token') || key.includes('sb-auth-token')) {
        localStorage.removeItem(key);
        console.log('[AUTH] Removed key:', key);
      }
    });
  } catch (error) {
    console.error('[AUTH] Error cleaning auth state:', error);
  }
};

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

  // Session timeout (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Check user permissions with retry
  const checkPermissions = async (retries = 2): Promise<boolean> => {
    console.log('[AUTH] Checking permissions, retries left:', retries);
    try {
      const adminStatus = await isAdmin();
      const role = await getCurrentUserRole();
      const editorStatus = await hasRole('editor');
      
      console.log('[AUTH] Permissions check result:', { adminStatus, role, editorStatus });
      
      setIsAdminUser(adminStatus);
      setIsEditor(editorStatus);
      setUserRole(role);
      
      return adminStatus || editorStatus;
    } catch (error) {
      console.error('[AUTH] Error checking permissions:', error);
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

  // Check session validity with improved error handling
  const checkSessionValidity = async () => {
    try {
      console.log('[AUTH] Checking session validity');
      
      // Check session timeout
      if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT) {
        console.log("[AUTH] Session timed out");
        await handleInvalidSession();
        return;
      }

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AUTH] Session check error:", error);
        // Don't immediately invalidate on network errors
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.log("[AUTH] Network error, keeping current session");
          return;
        }
        await handleInvalidSession();
        return;
      }

      if (!currentSession && isAuthenticated) {
        console.log("[AUTH] Session expired, logging out user");
        await handleInvalidSession();
        return;
      }

      if (currentSession && (!session || session.access_token !== currentSession.access_token)) {
        console.log("[AUTH] Session updated, refreshing user state");
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        await checkPermissions();
      }
    } catch (error) {
      console.error("[AUTH] Error checking session validity:", error);
    }
  };

  // Handle invalid session with better UX
  const handleInvalidSession = async () => {
    try {
      console.log('[AUTH] Handling invalid session');
      
      // Stop session checking first
      stopSessionCheck();
      
      // Clean up state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      // Clean up storage (less aggressive)
      cleanupAuthState();
      
      // Try to sign out
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.error('[AUTH] Error during signOut:', error);
      }
      
      // Only redirect if we're in admin area and not already on login
      if (window.location.pathname.startsWith('/admin') && 
          window.location.pathname !== '/admin/login') {
        console.log('[AUTH] Redirecting to login');
        toast.error('Sesja wygasła. Zostaniesz przekierowany do logowania.');
        navigate("/admin/login");
      }
    } catch (error) {
      console.error('[AUTH] Error during invalid session handling:', error);
    }
  };

  // Start session checking with better intervals
  const startSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      if (isAuthenticated && !initializingRef.current) {
        checkSessionValidity();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes instead of 1
  };

  // Stop session checking
  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Improved initialization
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

        // Then check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AUTH] Initial session check:', !!currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          updateActivity();
          
          // Check permissions after state is set
          setTimeout(async () => {
            await checkPermissions();
            startSessionCheck();
          }, 100);
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
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AUTH] Starting login process');
    try {
      // Minimal cleanup before login
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        console.log('[AUTH] No existing session to sign out');
      }
      
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
        // Check permissions with retry
        const hasPermissions = await checkPermissions();
        
        if (!hasPermissions) {
          console.log('[AUTH] User lacks admin permissions');
          await supabase.auth.signOut();
          throw new Error('Brak uprawnień do panelu administracyjnego');
        }

        // Log admin activity
        await supabase.rpc('log_admin_activity', {
          _action: 'login',
          _resource_type: 'auth',
          _details: { email }
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

  const logout = async () => {
    console.log('[AUTH] Starting logout process');
    try {
      stopSessionCheck();
      
      // Log admin activity before logout
      if (isAuthenticated) {
        try {
          await supabase.rpc('log_admin_activity', {
            _action: 'logout',
            _resource_type: 'auth'
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
      
      // Then sign out
      await supabase.auth.signOut({ scope: 'local' });
      cleanupAuthState();
      
      toast.success('Wylogowano pomyślnie');
      navigate("/admin/login");
      console.log('[AUTH] Logout completed successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      toast.error('Wystąpił błąd podczas wylogowywania');
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
