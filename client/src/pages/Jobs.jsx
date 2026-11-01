// client/src/pages/Jobs.jsx
// Public Job Listings page featuring live backend search, multi-faceted filtering, and pagination
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Briefcase,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isInMemory, setIsInMemory] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [jobType, setJobType] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [experience, setExperience] = useState('All');

  // Fetch jobs from server
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: 9,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (locationTerm.trim()) params.location = locationTerm.trim();
      if (jobType !== 'All') params.jobType = jobType;
      if (workMode !== 'All') params.workMode = workMode;
      if (experience !== 'All') params.experience = experience;

      const res = await getJobs(params);
      if (res && res.success) {
        setJobs(res.jobs || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setIsInMemory(Boolean(res.isInMemory));
      } else {
        throw new Error(res?.message || 'Failed to retrieve jobs');
      }
    } catch (err) {
      console.error('Jobs fetch error:', err);
      setError(err?.message || 'Unable to connect to the jobs server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, locationTerm, jobType, workMode, experience]);

  // Debounced effect for search inputs & immediate for dropdown filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setJobType('All');
    setWorkMode('All');
    setExperience('All');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Job Board</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Available Positions
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Discover verified roles from top tech companies. Filter by work mode, salary, tech stack,
              and career level.
            </p>
          </div>

          {/* Total Counter Pill */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Open Positions</span>
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">
              {loading ? '...' : total}
            </span>
          </div>
        </div>

        {/* Database Persistence Status Badge */}
        {isInMemory && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-400">
            <Database className="w-3.5 h-3.5" />
            <span>
              <strong>Note:</strong> Server is currently operating in In-Memory Fallback mode. Data is retained during this active session.
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        {/* Row 1: Search inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, skill, or description (e.g. React, Node, Docker)..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationTerm}
              onChange={(e) => {
                setLocationTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Location (e.g. San Francisco, Austin, Remote)..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Select Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Job Type Dropdown */}
            <div>
              <select
                value={jobType}
                onChange={(e) => {
                  setJobType(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Work Mode Dropdown */}
            <div>
              <select
                value={workMode}
                onChange={(e) => {
                  setWorkMode(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Work Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div>
              <select
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Experience Levels</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Exec">Lead / Exec</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {(searchTerm || locationTerm || jobType !== 'All' || workMode !== 'All' || experience !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchJobs}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-800 rounded w-20" />
              </div>
              <div className="h-4 bg-slate-800/60 rounded w-1/2" />
              <div className="h-3 bg-slate-800/40 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matching Jobs Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            We couldn't find any open positions matching your current search criteria. Try removing filters or searching for different keywords.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Jobs List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong> ({total} total openings)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
