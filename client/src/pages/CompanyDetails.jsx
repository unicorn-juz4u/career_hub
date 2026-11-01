// client/src/pages/CompanyDetails.jsx
// Public Company Profile & Employer Branding Page
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyBySlug } from '../services/api';
import JobCard from '../components/JobCard';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  AlertCircle,
  Share2,
} from 'lucide-react';

const LinkedInIcon = () => (
  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export default function CompanyDetails() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyBySlug(slug);
        if (res && res.company) {
          setCompany(res.company);
          setJobs(res.jobs || []);
        } else {
          setError('Company not found.');
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
        setError(err.response?.data?.message || 'Company profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCompany();
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to format backend uploaded URLs
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-48 sm:h-64 rounded-3xl bg-slate-800/60"></div>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-800"></div>
          <div className="space-y-3 flex-1">
            <div className="h-8 bg-slate-800 rounded-md w-1/3"></div>
            <div className="h-4 bg-slate-800/80 rounded w-1/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 rounded-2xl bg-slate-800/50"></div>
          </div>
          <div className="h-60 rounded-2xl bg-slate-800/50"></div>
        </div>
      </div>
    );
  }

  // 2. Error / 404 State
  if (error || !company) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Company Profile Not Found</h1>
        <p className="text-sm text-slate-400">
          {error || `The company "${slug}" does not exist or has been removed.`}
        </p>
        <div className="pt-2">
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Companies</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    logo,
    coverImage,
    industry,
    companySize,
    location,
    website,
    description,
    foundedYear,
    socialLinks = {},
    verificationStatus = 'pending',
  } = company;

  const isVerified = verificationStatus === 'verified';
  const logoUrl = getImageUrl(logo);
  const coverUrl = getImageUrl(coverImage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Companies</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
          title="Share company profile"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* Header Banner & Brand Card */}
      <div className="glass-card overflow-hidden rounded-3xl border border-slate-800 relative">
        {/* Cover Image or Gradient */}
        <div className="h-44 sm:h-64 w-full relative bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${name} Cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        </div>

        {/* Brand Information Section */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Logo Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border-2 border-slate-700 p-1.5 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${name} Logo`}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-3xl">
                  {name ? name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
            </div>

            {/* Name, Tagline & Verification */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {name}
                </h1>

                {/* Verification Badge */}
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Employer</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Verification Pending</span>
                  </span>
                )}
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-200 font-medium">{industry}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{companySize} Employees</span>
                </div>
                {foundedYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Founded {foundedYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Website Link Action */}
          {website && (
            <div className="shrink-0 pt-2 sm:pt-0">
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): About & Active Job Listings */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Company */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>About {name}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Active Job Openings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Active Openings</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {jobs.length}
                </span>
              </div>
              <span className="text-xs text-slate-400">Current vacancies</span>
            </div>

            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id || job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center rounded-2xl space-y-2 border border-slate-800">
                <p className="text-sm font-semibold text-white">No active job listings right now</p>
                <p className="text-xs text-slate-400">
                  {name} doesn't have any open vacancies at the moment. Bookmark this page or check back soon!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Company Highlights & Social Links */}
        <div className="space-y-6">
          {/* Company Quick Facts */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Company Overview</h3>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Headquarters</span>
                <span className="font-medium text-white">{location}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Industry</span>
                <span className="font-medium text-white">{industry}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Company Size</span>
                <span className="font-medium text-white">{companySize}</span>
              </div>
              {foundedYear && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Founded</span>
                  <span className="font-medium text-white">{foundedYear}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verification</span>
                <span
                  className={`font-semibold ${
                    isVerified ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isVerified ? 'Verified by Admin' : 'Under Review'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          {(socialLinks.linkedin ||
            socialLinks.twitter ||
            socialLinks.github ||
            socialLinks.facebook) && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Connect &amp; Follow</h3>
              <div className="space-y-2">
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <LinkedInIcon />
                      <span>LinkedIn</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <TwitterIcon />
                      <span>Twitter / X</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon />
                      <span>GitHub</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <FacebookIcon />
                      <span>Facebook</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Direct Contact Banner */}
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2">
            <h4 className="font-semibold text-white">Interested in joining {name}?</h4>
            <p className="text-slate-400 leading-relaxed">
              Explore open positions above and submit your application with a tailored resume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
