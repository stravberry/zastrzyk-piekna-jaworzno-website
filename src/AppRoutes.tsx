
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import usePageTracking from "./hooks/usePageTracking";
import { AdminProvider } from "@/context/AdminContext";
import { getCodeSettings } from "@/services/codeSettingsService";
import { supabase } from "@/integrations/supabase/client";

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

  // Initialize code_settings table if it doesn't exist
  useEffect(() => {
    const initCodeSettingsTable = async () => {
      try {
        // Check if the code_settings table exists and create it if it doesn't
        const { error } = await supabase.rpc('create_code_settings_table_if_not_exists');
        if (error) {
          console.error("Error initializing code_settings table:", error);
          
          // Try to create the table directly if the RPC function fails
          const createTableResult = await supabase.rpc('create_code_settings_table_directly');
          if (createTableResult.error) {
            console.error("Error creating code_settings table directly:", createTableResult.error);
          }
        }
        
        // Try to fetch the code settings to test if they exist
        await getCodeSettings();
      } catch (error) {
        console.error("Error in initCodeSettingsTable:", error);
      }
    };
    
    initCodeSettingsTable();
  }, []);

  // Inject custom code snippets into the page
  useEffect(() => {
    const injectCustomCode = async () => {
      try {
        const settings = await getCodeSettings();
        
        // Inject head code if it exists
        if (settings.headCode) {
          const headScript = document.createElement('div');
          headScript.innerHTML = settings.headCode;
          document.head.appendChild(headScript);
        }
        
        // Inject body code if it exists
        if (settings.bodyCode) {
          const bodyScript = document.createElement('div');
          bodyScript.innerHTML = settings.bodyCode;
          document.body.appendChild(bodyScript);
        }
      } catch (error) {
        console.error('Error injecting custom code:', error);
      }
    };
    
    injectCustomCode();
  }, []);
  
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
