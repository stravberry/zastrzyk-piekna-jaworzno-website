
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { logSecurityEvent } from "@/services/securityService";
import SecurityMonitor from "./SecurityMonitor";

interface AdminSecurityWrapperProps {
  children: React.ReactNode;
}

const AdminSecurityWrapper: React.FC<AdminSecurityWrapperProps> = ({ children }) => {
  const { isAuthenticated, user, userRole } = useAdmin();
  const location = useLocation();

  // Log all admin access attempts
  useEffect(() => {
    const logAdminAccess = async () => {
      try {
        if (location.pathname.startsWith('/admin')) {
          await logSecurityEvent('admin_page_access', 'low', {
            path: location.pathname,
            user_id: user?.id || 'anonymous',
            user_role: userRole || 'none',
            is_authenticated: isAuthenticated,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'direct'
          });

          // Log suspicious access patterns
          if (!isAuthenticated && location.pathname !== '/admin/login') {
            await logSecurityEvent('unauthorized_admin_access', 'high', {
              attempted_path: location.pathname,
              ip_info: 'client-side-detection',
              timestamp: new Date().toISOString()
            });
          }

          // Log role-based access
          if (isAuthenticated && user) {
            const requiredRole = getRequiredRoleForPath(location.pathname);
            if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
              await logSecurityEvent('insufficient_role_access_attempt', 'medium', {
                user_id: user.id,
                required_role: requiredRole,
                user_role: userRole,
                attempted_path: location.pathname
              });
            }
          }
        }
      } catch (error) {
        console.error('[SECURITY] Failed to log admin access:', error);
      }
    };

    logAdminAccess();
  }, [location.pathname, isAuthenticated, user, userRole]);

  return (
    <SecurityMonitor>
      {children}
    </SecurityMonitor>
  );
};

// Helper function to determine required role for a path
const getRequiredRoleForPath = (path: string): string | null => {
  const adminOnlyPaths = [
    '/admin/users',
    '/admin/code-settings'
  ];

  if (adminOnlyPaths.some(adminPath => path.startsWith(adminPath))) {
    return 'admin';
  }

  if (path.startsWith('/admin') && path !== '/admin/login') {
    return 'editor';
  }

  return null;
};

// Helper function to check if user has required role
const hasRequiredRole = (userRole: string | null, requiredRole: string): boolean => {
  if (!userRole) return false;
  
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  
  if (requiredRole === 'editor') {
    return userRole === 'admin' || userRole === 'editor';
  }
  
  return true;
};

export default AdminSecurityWrapper;
