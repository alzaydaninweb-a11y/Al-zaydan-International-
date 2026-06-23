import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategories from './pages/AdminCategories';
import AdminHomepage from './pages/AdminHomepage';
import AdminOrders from './pages/AdminOrders';
import AdminVideos from './pages/AdminVideos';
import AdminBlogs from './pages/AdminBlogs';
import AdminBlogForm from './pages/AdminBlogForm';
import AdminSettings from './pages/AdminSettings';
import AdminCustomerSupport from './pages/AdminCustomerSupport';
import AdminExpertProfile from './pages/AdminExpertProfile';
import AdminMarketing from './pages/AdminMarketing';
import AdminSitemap from './pages/AdminSitemap';
import AdminSEODashboard from './pages/AdminSEODashboard';
import AdminSEOBulk from './pages/AdminSEOBulk';
import AdminRedirects from './pages/AdminRedirects';
import AdminPageSEO from './pages/AdminPageSEO';

function AdminRoutes() {
  const { isAuthenticated, loading } = useAdminAuth();

  // Wait for Firebase to resolve auth state (prevents login flash on refresh)
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(140deg, #0a0f1e 0%, #0f172a 40%, #1a1040 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(99,102,241,0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#334155', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
          Authenticating…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"          element={<AdminDashboard />} />
        <Route path="products"           element={<AdminProducts />} />
        <Route path="products/new"       element={<AdminProductForm />} />
        <Route path="products/edit/:id"  element={<AdminProductForm />} />
        <Route path="categories"         element={<AdminCategories />} />
        <Route path="homepage"           element={<AdminHomepage />} />
        <Route path="orders"             element={<AdminOrders />} />
        <Route path="videos"             element={<AdminVideos />} />
        <Route path="blogs"              element={<AdminBlogs />} />
        <Route path="blogs/new"          element={<AdminBlogForm />} />
        <Route path="blogs/edit/:id"     element={<AdminBlogForm />} />
        <Route path="support"            element={<AdminCustomerSupport />} />
        <Route path="expert"             element={<AdminExpertProfile />} />
        <Route path="marketing"          element={<AdminMarketing />} />
        <Route path="sitemap"            element={<AdminSitemap />} />
        <Route path="seo-dashboard"      element={<AdminSEODashboard />} />
        <Route path="seo-bulk"           element={<AdminSEOBulk />} />
        <Route path="redirects"          element={<AdminRedirects />} />
        <Route path="page-seo"           element={<AdminPageSEO />} />
        <Route path="settings"           element={<AdminSettings />} />
        <Route path="*"                  element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  );
}
