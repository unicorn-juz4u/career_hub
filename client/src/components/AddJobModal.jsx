import React, { useState } from 'react';
import { X, Briefcase, Plus, AlertCircle } from 'lucide-react';

export default function AddJobModal({ isOpen, onClose, onSubmitJob }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    experience: 'Mid Level',
    tags: 'React, Node.js, MongoDB',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location) {
      setError('Please fill in Title, Company, and Location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmitJob({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create job listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 xs:p-6 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Post New Job Listing</h3>
              <p className="text-xs text-slate-400">
                Data persists to MongoDB / Express API backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior MERN Stack Engineer"
              required
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Company & Location: 2 columns on large-mobile+ */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote / New York"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Type & Salary: 2 columns */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $100k - $130k"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Experience & Tags */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Exec">Lead / Exec</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tech Stack Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="React, Node.js, Express"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Key responsibilities and skills..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Publish Job'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
