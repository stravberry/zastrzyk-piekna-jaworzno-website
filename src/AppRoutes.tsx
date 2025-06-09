
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AboutMe from "./pages/AboutMe";
import Services from "./pages/Services";
import LipModeling from "./pages/LipModeling";
import AntiAgingTherapies from "./pages/AntiAgingTherapies";
import Gallery from "./pages/Gallery";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminWrapper from "./pages/admin/AdminWrapper";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminCodeSettings from "./pages/admin/AdminCodeSettings";
import AdminUsers from "./pages/admin/AdminUsers";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/o-mnie" element={<AboutMe />} />
      <Route path="/uslugi" element={<Services />} />
      <Route path="/modelowanie-ust" element={<LipModeling />} />
      <Route path="/terapie-anti-aging" element={<AntiAgingTherapies />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/cennik" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/kontakt" element={<Contact />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="code-settings" element={<AdminCodeSettings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
