
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";

const AdminWrapper: React.FC = () => {
  const location = useLocation();

  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
};

export default AdminWrapper;
