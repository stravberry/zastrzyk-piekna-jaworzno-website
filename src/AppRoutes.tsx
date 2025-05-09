
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import usePageTracking from "./hooks/usePageTracking";
import { AdminProvider } from "@/context/AdminContext";

// Pages
import Index from "./pages/Index";
import AboutMe from "./pages/AboutMe";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin CMS
import AdminWrapper from "./pages/admin/AdminWrapper";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminCodeSettings from "./pages/admin/AdminCodeSettings";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

const AppRoutes = () => {
  // Use the tracking hook
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/o-mnie" element={<AboutMe />} />
      <Route path="/zabiegi" element={<Services />} />
      <Route path="/cennik" element={<Pricing />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/kontakt" element={<Contact />} />
      
      {/* Admin Login Route - Wrapped with AdminProvider */}
      <Route path="/admin" element={
        <AdminProvider>
          <AdminLogin />
        </AdminProvider>
      } />
      
      {/* Admin CMS Routes - Wrapped with AdminWrapper which includes AdminProvider */}
      <Route path="/admin/*" element={<AdminWrapper />}>
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
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
