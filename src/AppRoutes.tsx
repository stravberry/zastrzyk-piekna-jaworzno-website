
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
import AdminPatientProfile from "./pages/admin/AdminPatientProfile";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

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
      <Route path="/zabiegi/modelowanie-ust" element={<LipModeling />} />
      <Route path="/zabiegi/terapie-antystarzeniowe" element={<AntiAgingTherapies />} />
      
      {/* Admin routes - all wrapped by AdminWrapper which provides AdminProvider and security */}
      <Route path="/admin/*" element={<AdminWrapper />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="posts" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPosts />
          </AdminProtectedRoute>
        } />
        <Route path="posts/new" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPostEditor />
          </AdminProtectedRoute>
        } />
        <Route path="posts/edit/:id" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPostEditor />
          </AdminProtectedRoute>
        } />
        <Route path="gallery" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminGallery />
          </AdminProtectedRoute>
        } />
        <Route path="pricing" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPricing />
          </AdminProtectedRoute>
        } />
        <Route path="contacts" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminContacts />
          </AdminProtectedRoute>
        } />
        <Route path="analytics" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminAnalytics />
          </AdminProtectedRoute>
        } />
        <Route path="crm" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminCRM />
          </AdminProtectedRoute>
        } />
        <Route path="crm/patient/:id" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPatientProfile />
          </AdminProtectedRoute>
        } />
        <Route path="email-templates" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminEmailTemplates />
          </AdminProtectedRoute>
        } />
        {/* Admin-only routes */}
        <Route path="users" element={
          <AdminProtectedRoute requiredRole="admin">
            <AdminUsers />
          </AdminProtectedRoute>
        } />
        <Route path="security" element={
          <AdminProtectedRoute requiredRole="admin">
            <AdminSecurity />
          </AdminProtectedRoute>
        } />
        <Route path="code-settings" element={
          <AdminProtectedRoute requiredRole="admin">
            <AdminCodeSettings />
          </AdminProtectedRoute>
        } />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
