
import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminWrapper: React.FC = () => {
  const location = useLocation();
  
  // Check if we're at the admin root path and redirect to login
  if (location.pathname === "/admin/" || location.pathname === "/admin") {
    return (
      <AdminProvider>
        <Navigate to="/admin/login" replace />
      </AdminProvider>
    );
  }

  // Don't wrap login page with AdminLayout
  if (location.pathname === "/admin/login") {
    return (
      <AdminProvider>
        <Outlet />
      </AdminProvider>
    );
  }

  // Wrap all other admin pages with AdminLayout
  return (
    <AdminProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminProvider>
  );
};

export default AdminWrapper;
