
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

// Clean up auth state
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
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

  // Session timeout (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Check user permissions
  const checkPermissions = async (): Promise<boolean> => {
    try {
      const adminStatus = await isAdmin();
      const role = await getCurrentUserRole();
      const editorStatus = await hasRole('editor');
      
      setIsAdminUser(adminStatus);
      setIsEditor(editorStatus);
      setUserRole(role);
      
      return adminStatus || editorStatus;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  // Update last activity
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Check session validity and timeout
  const checkSessionValidity = async () => {
    try {
      // Check session timeout
      if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT) {
        console.log("Session timed out");
        await handleInvalidSession();
        return;
      }

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        await handleInvalidSession();
        return;
      }

      if (!currentSession && isAuthenticated) {
        console.log("Session expired, logging out user");
        await handleInvalidSession();
        return;
      }

      if (currentSession && (!session || session.access_token !== currentSession.access_token)) {
        console.log("Session updated, refreshing user state");
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        await checkPermissions();
      }
    } catch (error) {
      console.error("Error checking session validity:", error);
    }
  };

  // Handle invalid session
  const handleInvalidSession = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        toast.error('Sesja wygasła. Zostaniesz przekierowany do logowania.');
        navigate("/admin/login");
      }
    } catch (error) {
      console.error('Error during invalid session handling:', error);
    }
  };

  // Start session checking
  const startSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      if (isAuthenticated) {
        checkSessionValidity();
      }
    }, 60000); // Check every minute
  };

  // Stop session checking
  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state change", event, session);
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);

          if (session?.user) {
            await checkPermissions();
            updateActivity();
            startSessionCheck();
          } else {
            setUserRole(null);
            setIsAdminUser(false);
            setIsEditor(false);
            stopSessionCheck();
          }
        }
      );

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session?.user);
      
      if (data.session?.user) {
        await checkPermissions();
        updateActivity();
        startSessionCheck();
      }
      
      setLoading(false);

      return () => subscription.unsubscribe();
    };

    initAuth();

    // Activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      stopSessionCheck();
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if user has admin/editor permissions
        const hasPermissions = await checkPermissions();
        
        if (!hasPermissions) {
          await supabase.auth.signOut();
          throw new Error('Brak uprawnień do panelu administracyjnego');
        }

        // Log admin activity
        await supabase.rpc('log_admin_activity', {
          _action: 'login',
          _resource_type: 'auth',
          _details: { email }
        });

        toast.success('Zalogowano pomyślnie');
        updateActivity();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Wystąpił błąd podczas logowania');
      return false;
    }
  };

  const logout = async () => {
    try {
      stopSessionCheck();
      
      // Log admin activity before logout
      if (isAuthenticated) {
        await supabase.rpc('log_admin_activity', {
          _action: 'logout',
          _resource_type: 'auth'
        });
      }
      
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      toast.success('Wylogowano pomyślnie');
      navigate("/admin/login");
    } catch (error) {
      console.error('Logout error:', error);
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
