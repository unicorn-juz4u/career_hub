// client/src/pages/JobDetails.jsx
// Detailed Job view displaying comprehensive specifications, employer profile, and Phase 3 application modal
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobById } from '../services/api';
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
  Info,
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

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
    updatedAt,
  } = job;

  const isOwnerOrAdmin =
    user && (user.role === 'admin' || String(employer?._id || employer) === String(user.id || user._id));

  const formattedCreated = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

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
                {status === 'closed' && (
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

          {/* Apply CTA Button */}
          <div className="shrink-0 flex flex-col sm:items-end gap-2">
            <button
              onClick={() => setShowApplyModal(true)}
              disabled={status === 'closed'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply for this Position</span>
            </button>
            <span className="text-[11px] text-slate-500 text-center sm:text-right block">
              1-Click Application (Phase 3)
            </span>
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
            <h3 className="text-sm font-bold text-white">About the Company</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white text-base">{company}</div>
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

      {/* Phase 3 Application Placeholder Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Application Flow Ready for Phase 3</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct resume submissions and applicant tracking will unlock in <strong>Phase 3</strong>.
                Ensure your primary resume (PDF/DOCX) is uploaded in your profile to apply with 1 click.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold">Position Selected:</div>
              <div className="text-white font-mono">{title}</div>
              <div className="text-indigo-400">{company} &bull; {location}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
