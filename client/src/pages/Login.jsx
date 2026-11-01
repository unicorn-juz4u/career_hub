// client/src/pages/Login.jsx
// Sign-in page supporting job seekers, employers, and administrators
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedInUser = await login(email, password);

      // Check if user was redirected from a protected page
      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
        return;
      }

      // Otherwise redirect to the specific role dashboard
      if (loggedInUser.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (loggedInUser.role === 'employer') {
        navigate('/dashboard/employer');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing demo credentials
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
            Sign In to CareerHub
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Access your job seeker, employer, or administrator portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Buttons for Convenient Testing */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 mb-2 text-center uppercase tracking-wider">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('alex@example.com', 'user123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium transition-colors"
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => fillDemo('employer@techcorp.com', 'employer123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
            >
              Employer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@jobportal.com', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 font-medium transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
