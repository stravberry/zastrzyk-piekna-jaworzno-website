
import React, { useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate, useLocation } from "react-router-dom";

const SecurityMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  // Simple authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        console.log('[SECURITY] No authentication detected, redirecting to login');
        navigate('/admin/login', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return <>{children}</>;
};

export default SecurityMonitor;
