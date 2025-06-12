
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Pricing from "./pages/Pricing";
import AboutMe from "./pages/AboutMe";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import LipModeling from "./pages/LipModeling";
import AntiAgingTherapies from "./pages/AntiAgingTherapies";

// Admin imports
import AdminWrapper from "./pages/admin/AdminWrapper";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminCodeSettings from "./pages/admin/AdminCodeSettings";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/uslugi" element={<Services />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/cennik" element={<Pricing />} />
      <Route path="/o-mnie" element={<AboutMe />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/kontakt" element={<Contact />} />
      <Route path="/modelowanie-ust" element={<LipModeling />} />
      <Route path="/terapie-antystarzeniowe" element={<AntiAgingTherapies />} />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminWrapper />}>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="code-settings" element={<AdminCodeSettings />} />
        <Route path="crm" element={<AdminCRM />} />
        <Route path="email-templates" element={<AdminEmailTemplates />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
