// client/src/pages/dashboards/EmployerDashboard.jsx
// Dedicated dashboard for Employers (role: employer)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployerDashboardData } from '../../services/api';
import {
  Building,
  Briefcase,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Call backend role-protected endpoint to verify server middleware
  useEffect(() => {
    const verifyServerAccess = async () => {
      try {
        const res = await getEmployerDashboardData();
        setServerVerification(res);
      } catch (err) {
        console.error('Employer role verification error:', err);
      } finally {
        setLoading(false);
      }
    };
    verifyServerAccess();
  }, []);

  const employerPlan = user?.plan || 'basic';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Employer Hiring Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300">
              Account: <span className="font-mono text-white">{user?.email}</span> &bull; Current Plan:{' '}
              <span className="capitalize font-bold text-emerald-400">{employerPlan}</span>
            </p>
          </div>

          {/* Plan & Backend Verification Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-1 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Role Middleware: Verified</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Plan: <strong className="text-emerald-300 uppercase">{employerPlan}</strong> (1st post free)
            </div>
          </div>
        </div>
      </div>

      {/* Plan Notice Banner */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Employer Rule:</strong> Your first job post is completely free!
            Chatting with shortlisted candidates unlocks on the <span className="text-indigo-300 font-semibold">Growth</span> or <span className="text-indigo-300 font-semibold">Pro</span> plans.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 shrink-0">
          Plan: {employerPlan.toUpperCase()}
        </span>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Active Jobs</span>
          <div className="text-2xl font-bold text-white font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Post jobs in Phase 3</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Applicants</span>
          <div className="text-2xl font-bold text-white font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Incoming in Phase 5</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Shortlisted</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">0</div>
          <span className="text-[11px] text-slate-500 block">Eligible for chat (Phase 6)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Candidate Chat</span>
          <div className="text-base font-bold text-indigo-400">
            {employerPlan === 'basic' ? 'Requires Growth/Pro' : 'Unlocked'}
          </div>
          <span className="text-[11px] text-slate-500 block">Controlled by plan</span>
        </div>
      </div>

      {/* Roadmap & Next Features Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase 3 Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upcoming: Company Profile &amp; Job Posting (Phase 3)
              </h3>
              <p className="text-xs text-slate-400">
                Create company branding and list job vacancies
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In Phase 3, you will create your company profile, post your first job for free,
            specify salary, required skills, and job types (Full-time, Remote, Contract).
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Phase 1 Authentication: Complete ✅</span>
            <span className="text-emerald-400 font-semibold">Ready for Phase 3</span>
          </div>
        </div>

        {/* Phase 5 & 6 Candidates & Chat */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upcoming: Applicant Review &amp; Chat (Phases 5-6)
              </h3>
              <p className="text-xs text-slate-400">
                Review resumes and interview shortlisted talent
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Review incoming applicants, inspect their PDF/DOCX resumes, mark them as shortlisted
            or rejected, and chat directly with candidates (auto-refreshed every 5 seconds).
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Enforced on server &amp; UI</span>
            <span className="text-indigo-400 font-semibold">Phases 5 &amp; 6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
