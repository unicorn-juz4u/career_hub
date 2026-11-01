// client/src/pages/dashboards/EmployerDashboard.jsx
// Dedicated dashboard for Employers (role: employer) with Job CRUD and Complete Candidate Application Management
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
  getEmployerApplications,
  updateApplicationStatus,
  getResumeDownloadUrl,
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
  Calendar,
  FileText,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Database,
  Filter,
  Eye,
  Send,
  X,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobStats, setJobStats] = useState({ totalJobs: 0, activeJobs: 0, closedJobs: 0 });

  // Candidate Applications State
  const [applications, setApplications] = useState([]);
  const [applicantStats, setApplicantStats] = useState({
    totalApplicants: 0,
    newApplications: 0,
    underReview: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
    rejected: 0,
  });

  // Filter state for candidates
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [isInMemory, setIsInMemory] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modals State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingCandidateApp, setViewingCandidateApp] = useState(null);
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: '', notes: '' });

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState(null); // { type: 'deleteJob' | 'toggleJob' | 'statusChange', data }

  const employerPlan = user?.plan || 'basic';

  // Fetch all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [verifyRes, jobsRes, appsRes] = await Promise.all([
        getEmployerDashboardData().catch(() => null),
        getMyJobs().catch(() => ({ jobs: [], stats: { totalJobs: 0, activeJobs: 0, closedJobs: 0 } })),
        getEmployerApplications().catch(() => ({ applications: [], stats: null })),
      ]);

      if (verifyRes) setServerVerification(verifyRes);

      if (jobsRes && jobsRes.jobs) {
        setJobs(jobsRes.jobs);
        setJobStats(
          jobsRes.stats || {
            totalJobs: jobsRes.jobs.length,
            activeJobs: jobsRes.jobs.filter((j) => j.status === 'open').length,
            closedJobs: jobsRes.jobs.filter((j) => j.status === 'closed').length,
          }
        );
        setIsInMemory(Boolean(jobsRes.isInMemory));
      }

      if (appsRes && appsRes.applications) {
        setApplications(appsRes.applications);
        if (appsRes.stats) {
          setApplicantStats(appsRes.stats);
        }
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

  const showFeedback = (text, type = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Job Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleSubmitJob = async (jobData) => {
    if (editingJob) {
      const jobId = editingJob._id || editingJob.id;
      await updateJob(jobId, jobData);
      showFeedback('Job listing updated successfully!');
    } else {
      await createJob(jobData);
      showFeedback('New job listing published successfully!');
    }
    await loadDashboardData();
  };

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

  // Candidate Status Update Handlers
  const handleQuickStatusUpdate = async (appId, newStatus, extra = {}) => {
    try {
      await updateApplicationStatus(appId, { status: newStatus, ...extra });
      showFeedback(`Candidate status updated to "${newStatus}".`);
      setConfirmDialog(null);
      if (interviewModalApp) setInterviewModalApp(null);
      if (viewingCandidateApp) {
        setViewingCandidateApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      await loadDashboardData();
    } catch (err) {
      showFeedback(err?.message || 'Failed to update candidate status.', 'error');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewForm.date) {
      alert('Please choose an interview date and time.');
      return;
    }
    const appId = interviewModalApp._id || interviewModalApp.id;
    await handleQuickStatusUpdate(appId, 'Interview Scheduled', {
      interviewDate: new Date(interviewForm.date).toISOString(),
      interviewNotes: interviewForm.notes,
    });
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const jobMatch =
      selectedJobFilter === 'All' ||
      String(app.job?._id || app.job) === String(selectedJobFilter);
    const statusMatch =
      selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
    return jobMatch && statusMatch;
  });

  const getStatusBadge = (s) => {
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
      {/* Feedback Toast */}
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
              Company Recruiter &bull; Current Plan:{' '}
              <span className="capitalize font-bold text-emerald-400">{employerPlan}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <Link
                to="/dashboard/company"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Company Profile &amp; Branding</span>
              </Link>

              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Job Listing</span>
              </button>
            </div>

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

      {/* Applicant Metrics Row (Section 6) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Applicant Pipeline Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Total Applicants */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Total Applicants</span>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : applicantStats.totalApplicants}
            </div>
            <span className="text-[10px] text-slate-500 block">All incoming candidates</span>
          </div>

          {/* New / Under Review */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block font-medium">New Submissions</span>
            <div className="text-2xl font-bold text-blue-400 font-mono">
              {loading ? '...' : applicantStats.newApplications}
            </div>
            <span className="text-[10px] text-slate-500 block">Pending initial review</span>
          </div>

          {/* Shortlisted */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Shortlisted</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {loading ? '...' : applicantStats.shortlisted}
            </div>
            <span className="text-[10px] text-slate-500 block">Qualified candidates</span>
          </div>

          {/* Interviews */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Interviews</span>
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {loading ? '...' : applicantStats.interviews}
            </div>
            <span className="text-[10px] text-slate-500 block">Scheduled technical screens</span>
          </div>

          {/* Hired */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Hired</span>
            <div className="text-2xl font-bold text-teal-400 font-mono">
              {loading ? '...' : applicantStats.hired}
            </div>
            <span className="text-[10px] text-slate-500 block">Accepted offers</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: APPLICANT MANAGEMENT SECTION (Section 6) */}
      <div className="glass-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Candidate Applications &amp; Review</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review submitted PDF resumes, read cover letters, shortlist top candidates, or schedule
              interviews.
            </p>
          </div>

          {/* Filters: Job Listing and Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Job Postings</option>
              {jobs.map((j) => (
                <option key={j._id || j.id} value={j._id || j.id}>
                  {j.title}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Candidate List Table */}
        {loading ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading candidate applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Applicants Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No candidates currently match the chosen job and stage filter. When candidates apply with
              their PDF resume, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Job Applied To</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Applied</th>
                  <th className="py-3 px-3 text-right">Review &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredApplications.map((app) => {
                  const appId = app._id || app.id;
                  const candidate = app.applicant || {};
                  const job = app.job || {};

                  return (
                    <tr key={appId} className="hover:bg-slate-800/30 transition-colors">
                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{candidate.name || 'Anonymous'}</div>
                        <div className="text-[11px] text-slate-400">{candidate.email}</div>
                        {candidate.city && (
                          <span className="text-[10px] text-slate-500">{candidate.city}</span>
                        )}
                      </td>

                      {/* Job Applied To */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-indigo-300 block max-w-xs truncate">
                          {job.title}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">
                          {job.jobType || 'Full-time'} &bull; {job.workMode || 'remote'}
                        </span>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                        {app.interviewDate && (
                          <span className="block text-[10px] text-purple-300 mt-1">
                            {new Date(app.interviewDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* View Candidate Details Modal */}
                          <button
                            onClick={() => setViewingCandidateApp(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Inspect candidate credentials & cover letter"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>

                          {/* Secure Resume Access */}
                          <a
                            href={getResumeDownloadUrl(appId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                            title="Open protected PDF resume"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>

                          {/* Quick Shortlist Button */}
                          {app.status !== 'Shortlisted' && app.status !== 'Hired' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(appId, 'Shortlisted')}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                              title="Shortlist Candidate"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Schedule Interview */}
                          <button
                            onClick={() => {
                              setInterviewModalApp(app);
                              setInterviewForm({
                                date: app.interviewDate ? app.interviewDate.slice(0, 16) : '',
                                notes: app.interviewNotes || '',
                              });
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors"
                            title="Schedule Interview"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Reject Candidate with Confirmation */}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  type: 'statusChange',
                                  data: { appId, status: 'Rejected', name: candidate.name },
                                })
                              }
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                              title="Reject Application"
                            >
                              <UserX className="w-3.5 h-3.5" />
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

      {/* SECTION 2: JOB MANAGEMENT SECTION */}
      <div className="glass-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>Your Posted Job Listings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active openings, edit descriptions, close filled positions, or filter candidate
              applicants.
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

        {/* Table of Jobs */}
        {loading ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Jobs Posted Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your first job listing is 100% free! Publish a role to start receiving candidate
              applications.
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
                  <th className="py-3 px-3">Applicants</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {jobs.map((job) => {
                  const jobId = job._id || job.id;
                  const isOpen = job.status === 'open';
                  const jobApplicants = applications.filter(
                    (a) => String(a.job?._id || a.job) === String(jobId)
                  );

                  return (
                    <tr key={jobId} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/jobs/${jobId}`}
                          className="font-bold text-white group-hover:text-emerald-400 transition-colors hover:underline block truncate max-w-xs"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{job.company}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{job.location}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize block">
                          Mode: {job.workMode || 'onsite'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {job.jobType || job.type || 'Full-time'}
                        </span>
                      </td>

                      {/* Applicants Pill with quick filter action */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setSelectedJobFilter(jobId)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors"
                          title="Filter applicant table to this job"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{jobApplicants.length} Applicants</span>
                        </button>
                      </td>

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

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/jobs/${jobId}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Public Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              setConfirmDialog({ type: 'toggleJob', data: job })
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              isOpen
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                            }`}
                            title={isOpen ? 'Close listing' : 'Reopen listing'}
                          >
                            {isOpen ? (
                              <Power className="w-3.5 h-3.5" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              setConfirmDialog({ type: 'deleteJob', data: job })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="Delete listing"
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

      {/* MODAL 1: Candidate Profile & Cover Letter Modal */}
      {viewingCandidateApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg">
                  {viewingCandidateApp.applicant?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {viewingCandidateApp.applicant?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Applying for: {viewingCandidateApp.job?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCandidateApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Details */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{viewingCandidateApp.applicant?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{viewingCandidateApp.applicant?.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{viewingCandidateApp.applicant?.city || 'Location unspecified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    Applied: {new Date(viewingCandidateApp.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <span className="font-semibold text-slate-400 block mb-1">Cover Letter:</span>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed whitespace-pre-line text-slate-300 max-h-48 overflow-y-auto">
                  {viewingCandidateApp.coverLetter || 'No cover letter submitted by candidate.'}
                </div>
              </div>

              {/* Attached Resume */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Official Candidate Resume</span>
                  <span className="text-[11px] text-slate-400">
                    PDF document uploaded by applicant
                  </span>
                </div>
                <a
                  href={getResumeDownloadUrl(viewingCandidateApp._id || viewingCandidateApp.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open PDF Document</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Status Update Strip */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">Current Stage:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const appId = viewingCandidateApp._id || viewingCandidateApp.id;
                      handleQuickStatusUpdate(appId, 'Shortlisted');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => {
                      setInterviewModalApp(viewingCandidateApp);
                      setInterviewForm({ date: '', notes: '' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => {
                      const appId = viewingCandidateApp._id || viewingCandidateApp.id;
                      handleQuickStatusUpdate(appId, 'Hired');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 font-semibold"
                  >
                    Mark Hired
                  </button>
                  <button
                    onClick={() => {
                      const appId = viewingCandidateApp._id || viewingCandidateApp.id;
                      setConfirmDialog({
                        type: 'statusChange',
                        data: {
                          appId,
                          status: 'Rejected',
                          name: viewingCandidateApp.applicant?.name,
                        },
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Schedule Interview Modal */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule Interview</h3>
                  <p className="text-xs text-slate-400">
                    Candidate: {interviewModalApp.applicant?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInterviewModalApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Interview Date &amp; Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Notes / Link (e.g. Google Meet, Zoom)
                </label>
                <textarea
                  rows={3}
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  placeholder="e.g. Technical Round 1 with Lead Architect. Please join: https://meet.google.com/xyz"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300">
                The candidate will receive an immediate notification in their dashboard with the
                scheduled interview details.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/30"
                >
                  Confirm &amp; Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {confirmDialog.type === 'deleteJob'
                ? 'Delete Job Listing?'
                : confirmDialog.type === 'toggleJob'
                ? confirmDialog.data.status === 'open'
                  ? 'Close Job Listing?'
                  : 'Reopen Job Listing?'
                : 'Confirm Status Change'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.type === 'deleteJob'
                ? `Are you sure you want to delete "${confirmDialog.data.title}"? This cannot be undone.`
                : confirmDialog.type === 'toggleJob'
                ? `Toggle status for "${confirmDialog.data.title}"?`
                : `Are you sure you want to mark ${confirmDialog.data.name}'s application as ${confirmDialog.data.status}?`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.type === 'deleteJob') {
                    handleDeleteJob(confirmDialog.data);
                  } else if (confirmDialog.type === 'toggleJob') {
                    handleToggleStatus(confirmDialog.data);
                  } else if (confirmDialog.type === 'statusChange') {
                    handleQuickStatusUpdate(
                      confirmDialog.data.appId,
                      confirmDialog.data.status
                    );
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      <AddJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSubmitJob={handleSubmitJob}
        initialData={editingJob}
      />
    </div>
  );
}
