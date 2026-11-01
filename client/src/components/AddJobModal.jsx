// client/src/components/AddJobModal.jsx
// Modal component for creating and editing job listings with full field support
import React, { useState, useEffect } from 'react';
import { X, Briefcase, Plus, Save, AlertCircle } from 'lucide-react';

export default function AddJobModal({ isOpen, onClose, onSubmitJob, initialData = null }) {
  const isEditing = Boolean(initialData && (initialData._id || initialData.id));

  const defaultState = {
    title: '',
    company: '',
    location: '',
    salary: '$120,000 - $150,000',
    experience: 'Mid Level',
    jobType: 'Full-time',
    workMode: 'onsite',
    skills: 'React, Node.js, MongoDB',
    description: '',
    requirements: '',
    responsibilities: '',
  };

  const [formData, setFormData] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Re-populate form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        location: initialData.location || '',
        salary: initialData.salary || 'Competitive',
        experience: initialData.experience || 'Mid Level',
        jobType: initialData.jobType || initialData.type || 'Full-time',
        workMode: initialData.workMode || 'onsite',
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(', ')
          : initialData.skills || (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : ''),
        description: initialData.description || '',
        requirements: Array.isArray(initialData.requirements)
          ? initialData.requirements.join('\n')
          : initialData.requirements || '',
        responsibilities: Array.isArray(initialData.responsibilities)
          ? initialData.responsibilities.join('\n')
          : initialData.responsibilities || '',
      });
    } else {
      setFormData(defaultState);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in Job Title, Company, Location, and Description.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        salary: formData.salary.trim(),
        experience: formData.experience,
        jobType: formData.jobType,
        workMode: formData.workMode,
        skills: formData.skills
          ? formData.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        description: formData.description.trim(),
        requirements: formData.requirements
          ? formData.requirements
              .split('\n')
              .map((r) => r.trim())
              .filter(Boolean)
          : [],
        responsibilities: formData.responsibilities
          ? formData.responsibilities
              .split('\n')
              .map((r) => r.trim())
              .filter(Boolean)
          : [],
      };

      await onSubmitJob(payload);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save job listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 xs:p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Job Listing' : 'Post New Job Listing'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Update position details and requirements'
                  : 'Reach qualified candidates across CareerHub'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Company & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. TechCorp Solutions"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                placeholder="e.g. San Francisco, CA or Remote"
                required
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Job Type, Work Mode & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Mode
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="onsite">On-Site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary / Compensation
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $120,000 - $150,000"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Experience & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs xs:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Exec">Lead / Exec</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tech Stack / Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Express, MongoDB"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              placeholder="High-level overview of the role and mission..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>

          {/* Requirements (1 per line) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Requirements (1 per line)
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={2}
              placeholder="e.g.&#10;3+ years building full-stack applications&#10;Solid grasp of MongoDB & Node.js"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all font-sans"
            />
          </div>

          {/* Responsibilities (1 per line) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Responsibilities (1 per line)
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={2}
              placeholder="e.g.&#10;Design and maintain API endpoints&#10;Conduct peer code reviews"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs xs:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all font-sans"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Publishing...' : 'Publish Job Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
