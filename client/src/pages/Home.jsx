// client/src/pages/Home.jsx
// Main public homepage welcoming job seekers and employers
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  Building,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 text-center pt-8 pb-12">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack Job Portal Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Find Your Dream Job or{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Hire Top Talent
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one portal connecting passionate job seekers with verified employers.
          Streamlined applications, resume management, and direct messaging.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/jobs"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Job Openings</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to={
                user.role === 'admin'
                  ? '/dashboard/admin'
                  : user.role === 'employer'
                  ? '/dashboard/employer'
                  : '/dashboard/user'
              }
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 3 Dedicated Role Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Built from the ground up with specialized workflows for candidates, recruiters, and admins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Job Seeker Pillar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Role: User
              </span>
              <h3 className="text-lg font-bold text-white mt-1">For Job Seekers</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a comprehensive profile, upload your single primary resume (PDF/DOCX),
              apply to active jobs, and track your application status.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Single resume management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>One-click job applications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Direct chat when shortlisted</span>
              </li>
            </ul>
          </div>

          {/* 2. Employer Pillar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Role: Employer
              </span>
              <h3 className="text-lg font-bold text-white mt-1">For Employers</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build your company profile, post open roles (first post is free!), review candidate
              resumes, and shortlist promising talent.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>First job post 100% free</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Applicant management &amp; resume viewing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tiered plans: Basic, Growth &amp; Pro</span>
              </li>
            </ul>
          </div>

          {/* 3. Admin Pillar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Role: Admin
              </span>
              <h3 className="text-lg font-bold text-white mt-1">For App Owners</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive governance. Oversee all platform users, manage employer subscription plans,
              suspend accounts, and view platform analytics.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Created securely via seed script</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>User &amp; employer management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Manual plan upgrades</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Demo Credentials Guide Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                📋 Demo Test Credentials (Phase 1)
              </h3>
              <p className="text-xs text-slate-400">
                You can use these pre-seeded accounts to quickly test each role and dashboard.
              </p>
            </div>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Test Sign In →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-blue-400">💼 Job Seeker</div>
              <div className="text-slate-300">alex@example.com</div>
              <div className="text-slate-500">pass: user123</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-400">🏢 Employer</div>
              <div className="text-slate-300">employer@techcorp.com</div>
              <div className="text-slate-500">pass: employer123</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-purple-400">👑 Admin</div>
              <div className="text-slate-300">admin@jobportal.com</div>
              <div className="text-slate-500">pass: admin123</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
