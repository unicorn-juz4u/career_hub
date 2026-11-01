// client/src/pages/Companies.jsx
// Public Directory of Companies and Verified Employers
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/api';
import {
  Building2,
  Search,
  MapPin,
  CheckCircle2,
  Users,
  ExternalLink,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('all');

  const industriesList = [
    'All Industries',
    'Software & Technology',
    'Software & Cloud Infrastructure',
    'Cloud Consulting & SaaS',
    'Fintech',
    'Healthcare',
    'E-Commerce',
    'Design & Creative',
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getCompanies({
        search,
        industry: industry === 'All Industries' ? '' : industry,
        status,
        limit: 20,
      });
      if (res && res.companies) {
        setCompanies(res.companies);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industry, status]);

  const handleReset = () => {
    setSearch('');
    setIndustry('');
    setStatus('all');
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Employer Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Top Tech Employers
        </h1>
        <p className="text-sm text-slate-400">
          Discover verified companies, review culture, and explore open engineering and design roles.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {industriesList.map((ind) => (
                <option key={ind} value={ind === 'All Industries' ? '' : ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 transition-colors shrink-0"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/40" />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => {
            const logo = getImageUrl(c.logo);
            const cover = getImageUrl(c.coverImage);
            const isVerified = c.verificationStatus === 'verified';

            return (
              <div
                key={c._id || c.slug}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800 group"
              >
                <div>
                  {/* Card Cover Banner */}
                  <div className="h-28 w-full relative bg-gradient-to-r from-slate-900 to-indigo-950/60 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>

                  {/* Header & Logo */}
                  <div className="px-5 -mt-8 relative z-10 space-y-3">
                    <div className="flex items-end justify-between">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-slate-700 p-1 flex items-center justify-center shadow-lg shrink-0">
                        {logo ? (
                          <img
                            src={logo}
                            alt={c.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <span className="text-xl font-black text-indigo-400">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </span>
                        )}
                      </div>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        to={`/companies/${c.slug}`}
                        className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-indigo-400 font-medium">
                        {c.industry}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-5 pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate max-w-[140px]">{c.location}</span>
                  </div>

                  <Link
                    to={`/companies/${c.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl space-y-3">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No companies match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your keywords or filter parameters to view other active employers.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
