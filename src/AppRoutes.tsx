
import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AboutMe = lazy(() => import("./pages/AboutMe"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LipModeling = lazy(() => import("./pages/LipModeling"));
const AntiAgingTherapies = lazy(() => import("./pages/AntiAgingTherapies"));
const Sculptra = lazy(() => import("./pages/Sculptra"));

// Admin imports (code-split)
const AdminWrapper = lazy(() => import("./pages/admin/AdminWrapper"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const AdminPostEditor = lazy(() => import("./pages/admin/AdminPostEditor"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminCodeSettings = lazy(() => import("./pages/admin/AdminCodeSettings"));
const AdminCRM = lazy(() => import("./pages/admin/AdminCRM"));
const AdminPatientProfile = lazy(() => import("./pages/admin/AdminPatientProfile"));
const AdminPatientEdit = lazy(() => import("./pages/admin/AdminPatientEdit"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/AdminEmailTemplates"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminAppointmentNew = lazy(() => import("./pages/admin/AdminAppointmentNew"));

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
      <Route path="/sculptra" element={<Sculptra />} />
      
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
        <Route path="crm/patient/:id/edit" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminPatientEdit />
          </AdminProtectedRoute>
        } />
        <Route path="appointments" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminAppointments />
          </AdminProtectedRoute>
        } />
        <Route path="appointments/new" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminAppointmentNew />
          </AdminProtectedRoute>
        } />
        <Route path="appointments/new/:patientId" element={
          <AdminProtectedRoute requiredRole="editor">
            <AdminAppointmentNew />
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
