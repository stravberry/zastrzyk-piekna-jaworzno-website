
import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAdmin } from "./context/AdminContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import usePageTracking from "./hooks/usePageTracking";
import Index from "./pages/Index";
import AboutMe from "./pages/AboutMe";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminWrapper from "./components/admin/AdminWrapper";
import AdminCodeSettings from "./pages/admin/AdminCodeSettings";
import AdminPricing from "./pages/admin/AdminPricing";
import AntiAgingTherapies from "./pages/AntiAgingTherapies";

const AppRoutes = () => {
  const { isAuthenticated } = useAdmin();
  
  // Use the page tracking hook to scroll to top on route change
  usePageTracking();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutMe />} />
      <Route path="/services" element={<Services />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/zabiegi/terapie-przeciwstarzeniowe" element={<AntiAgingTherapies />} />
      
      {/* Admin Routes */}
      {/* Redirect /admin (without slash) to /admin/ */}
      <Route path="admin" element={<Navigate to="/admin/" replace />} />
      
      {/* Handle all admin routes */}
      <Route path="admin/*" element={<AdminWrapper />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="posts" element={
          <AdminProtectedRoute>
            <AdminPosts />
          </AdminProtectedRoute>
        } />
        <Route path="posts/new" element={
          <AdminProtectedRoute>
            <AdminPostEditor />
          </AdminProtectedRoute>
        } />
        <Route path="posts/edit/:id" element={
          <AdminProtectedRoute>
            <AdminPostEditor />
          </AdminProtectedRoute>
        } />
        <Route path="pricing" element={
          <AdminProtectedRoute>
            <AdminPricing />
          </AdminProtectedRoute>
        } />
        <Route path="code-settings" element={
          <AdminProtectedRoute>
            <AdminCodeSettings />
          </AdminProtectedRoute>
        } />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
