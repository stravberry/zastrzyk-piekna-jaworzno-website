
import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";

const AdminWrapper: React.FC = () => {
  const location = useLocation();
  
  // Check if we're at the admin root path and redirect to dashboard if so
  if (location.pathname === "/admin/") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
};

export default AdminWrapper;
