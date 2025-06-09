import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AboutMe from "@/pages/AboutMe";
import Services from "@/pages/Services";
import Gallery from "@/pages/Gallery";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import LipModeling from "@/pages/LipModeling";
import AntiAgingTherapies from "@/pages/AntiAgingTherapies";
import NotFound from "@/pages/NotFound";

// Admin imports
import AdminWrapper from "@/pages/admin/AdminWrapper";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCRM from "@/pages/admin/AdminCRM";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminPosts from "@/pages/admin/AdminPosts";
import AdminPostEditor from "@/pages/admin/AdminPostEditor";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminPricing from "@/pages/admin/AdminPricing";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCodeSettings from "@/pages/admin/AdminCodeSettings";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/o-mnie" element={<AboutMe />} />
      <Route path="/uslugi" element={<Services />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/cennik" element={<Pricing />} />
      <Route path="/kontakt" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/modelowanie-ust" element={<LipModeling />} />
      <Route path="/terapie-anti-aging" element={<AntiAgingTherapies />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="crm" element={<AdminCRM />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<AdminPostEditor />} />
            <Route path="posts/edit/:id" element={<AdminPostEditor />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings/code" element={<AdminCodeSettings />} />
          </Route>
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
