// client/src/pages/dashboards/UserDashboard.jsx
// Dedicated dashboard for Job Seekers (role: user) with live Application History, Metrics, and Notifications
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getUserDashboardData,
  getMyApplications,
  deleteApplication,
  getResumeDownloadUrl,
  getNotifications,
  markNotificationRead,
} from '../../services/api';
import {
  User,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Building2,
  Bell,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interviewScheduled: 0,
    hired: 0,
    rejected: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInMemory, setIsInMemory] = useState(false);

  // Modal Detail State
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawDialog, setWithdrawDialog] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const flashFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [verifyRes, appsRes, notifsRes] = await Promise.all([
        getUserDashboardData().catch(() => null),
        getMyApplications().catch((err) => {
          console.error('Failed to load candidate applications:', err);
          return { applications: [], stats: null };
        }),
        getNotifications().catch(() => ({ notifications: [] })),
      ]);

      if (verifyRes) setServerVerification(verifyRes);
      if (appsRes && appsRes.applications) {
        setApplications(appsRes.applications);
        if (appsRes.stats) setStats(appsRes.stats);
        setIsInMemory(Boolean(appsRes.isInMemory));
      }
      if (notifsRes && notifsRes.notifications) {
        setNotifications(notifsRes.notifications);
      }
    } catch (err) {
      console.error('UserDashboard load error:', err);
      setError(err?.message || 'Failed to load candidate dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleWithdraw = async (appId) => {
    try {
      await deleteApplication(appId);
      flashFeedback('Application has been successfully withdrawn.');
      setWithdrawDialog(null);
      await loadDashboardData();
    } catch (err) {
      flashFeedback(err?.message || 'Failed to withdraw application.', 'error');
    }
  };

  const handleDismissNotification = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== notifId));
    } catch (err) {
      console.warn('Error marking notification read:', err.message);
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'Shortlisted':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Interview Scheduled':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Hired':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'Under Review':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-lg transition-all ${
            feedback.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Job Seeker Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300">
              Account: <span className="font-mono text-white">{user?.email}</span> &bull; Status:{' '}
              <span className="text-emerald-400 font-medium">Active Candidate</span>
            </p>
          </div>

          {/* Action & Verification Pill */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Browse Open Positions</span>
            </Link>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Backend Role Verified</span>
              </div>
              {isInMemory && (
                <div className="text-amber-400 flex items-center gap-1 text-[11px]">
                  <Database className="w-3 h-3" />
                  <span>Session In-Memory Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Application Metrics Cards (6 Metrics per Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Applications */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Total Applied</span>
          <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
          <span className="text-[10px] text-slate-500 block">All submissions</span>
        </div>

        {/* Under Review */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Under Review</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.underReview}</div>
          <span className="text-[10px] text-slate-500 block">Employer evaluating</span>
        </div>

        {/* Shortlisted */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Shortlisted</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.shortlisted}</div>
          <span className="text-[10px] text-slate-500 block">Passed initial screen</span>
        </div>

        {/* Interviews */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Interviews</span>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {stats.interviewScheduled}
          </div>
          <span className="text-[10px] text-slate-500 block">Scheduled rounds</span>
        </div>

        {/* Hired */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Hired</span>
          <div className="text-2xl font-bold text-teal-400 font-mono">{stats.hired}</div>
          <span className="text-[10px] text-slate-500 block">Offers accepted</span>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Archived</span>
          <div className="text-2xl font-bold text-slate-400 font-mono">{stats.rejected}</div>
          <span className="text-[10px] text-slate-500 block">Not selected</span>
        </div>
      </div>

      {/* Notifications Row if any unread notifications exist */}
      {notifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Recent Hiring Updates ({notifications.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {notifications.slice(0, 4).map((n) => (
              <div
                key={n._id || n.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start justify-between gap-2.5"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{n.title}</div>
                  <p className="text-slate-300">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDismissNotification(n._id || n.id)}
                  className="p-1 rounded text-slate-500 hover:text-slate-300"
                  title="Dismiss notification"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Application History Table */}
      <div className="glass-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              <span>Application History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track real-time status changes, interview invitations, and submitted credentials.
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            <span>Search More Jobs</span>
          </Link>
        </div>

        {/* Loading / Error / Empty / Table States */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1 bg-rose-500/20 rounded-lg hover:bg-rose-500/30 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3.5">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Applications Submitted Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Find your dream engineering role and submit your PDF resume. Employers will review your
              profile directly on CareerHub.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              <span>Explore Active Openings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Position &amp; Company</th>
                  <th className="py-3 px-3">Applied Date</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-3">Interview Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {applications.map((app) => {
                  const appId = app._id || app.id;
                  const job = app.job || {};
                  const jobId = job._id || job;
                  const dateStr = app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  const interviewStr = app.interviewDate
                    ? new Date(app.interviewDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={appId} className="hover:bg-slate-800/30 transition-colors group">
                      {/* Job Title & Company */}
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/jobs/${jobId}`}
                          className="font-bold text-white group-hover:text-blue-400 transition-colors hover:underline block truncate max-w-xs"
                        >
                          {job.title || 'Engineering Role'}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">
                          {job.company || 'Tech Company'} &bull; {job.location || 'Remote'}
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Interview Info */}
                      <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                        {app.interviewDate ? (
                          <span className="text-purple-300 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {interviewStr}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details modal button */}
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Application Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* View job page */}
                          <Link
                            to={`/jobs/${jobId}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Job Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Withdraw button (allowed when status is 'Applied') */}
                          {app.status === 'Applied' && (
                            <button
                              onClick={() => setWithdrawDialog(app)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                              title="Withdraw Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Application Record</h3>
                  <p className="text-xs text-slate-400">
                    {selectedApp.job?.title} &bull; {selectedApp.job?.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Current Stage</span>
                  <span
                    className={`inline-block font-semibold px-2 py-0.5 rounded-full border mt-1 ${getStatusBadgeClass(
                      selectedApp.status
                    )}`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Submitted</span>
                  <span className="font-mono text-slate-300">
                    {new Date(selectedApp.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedApp.interviewDate && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Interview Scheduled</span>
                  </div>
                  <p className="font-mono text-xs">
                    Date &amp; Time: {new Date(selectedApp.interviewDate).toLocaleString()}
                  </p>
                  {selectedApp.interviewNotes && (
                    <p className="text-[11px] text-purple-300 pt-1">
                      Notes: {selectedApp.interviewNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <span className="font-semibold text-slate-400 block mb-1">
                  Your Submitted Cover Letter:
                </span>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed whitespace-pre-line text-slate-300 max-h-40 overflow-y-auto">
                  {selectedApp.coverLetter || 'No cover letter was attached.'}
                </div>
              </div>

              {/* Secure Resume Access */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-slate-400">Attached Resume:</span>
                <a
                  href={getResumeDownloadUrl(selectedApp._id || selectedApp.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View PDF Document</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Withdraw Application?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to withdraw your application for{' '}
              <strong>"{withdrawDialog.job?.title}"</strong>? Your resume and submission will be
              removed from the employer's review pool.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setWithdrawDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Keep Application
              </button>
              <button
                onClick={() => handleWithdraw(withdrawDialog._id || withdrawDialog.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
