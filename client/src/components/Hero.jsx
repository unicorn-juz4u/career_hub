import React from 'react';
import { Search, Filter, Sparkles, MapPin, Layers } from 'lucide-react';

export default function Hero({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedExp,
  setSelectedExp,
  totalJobs,
  onResetFilters,
}) {
  const jobTypes = ['All', 'Full-time', 'Remote', 'Contract', 'Part-time', 'Internship'];
  const expLevels = ['All', 'Entry Level', 'Mid Level', 'Senior'];

  return (
    <section className="relative pt-8 pb-10 xs:pt-10 xs:pb-12 md:pt-16 md:pb-16 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 xs:w-96 md:w-[600px] h-72 xs:h-96 md:h-[600px] bg-gradient-to-tr from-brand-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container-responsive text-center">
        {/* Top Badges */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 mb-4 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>MERN Architecture Template</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-brand-300 font-mono">Tailwind Mobile-First</span>
        </div>

        {/* Main Heading: Responsive Typography */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          Discover Your Next{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            Engineering Role
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm xs:text-base md:text-lg text-slate-400 mb-8 leading-relaxed">
          Production-grade full-stack boilerplate connecting Express backend REST APIs with a
          responsive Vite + React frontend powered by Tailwind CSS v3.
        </p>

        {/* Responsive Search Box: Mobile First to Desktop */}
        <div className="max-w-4xl mx-auto glass-card p-3 xs:p-4 mb-6 shadow-2xl">
          {/* Layout: Vertical stacked on Mobile (<768px), Horizontal flex on Tablet & Laptop (md:) */}
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {/* Keyword / Title Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, tech stack (e.g. React, Node, Mongo)..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Job Type Dropdown */}
            <div className="flex-1 xs:flex-none md:w-44">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type === 'All' ? 'All Job Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div className="flex-1 xs:flex-none md:w-44">
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              >
                {expLevels.map((exp) => (
                  <option key={exp} value={exp} className="bg-slate-900 text-white">
                    {exp === 'All' ? 'All Experience' : exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Tag Pills: Mobile First horizontal scroll / wrap */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-slate-400">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mr-1">
                Quick:
              </span>
              {['React', 'Node.js', 'MongoDB', 'Remote', 'Senior'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors text-[11px]"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs ml-auto">
              <span>
                Found <strong className="text-white font-mono">{totalJobs}</strong> jobs
              </span>
              {(searchTerm || selectedType !== 'All' || selectedExp !== 'All') && (
                <button
                  onClick={onResetFilters}
                  className="text-brand-400 hover:text-brand-300 underline text-xs"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
