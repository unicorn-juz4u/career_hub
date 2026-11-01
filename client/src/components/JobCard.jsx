import React from 'react';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Trash2,
  ExternalLink,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function JobCard({ job, onDelete, onApply }) {
  const {
    _id,
    title,
    company,
    location,
    type = 'Full-time',
    salary = 'Competitive',
    experience = 'Mid Level',
    description,
    tags = [],
    createdAt,
  } = job;

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
        return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
      case 'contract':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'part-time':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="glass-card glass-card-hover p-4 xs:p-5 md:p-6 transition-all duration-200 group">
      {/* 
        Mobile Device First Layout:
        - Mobile (<480px): Stacked vertical arrangement
        - Large Mobile (xs: 480px+): Flex with company initials
        - Tablet (md: 768px+): Row layout with dedicated action zone
      */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left Section: Company Icon & Job Details */}
        <div className="flex items-start gap-3 xs:gap-4 flex-1">
          {/* Company Avatar / Logo */}
          <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:border-brand-500/40 transition-colors">
            <span className="text-base xs:text-lg font-bold text-brand-300">
              {company ? company.charAt(0).toUpperCase() : 'J'}
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base xs:text-lg font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                {title}
              </h3>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getTypeBadgeColor(
                  type
                )}`}
              >
                {type}
              </span>
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

            {/* Description (clamp on mobile, expand on tablet/desktop) */}
            {description && (
              <p className="text-xs xs:text-sm text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                {description}
              </p>
            )}

            {/* Tech Stack Tags */}
            {tags && tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-300 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Salary & Action Buttons */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t border-slate-800/80 md:border-0 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block">Salary / Compensation</span>
            <span className="text-sm xs:text-base font-bold text-white font-mono">
              {salary}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(_id)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors"
              title="Delete job listing"
              aria-label={`Delete job ${title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onApply(job)}
              className="px-3.5 py-2 rounded-xl bg-brand-600/90 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Apply</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
