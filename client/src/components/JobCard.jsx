// client/src/components/JobCard.jsx
// Mobile-first responsive job card used in Public Listings and Dashboards
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Wifi,
  Laptop,
} from 'lucide-react';

export default function JobCard({
  job,
  onDelete,
  onEdit,
  onApply,
  showManageActions = false,
}) {
  const {
    _id,
    id,
    title,
    company,
    location,
    salary = 'Competitive',
    experience = 'Mid Level',
    description,
    createdAt,
    status = 'open',
  } = job;

  const jobId = _id || id;
  const jobType = job.jobType || job.type || 'Full-time';
  const workMode = (job.workMode || 'onsite').toLowerCase();
  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : Array.isArray(job.tags)
    ? job.tags
    : [];

  // Format creation date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  // Badge color based on job type
  const getTypeBadgeColor = (t) => {
    switch (t?.toLowerCase()) {
      case 'remote':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'full-time':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'contract':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'part-time':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'internship':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  // Work mode badge
  const renderWorkModeBadge = () => {
    if (workMode === 'remote') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Wifi className="w-3 h-3" />
          Remote
        </span>
      );
    }
    if (workMode === 'hybrid') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Laptop className="w-3 h-3" />
          Hybrid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
        <Building2 className="w-3 h-3" />
        On-Site
      </span>
    );
  };

  return (
    <div className="glass-card glass-card-hover p-4 xs:p-5 md:p-6 transition-all duration-200 group flex flex-col justify-between">
      <div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left Section: Company Icon & Job Details */}
          <div className="flex items-start gap-3.5 flex-1">
            {/* Company Avatar / Logo */}
            <div className="w-11 h-11 xs:w-12 xs:h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:border-indigo-500/40 transition-colors">
              <span className="text-base xs:text-lg font-bold text-indigo-300">
                {company ? company.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              {/* Title & Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/jobs/${jobId}`}
                  className="text-base xs:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors hover:underline truncate"
                >
                  {title}
                </Link>

                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(
                    jobType
                  )}`}
                >
                  {jobType}
                </span>

                {renderWorkModeBadge()}

                {status === 'closed' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Closed
                  </span>
                )}
              </div>

              {/* Company & Location Metadata */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-medium">{company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Posted {formattedDate}</span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-xs xs:text-sm text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Skills Tags */}
              {skillsList.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {skillsList.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-300 border border-slate-800"
                    >
                      #{skill}
                    </span>
                  ))}
                  {skillsList.length > 4 && (
                    <span className="text-[10px] text-slate-500">
                      +{skillsList.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Compensation Info */}
          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-1 pt-2 md:pt-0 shrink-0">
            <span className="text-xs text-slate-400 block">Salary / Compensation</span>
            <span className="text-sm xs:text-base font-bold text-white font-mono">
              {salary}
            </span>
            <span className="text-[11px] text-indigo-400 font-medium">
              Exp: {experience}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <Link
          to={`/jobs/${jobId}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <span>View Details &amp; Requirements</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showManageActions ? (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(job)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Edit listing"
                  aria-label="Edit job"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(jobId)}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors"
                  title="Delete job listing"
                  aria-label="Delete job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <Link
              to={`/jobs/${jobId}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Explore Role</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
