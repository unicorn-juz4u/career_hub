// client/src/App.jsx
// Main application component with React Router and Role-Based Protected Routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation & Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/dashboards/UserDashboard';
import EmployerDashboard from './pages/dashboards/EmployerDashboard';
import CompanyDashboard from './pages/dashboards/CompanyDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import NotFound from './pages/NotFound';

// Helper component to redirect /dashboard to the specific role dashboard
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'employer') return <Navigate to="/dashboard/employer" replace />;
  return <Navigate to="/dashboard/user" replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Route View */}
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<CompanyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* General Dashboard Redirection */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* 1. Job Seeker Protected Dashboard */}
              <Route
                path="/dashboard/user"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 2. Employer Protected Dashboard */}
              <Route
                path="/dashboard/employer"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 2b. Employer Protected Company Branding Dashboard */}
              <Route
                path="/dashboard/company"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 3. Administrator Protected Dashboard */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
