
import React, { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Instead of showing a 404 page, immediately redirect to home page
  return <Navigate to="/" replace />;
};

export default NotFound;
