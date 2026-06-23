import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DMLogin from '../admin/pages/DMLogin';
import DMDashboard from '../admin/pages/DMDashboard';
import { DMAuthProvider, useDMAuth } from '../context/DMAuthContext';

function DMProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useDMAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/dm/login" replace />;

  return <>{children}</>;
}

export default function DMApp() {
  return (
    <DMAuthProvider>
      <Routes>
        <Route path="login" element={<DMLogin />} />
        <Route
          path="dashboard"
          element={
            <DMProtectedRoute>
              <DMDashboard />
            </DMProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </DMAuthProvider>
  );
}
