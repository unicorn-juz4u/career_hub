// client/src/components/Navbar.jsx
// Main navigation bar with role-aware profile menu and responsive mobile toggle
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Building,
  Shield,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Get user's role specific dashboard URL
  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'employer') return '/dashboard/employer';
    return '/dashboard/user';
  };

  // Render role badge with distinct colors
  const renderRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    if (user.role === 'employer') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Building className="w-3 h-3" />
          Employer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <User className="w-3 h-3" />
        Job Seeker
      </span>
    );
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Career<span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Home
            </Link>

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Role Badge */}
                {renderRoleBadge()}

                {/* Dashboard Link */}
                <Link
                  to={getDashboardUrl()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>

                {/* User Name & Sign Out */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                  <span className="text-sm font-semibold text-white">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Guest Actions (Login & Register) */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="px-3 py-2 rounded-lg bg-slate-800/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {user?.name}
                  </span>
                  {renderRoleBadge()}
                </div>
                <Link
                  to={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
