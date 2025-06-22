
import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminWrapper: React.FC = () => {
  const location = useLocation();
  
  // Always wrap everything in AdminProvider first
  return (
    <AdminProvider>
      {/* Check if we're at the admin root path and redirect to dashboard */}
      {(location.pathname === "/admin/" || location.pathname === "/admin") ? (
        <Navigate to="/admin/dashboard" replace />
      ) : (
        // Don't wrap login page with AdminLayout, but keep other pages wrapped
        location.pathname === "/admin/login" ? (
          <Outlet />
        ) : (
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        )
      )}
    </AdminProvider>
  );
};

export default AdminWrapper;
