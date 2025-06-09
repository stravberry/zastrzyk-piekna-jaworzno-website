
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AboutMe from "./pages/AboutMe";
import Services from "./pages/Services";
import LipModeling from "./pages/LipModeling";
import AntiAgingTherapies from "./pages/AntiAgingTherapies";
import Pricing from "./pages/Pricing";
import Gallery from "./pages/Gallery";
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
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCodeSettings from "./pages/admin/AdminCodeSettings";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutMe />} />
      <Route path="/services" element={<Services />} />
      <Route path="/lip-modeling" element={<LipModeling />} />
      <Route path="/anti-aging" element={<AntiAgingTherapies />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="crm" element={<AdminCRM />} />
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
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
