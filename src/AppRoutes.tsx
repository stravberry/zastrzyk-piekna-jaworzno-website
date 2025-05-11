
import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAdmin } from "./context/AdminContext";
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

const AppRoutes = () => {
  const { isAuthenticated: isAdmin } = useAdmin();

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
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="code-settings" element={<AdminCodeSettings />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
