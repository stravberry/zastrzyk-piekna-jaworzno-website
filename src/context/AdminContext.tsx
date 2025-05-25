
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AdminContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Clean up any lingering auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
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
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Function to check session validity
  const checkSessionValidity = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        await handleInvalidSession();
        return;
      }

      // If no session and we think we're authenticated, log out
      if (!currentSession && isAuthenticated) {
        console.log("Session expired, logging out user");
        await handleInvalidSession();
        return;
      }

      // If session exists but user data doesn't match, update state
      if (currentSession && (!session || session.access_token !== currentSession.access_token)) {
        console.log("Session updated, refreshing user state");
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error checking session validity:", error);
      // Don't auto-logout on network errors, only on auth errors
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
      
      // Only show toast and redirect if we're currently in admin area
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        toast.error('Sesja wygasła. Zostaniesz przekierowany do logowania.');
        navigate("/admin/login");
      }
    } catch (error) {
      console.error('Error during invalid session handling:', error);
    }
  };

  // Start session checking interval
  const startSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    // Check session every 2 minutes (120000ms)
    sessionCheckInterval.current = setInterval(() => {
      if (isAuthenticated) {
        checkSessionValidity();
      }
    }, 120000);
  };

  // Stop session checking interval
  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth state change", event, session);
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);

          // Start or stop session checking based on auth status
          if (session?.user) {
            startSessionCheck();
          } else {
            stopSessionCheck();
          }
        }
      );

      // THEN check for existing session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session?.user);
      setLoading(false);

      // Start session checking if authenticated
      if (data.session?.user) {
        startSessionCheck();
      }

      return () => subscription.unsubscribe();
    };

    initAuth();

    // Cleanup interval on unmount
    return () => {
      stopSessionCheck();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // For test account, use specific credentials for demo
      if (email === 'admin@test.pl') {
        console.log("Using test account");
      }
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Zalogowano pomyślnie');
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
      // Stop session checking first
      stopSessionCheck();
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      toast.success('Wylogowano pomyślnie');
      navigate("/admin");
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
      login, 
      logout, 
      loading 
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
