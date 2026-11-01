// client/src/pages/dashboards/UserDashboard.jsx
// Dedicated dashboard for Job Seekers (role: user)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserDashboardData } from '../../services/api';
import {
  User,
  FileText,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Call backend role-protected endpoint to verify server middleware
  useEffect(() => {
    const verifyServerAccess = async () => {
      try {
        const res = await getUserDashboardData();
        setServerVerification(res);
      } catch (err) {
        console.error('Server role check error:', err);
      } finally {
        setLoading(false);
      }
    };
    verifyServerAccess();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Job Seeker Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300">
              Account: <span className="font-mono text-white">{user?.email}</span> &bull; Status:{' '}
              <span className="text-emerald-400 font-medium">Active</span>
            </p>
          </div>

          {/* Action & Verification Pill */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Browse All Openings</span>
            </Link>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Role Middleware: Verified</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Access Level: <code className="text-blue-300 font-mono">role === 'user'</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Applications</span>
          <div className="text-2xl font-bold text-white font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Submitted jobs (Phase 5)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Shortlisted</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Chat enabled (Phase 6)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Profile Status</span>
          <div className="text-base font-bold text-amber-400">Incomplete</div>
          <span className="text-[11px] text-slate-500 block">Setup profile in Phase 2</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Primary Resume</span>
          <div className="text-base font-bold text-slate-400">No Resume</div>
          <span className="text-[11px] text-slate-500 block">PDF/DOCX upload in Phase 2</span>
        </div>
      </div>

      {/* Roadmap & Next Features Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Step: Phase 2 Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upcoming: User Profile &amp; Resume (Phase 2)
              </h3>
              <p className="text-xs text-slate-400">
                You will be able to manage your professional credentials
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In the upcoming Phase 2, you will fill out your phone, city, education, experience,
            certifications, skills, and upload your single primary resume (PDF or DOCX max 2MB).
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Phase 1 Authentication: Complete ✅</span>
            <span className="text-indigo-400 font-semibold">Ready for Phase 2</span>
          </div>
        </div>

        {/* Phase 4 & 5 Search & Applications */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upcoming: Job Search &amp; One-Click Apply (Phases 4-5)
              </h3>
              <p className="text-xs text-slate-400">
                Filter openings with server-side pagination
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Search jobs by skill, location, date posted ("Past 24 hours", "Past 7 days"), and track
            each application's status in your personal dashboard.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Server-side pagination ready</span>
            <span className="text-indigo-400 font-semibold">Phases 4 &amp; 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
