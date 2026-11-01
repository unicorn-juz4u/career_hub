// client/src/pages/JobDetails.jsx
// Detailed Job view displaying comprehensive specifications, employer profile, and live Job Application flow
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobById, submitApplication, getMyApplications } from '../services/api';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Mail,
  Wifi,
  Laptop,
  AlertCircle,
  Sparkles,
  Upload,
  FileText,
  X,
  Check,
  Send,
  UserCheck,
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application state
  const [existingApplication, setExistingApplication] = useState(null);
  const [checkingApp, setCheckingApp] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Application form state
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch job details and check existing application
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getJobById(id);
        if (res && res.success && res.job) {
          setJob(res.job);
        } else {
          throw new Error(res?.message || 'Job listing not found');
        }
      } catch (err) {
        console.error('JobDetails load error:', err);
        setError(err.message || 'Job listing could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Check if candidate already applied to this position
  useEffect(() => {
    const checkUserApplication = async () => {
      if (!isAuthenticated || !user || user.role !== 'user') return;
      try {
        setCheckingApp(true);
        const res = await getMyApplications();
        if (res && res.applications) {
          const matched = res.applications.find(
            (app) => String(app.job?._id || app.job) === String(id)
          );
          if (matched) {
            setExistingApplication(matched);
          }
        }
      } catch (err) {
        console.warn('Check application notice:', err.message);
      } finally {
        setCheckingApp(false);
      }
    };

    checkUserApplication();
  }, [id, isAuthenticated, user]);

  // Handle Resume File Selection with PDF validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplyError('');
    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setApplyError('Only PDF documents (.pdf) are accepted.');
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setApplyError('Resume file size exceeds the 5 MB maximum limit.');
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    setResumeFile(file);
  };

  // Submit Job Application
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setApplyError('Please select your PDF resume file to submit.');
      return;
    }

    try {
      setSubmitting(true);
      setApplyError('');

      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter.trim());

      const res = await submitApplication(formData);
      if (res && res.success) {
        setApplySuccess(true);
        setExistingApplication(res.application);
        setTimeout(() => {
          setShowApplyModal(false);
          setApplySuccess(false);
        }, 2200);
      } else {
        throw new Error(res?.message || 'Failed to submit application');
      }
    } catch (err) {
      setApplyError(err?.message || 'Failed to submit application. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    if (user.role === 'employer') {
      alert('Employer accounts cannot apply to jobs. Please sign in as a Job Seeker.');
      return;
    }
    setShowApplyModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading position details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Position Not Found</h2>
        <p className="text-sm text-slate-400">
          {error || 'This job listing does not exist or has been removed.'}
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Openings</span>
        </Link>
      </div>
    );
  }

  const {
    title,
    company,
    location,
    salary = 'Competitive',
    experience = 'Mid Level',
    jobType = 'Full-time',
    workMode = 'onsite',
    skills = [],
    description,
    requirements = [],
    responsibilities = [],
    employer = {},
    status = 'open',
    createdAt,
  } = job;

  const companySlug =
    job.companySlug ||
    (company
      ? company
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : null);

  const isClosed = status === 'closed';
  const isOwnerOrAdmin =
    user && (user.role === 'admin' || String(employer?._id || employer) === String(user.id || user._id));

  const formattedCreated = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  // Status color helper for candidate
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Listings</span>
        </Link>

        {isOwnerOrAdmin && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>You manage this listing</span>
          </span>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Company Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-lg text-2xl font-extrabold text-indigo-400">
              {company ? company.charAt(0).toUpperCase() : 'C'}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {title}
                </h1>
                {isClosed && (
                  <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Closed
                  </span>
                )}
              </div>

              {/* Company & Location */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>{company}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Posted {formattedCreated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Zone: Apply Button or Already Applied Badge */}
          <div className="shrink-0 flex flex-col sm:items-end gap-2">
            {existingApplication ? (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1.5 sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-400">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Application Submitted</span>
                </div>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    existingApplication.status
                  )}`}
                >
                  Status: {existingApplication.status}
                </span>
                <Link
                  to="/dashboard/user"
                  className="block text-[11px] text-indigo-400 hover:underline"
                >
                  View in My Dashboard &rarr;
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleApplyClick}
                  disabled={isClosed}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isClosed ? 'Listing Closed' : 'Apply for this Position'}</span>
                </button>
                <span className="text-[11px] text-slate-500 text-center sm:text-right block">
                  {isClosed ? 'Applications no longer accepted' : 'PDF Resume Required &bull; Max 5MB'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Job Type</span>
            <span className="text-sm font-bold text-white capitalize">{jobType}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Work Mode</span>
            <span className="text-sm font-bold text-indigo-400 capitalize flex items-center gap-1">
              {workMode === 'remote' ? <Wifi className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
              {workMode}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Compensation</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{salary}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Experience</span>
            <span className="text-sm font-bold text-white">{experience}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description, Requirements & Responsibilities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Overview */}
          <div className="glass-card p-6 sm:p-7 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Role Overview</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {responsibilities && responsibilities.length > 0 && (
            <div className="glass-card p-6 sm:p-7 space-y-4">
              <h2 className="text-lg font-bold text-white">Key Responsibilities</h2>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Candidate Requirements */}
          {requirements && requirements.length > 0 && (
            <div className="glass-card p-6 sm:p-7 space-y-4">
              <h2 className="text-lg font-bold text-white">Qualifications &amp; Requirements</h2>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right 1 Column: Skills & Employer Sidebar Card */}
        <div className="space-y-6">
          {/* Skills Required */}
          {skills && skills.length > 0 && (
            <div className="glass-card p-6 space-y-3.5">
              <h3 className="text-sm font-bold text-white">Desired Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-medium"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About Employer Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>About the Company</span>
              {companySlug && (
                <Link
                  to={`/companies/${companySlug}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline font-semibold"
                >
                  <span>Company Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white text-base">
                {companySlug ? (
                  <Link
                    to={`/companies/${companySlug}`}
                    className="hover:text-indigo-300 hover:underline transition-colors"
                  >
                    {company}
                  </Link>
                ) : (
                  company
                )}
              </div>
              {employer?.companyDescription && (
                <p className="text-slate-400 leading-relaxed">
                  {employer.companyDescription}
                </p>
              )}
              {employer?.companyLocation && (
                <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Headquarters: {employer.companyLocation}</span>
                </div>
              )}
              {employer?.companyWebsite && (
                <div className="pt-2">
                  <a
                    href={employer.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visit Company Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Recruiter Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Employer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Job Application Submission Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply for Position</h3>
                  <p className="text-xs text-slate-400">
                    {title} &bull; {company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close application modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Animation */}
            {applySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your PDF resume and details were successfully received by {company}. You can track
                  status updates in your dashboard.
                </p>
              </div>
            ) : (
              /* Application Form */
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Resume Upload Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload Resume (PDF format, max 5 MB) <span className="text-rose-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center transition-colors bg-slate-950/50">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Upload className="w-5 h-5" />
                      </div>
                      {resumeFile ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{resumeFile.name}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-300 font-semibold">
                            Click to browse or drop your PDF resume here
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Protected from public access. Strictly visible to hiring managers only.
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cover Letter / Note to Recruiter (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Highlight your key achievements, why you're a great fit for this team, and your availability..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                {/* Candidate Info Pill */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                  <div>
                    Applying as: <strong className="text-white">{user?.name}</strong> ({user?.email})
                  </div>
                  <div>Duplicate applications to the same role are automatically prevented.</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !resumeFile}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting Application...' : 'Send Application'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Guest Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Sign In to Apply</h3>
              <p className="text-xs text-slate-300">
                You need a verified Job Seeker account to upload your resume and apply to "{title}".
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                Register
              </button>
            </div>

            <button
              onClick={() => setShowAuthPrompt(false)}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
