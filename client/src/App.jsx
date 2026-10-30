import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Common
import AppLayout from './components/common/AppLayout';

// Public Pages
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Designer Pages
import Dashboard from './pages/designer/Dashboard';
import Clients from './pages/designer/Clients';
import Requests from './pages/designer/Requests';
import Projects from './pages/designer/Projects';
import ArtworkReview from './pages/designer/ArtworkReview';
import Financials from './pages/designer/Financials';

// Client Portal Pages
import ClientPortal from './pages/client/ClientPortal';

// Protected Route Guard
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500">Checking CreativeDesk session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Designer Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/artwork" element={<ArtworkReview />} />
            <Route path="/financials" element={<Financials />} />

            {/* Client Portal Routes */}
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/portal/submit" element={<ClientPortal />} />
            <Route path="/portal/projects" element={<ClientPortal />} />
            <Route path="/portal/artwork" element={<ClientPortal />} />
            <Route path="/portal/financials" element={<ClientPortal />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
