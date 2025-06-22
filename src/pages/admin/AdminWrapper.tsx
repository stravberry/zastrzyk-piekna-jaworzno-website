
import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

const AdminWrapper: React.FC = () => {
  const location = useLocation();
  
  return (
    <AdminProvider>
      {/* Check if we're at the admin root path and redirect to dashboard */}
      {(location.pathname === "/admin/" || location.pathname === "/admin") ? (
        <Navigate to="/admin/dashboard" replace />
      ) : (
        // Login page doesn't need protection, but all other admin pages do
        location.pathname === "/admin/login" ? (
          <Outlet />
        ) : (
          <AdminProtectedRoute requiredRole="editor">
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </AdminProtectedRoute>
        )
      )}
    </AdminProvider>
  );
};

export default AdminWrapper;
