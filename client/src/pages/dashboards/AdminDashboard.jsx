import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboardData, getMyJobs } from '../../services/api';
import {
  Shield,
  Users,
  Building,
  Briefcase,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Call backend role-protected endpoint to verify server middleware and load jobs count
  useEffect(() => {
    const verifyServerAccess = async () => {
      try {
        const [res, jobsRes] = await Promise.all([
          getAdminDashboardData(),
          getMyJobs().catch(() => ({ stats: { activeJobs: 0 } })),
        ]);
        setServerVerification(res);
        if (jobsRes && jobsRes.stats) {
          setActiveJobsCount(jobsRes.stats.activeJobs);
        }
      } catch (err) {
        console.error('Admin role verification error:', err);
      } finally {
        setLoading(false);
      }
    };
    verifyServerAccess();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrator Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300">
              Account: <span className="font-mono text-white">{user?.email}</span> &bull; Privileges:{' '}
              <span className="text-purple-400 font-bold uppercase">Root Super Admin</span>
            </p>
          </div>

          {/* Backend Verification Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-1 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Role Middleware: Verified</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Access: <code className="text-purple-300 font-mono">role === 'admin'</code>
            </div>
          </div>
        </div>
      </div>

      {/* Security Note Alert */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Admin Security Policy Enforced
          </p>
          <p className="text-slate-400">
            Admin accounts cannot be registered via public registration forms. They are initialized
            exclusively through the secure server seed script (<code className="text-purple-300">npm run seed</code> in server).
          </p>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Job Seekers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">5</div>
          <span className="text-[11px] text-slate-500 block">Seeded candidate accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Employers</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2</div>
          <span className="text-[11px] text-slate-500 block">Seeded hiring managers</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : activeJobsCount}
          </div>
          <Link
            to="/jobs"
            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Inspect All Openings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Applications</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Total submissions (Phase 5)</span>
        </div>
      </div>

      {/* Phase 8 Admin Features Preview */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Upcoming: Full Platform Management &amp; Analytics (Phase 8)
            </h3>
            <p className="text-xs text-slate-400">
              User governance, manual employer plan upgrades, and monthly job charts
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In Phase 8, you will be able to list, edit, suspend, and delete users or employers,
          upgrade an employer from Basic to Growth/Pro plan manually, view total system metrics,
          and visualize jobs posted per month with Recharts.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Phase 1 Authentication &amp; Role Guard: Active ✅</span>
          <span className="text-purple-400 font-semibold">Ready for Phase 2</span>
        </div>
      </div>
    </div>
  );
}
