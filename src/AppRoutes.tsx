
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import usePageTracking from "./hooks/usePageTracking";

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
      
      {/* Admin CMS Routes - Wrapped with AdminProvider */}
      <Route path="/admin" element={
        <AdminProvider>
          <AdminLogin />
        </AdminProvider>
      } />
      <Route path="/admin/*" element={<AdminWrapper />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="code-settings" element={<AdminCodeSettings />} />
      </Route>
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
