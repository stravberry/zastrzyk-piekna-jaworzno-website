
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { hasRole, getCurrentUserRole, isAdmin, UserRole } from "@/services/auth/userRoles";
import { secureLogger } from "@/utils/secureLogger";

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
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const initializingRef = useRef<boolean>(false);

  // Simplified permission checking
  const checkPermissions = async (): Promise<boolean> => {
    secureLogger.debug('Checking user permissions');
    try {
      const adminStatus = await isAdmin();
      const role = await getCurrentUserRole();
      const editorStatus = await hasRole('editor');
      
      secureLogger.debug('Permissions result:', { adminStatus, role, editorStatus });
      
      setIsAdminUser(adminStatus);
      setIsEditor(editorStatus);
      setUserRole(role);
      
      return adminStatus || editorStatus;
    } catch (error) {
      secureLogger.error('Error checking permissions:', error);
      return false;
    }
  };

  // Simple initialization
  useEffect(() => {
    const initAuth = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      secureLogger.debug('Initializing authentication');

      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            secureLogger.debug("Auth state change event:", { event, hasSession: !!session });
            
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);

            if (session?.user) {
              // Check permissions after successful auth
              setTimeout(async () => {
                await checkPermissions();
              }, 100);
            } else {
              setUserRole(null);
              setIsAdminUser(false);
              setIsEditor(false);
            }
          }
        );

        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        secureLogger.debug('Initial session status:', { hasSession: !!currentSession });
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          await checkPermissions();
        }

        setLoading(false);
        initializingRef.current = false;

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        secureLogger.error('Error during auth initialization:', error);
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initAuth();
  }, []);

  // Simple login
  const login = async (email: string, password: string): Promise<boolean> => {
    secureLogger.info('Starting admin login process');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        secureLogger.error('Login authentication failed:', error);
        throw error;
      }
      
      if (data.user) {
        secureLogger.info('Authentication successful, checking permissions');
        
        // Check permissions
        const hasPermissions = await checkPermissions();
        
        if (!hasPermissions) {
          secureLogger.warn('User lacks admin permissions, signing out');
          await supabase.auth.signOut();
          throw new Error('Brak uprawnień do panelu administracyjnego');
        }

        secureLogger.info('Admin login completed successfully');
        toast.success('Zalogowano pomyślnie');
        return true;
      }
      return false;
    } catch (error: any) {
      secureLogger.error('Login process failed:', error);
      toast.error(error.message || 'Wystąpił błąd podczas logowania');
      return false;
    }
  };

  // Simple logout
  const logout = async () => {
    secureLogger.info('Starting admin logout process');
    try {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdminUser(false);
      setIsEditor(false);
      
      await supabase.auth.signOut();
      
      toast.success('Wylogowano bezpiecznie');
      navigate("/admin/login", { replace: true });
      secureLogger.info('Admin logout completed successfully');
    } catch (error) {
      secureLogger.error('Logout process failed:', error);
      toast.error('Wystąpił błąd podczas wylogowywania');
      navigate("/admin/login", { replace: true });
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
      checkPermissions,
      isMobileSidebarOpen,
      setMobileSidebarOpen: setIsMobileSidebarOpen
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
