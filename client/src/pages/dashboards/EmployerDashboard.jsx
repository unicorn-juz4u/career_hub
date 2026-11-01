// client/src/pages/dashboards/EmployerDashboard.jsx
// Dedicated dashboard for Employers (role: employer) with real job CRUD and statistics
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getEmployerDashboardData,
  getMyJobs,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
} from '../../services/api';
import AddJobModal from '../../components/AddJobModal';
import {
  Building,
  Briefcase,
  Users,
  MessageSquare,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Power,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Clock,
  MapPin,
  Laptop,
  Wifi,
  Database,
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, closedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [isInMemory, setIsInMemory] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Action Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState(null); // { type: 'delete' | 'toggle', job }

  const employerPlan = user?.plan || 'basic';

  // Fetch employer data and jobs list
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Verify server middleware
      const [verificationRes, jobsRes] = await Promise.all([
        getEmployerDashboardData().catch((err) => {
          console.warn('Role verification notice:', err.message);
          return null;
        }),
        getMyJobs().catch((err) => {
          console.error('Failed to fetch employer jobs:', err);
          return { jobs: [], stats: { totalJobs: 0, activeJobs: 0, closedJobs: 0 } };
        }),
      ]);

      if (verificationRes) setServerVerification(verificationRes);

      if (jobsRes && jobsRes.jobs) {
        setJobs(jobsRes.jobs);
        setStats(
          jobsRes.stats || {
            totalJobs: jobsRes.jobs.length,
            activeJobs: jobsRes.jobs.filter((j) => j.status === 'open').length,
            closedJobs: jobsRes.jobs.filter((j) => j.status === 'closed').length,
          }
        );
        setIsInMemory(Boolean(jobsRes.isInMemory));
      }
    } catch (err) {
      console.error('EmployerDashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Flash feedback toast helper
  const showFeedback = (text, type = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Open modal for new job
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Edit)
  const handleSubmitJob = async (jobData) => {
    if (editingJob) {
      const jobId = editingJob._id || editingJob.id;
      const res = await updateJob(jobId, jobData);
      showFeedback('Job listing updated successfully!');
    } else {
      const res = await createJob(jobData);
      showFeedback('New job listing published successfully!');
    }
    await loadDashboardData();
  };

  // Handle Toggle Status (Open / Closed)
  const handleToggleStatus = async (job) => {
    try {
      const jobId = job._id || job.id;
      const targetStatus = job.status === 'open' ? 'closed' : 'open';
      await toggleJobStatus(jobId, targetStatus);
      showFeedback(`Job listing is now marked as ${targetStatus.toUpperCase()}.`);
      setConfirmDialog(null);
      await loadDashboardData();
    } catch (err) {
      showFeedback(err?.message || 'Failed to update job status.', 'error');
    }
  };

  // Handle Delete
  const handleDeleteJob = async (job) => {
    try {
      const jobId = job._id || job.id;
      await deleteJob(jobId);
      showFeedback('Job listing has been permanently deleted.');
      setConfirmDialog(null);
      await loadDashboardData();
    } catch (err) {
      showFeedback(err?.message || 'Failed to delete job.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm transition-all shadow-lg ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

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

          {/* Action & Verification Pill */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job Listing</span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Backend Role Verified</span>
              </div>
              {isInMemory && (
                <div className="text-amber-400 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Session In-Memory Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row with REAL Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Total Postings</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {loading ? '...' : stats.totalJobs}
          </div>
          <span className="text-[11px] text-slate-500 block">Created by your account</span>
        </div>

        {/* Active Jobs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Active (Open)</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {loading ? '...' : stats.activeJobs}
          </div>
          <span className="text-[11px] text-slate-500 block">Visible to job seekers</span>
        </div>

        {/* Closed Jobs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Closed / Inactive</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-400 font-mono">
            {loading ? '...' : stats.closedJobs}
          </div>
          <span className="text-[11px] text-slate-500 block">Hidden from public</span>
        </div>

        {/* Plan / Chat Access */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Candidate Chat</span>
          <div className="text-sm sm:text-base font-bold text-indigo-400">
            {employerPlan === 'basic' ? 'Requires Growth/Pro' : 'Unlocked (Phase 6)'}
          </div>
          <span className="text-[11px] text-slate-500 block">Controlled by plan tier</span>
        </div>
      </div>

      {/* Main Job Management Section */}
      <div className="glass-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>Your Job Postings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your company's active vacancies, edit requirements, or close filled positions.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Job</span>
          </button>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3.5">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Jobs Posted Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your first job listing is 100% free! Publish a role to start attracting passionate candidates.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              Post Your First Job Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Job Title &amp; Company</th>
                  <th className="py-3 px-3">Location &amp; Mode</th>
                  <th className="py-3 px-3">Job Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date Posted</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {jobs.map((job) => {
                  const jobId = job._id || job.id;
                  const isOpen = job.status === 'open';
                  const dateStr = job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr
                      key={jobId}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Title & Company */}
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/jobs/${jobId}`}
                          className="font-bold text-white group-hover:text-emerald-400 transition-colors hover:underline block truncate max-w-xs"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{job.company}</span>
                      </td>

                      {/* Location & Work Mode */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{job.location}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize block">
                          Mode: {job.workMode || 'onsite'}
                        </span>
                      </td>

                      {/* Job Type */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {job.jobType || job.type || 'Full-time'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Closed
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View public details */}
                          <Link
                            to={`/jobs/${jobId}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Public Details"
                            aria-label="View Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Job */}
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Listing"
                            aria-label="Edit Job"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Close/Reopen Toggle */}
                          <button
                            onClick={() => setConfirmDialog({ type: 'toggle', job })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isOpen
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                            }`}
                            title={isOpen ? 'Close listing' : 'Reopen listing'}
                            aria-label={isOpen ? 'Close Job' : 'Reopen Job'}
                          >
                            {isOpen ? (
                              <Power className="w-3.5 h-3.5" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Job */}
                          <button
                            onClick={() => setConfirmDialog({ type: 'delete', job })}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="Delete listing"
                            aria-label="Delete Job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmDialog.type === 'delete'
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {confirmDialog.type === 'delete' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <Power className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-base font-bold text-white">
                {confirmDialog.type === 'delete'
                  ? 'Delete Job Listing?'
                  : confirmDialog.job.status === 'open'
                  ? 'Close Job Listing?'
                  : 'Reopen Job Listing?'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.type === 'delete'
                ? `Are you sure you want to permanently remove "${confirmDialog.job.title}"? This action cannot be undone.`
                : confirmDialog.job.status === 'open'
                ? `Close "${confirmDialog.job.title}"? It will be hidden from public search until you reopen it.`
                : `Reopen "${confirmDialog.job.title}" to make it discoverable for job seekers again?`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.type === 'delete') {
                    handleDeleteJob(confirmDialog.job);
                  } else {
                    handleToggleStatus(confirmDialog.job);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all ${
                  confirmDialog.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitJob={handleSubmitJob}
        initialData={editingJob}
      />
    </div>
  );
}
