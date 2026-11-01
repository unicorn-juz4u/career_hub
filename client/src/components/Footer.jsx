// client/src/components/Footer.jsx
// Standard clean footer with role navigation and copyright
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Career<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A modern, full-stack Job Portal connecting job seekers with leading employers.
              Built with React, Express, MongoDB, and Tailwind CSS.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              For Job Seekers
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Seeker Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Browse Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              For Employers
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Post a Job (Free First Post)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Employer Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerHub Job Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React &amp; Express
          </p>
        </div>
      </div>
    </footer>
  );
}
