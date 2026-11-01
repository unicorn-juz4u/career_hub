// client/src/pages/dashboards/CompanyDashboard.jsx
// Employer Company Branding & Profile Management Dashboard
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyCompany, createCompany, updateMyCompany } from '../../services/api';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Save,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const LinkedInIcon = () => (
  <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [foundedYear, setFoundedYear] = useState(new Date().getFullYear());
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialGithub, setSocialGithub] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');

  // File upload states
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const industriesList = [
    'Software & Technology',
    'Software & Cloud Infrastructure',
    'Cloud Consulting & SaaS',
    'Fintech',
    'Healthcare & Biotech',
    'E-Commerce & Retail',
    'AI & Machine Learning',
    'Design & Digital Media',
    'Cybersecurity',
    'Other',
  ];

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const res = await getMyCompany();
      if (res && res.company) {
        const c = res.company;
        setCompany(c);
        setName(c.name || '');
        setIndustry(c.industry || 'Software & Technology');
        setCompanySize(c.companySize || '11-50');
        setWebsite(c.website || '');
        setLocation(c.location || '');
        setDescription(c.description || '');
        setFoundedYear(c.foundedYear || new Date().getFullYear());
        setSocialLinkedin(c.socialLinks?.linkedin || '');
        setSocialTwitter(c.socialLinks?.twitter || '');
        setSocialGithub(c.socialLinks?.github || '');
        setSocialFacebook(c.socialLinks?.facebook || '');
        if (c.logo) setLogoPreview(getImageUrl(c.logo));
        if (c.coverImage) setCoverPreview(getImageUrl(c.coverImage));
      } else {
        // Pre-fill from user profile defaults if no company exists yet
        if (user?.companyName) setName(user.companyName);
        if (user?.companyWebsite) setWebsite(user.companyWebsite);
        if (user?.companyLocation) setLocation(user.companyLocation);
        if (user?.companyDescription) setDescription(user.companyDescription);
      }
    } catch (err) {
      console.error('Error loading company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Logo file exceeds 5 MB limit.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Cover image file exceeds 5 MB limit.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('industry', industry);
      formData.append('companySize', companySize);
      formData.append('website', website);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('foundedYear', foundedYear);

      const socialLinks = {
        linkedin: socialLinkedin,
        twitter: socialTwitter,
        github: socialGithub,
        facebook: socialFacebook,
      };
      formData.append('socialLinks', JSON.stringify(socialLinks));

      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      let res;
      if (company && company._id) {
        res = await updateMyCompany(formData);
      } else {
        res = await createCompany(formData);
      }

      if (res && res.success) {
        setSuccessMsg(res.message || 'Company profile saved successfully!');
        if (res.company) {
          setCompany(res.company);
        }
      }
    } catch (err) {
      console.error('Error saving company profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-28 rounded-2xl bg-slate-800/60" />
        <div className="h-96 rounded-2xl bg-slate-800/40" />
      </div>
    );
  }

  const isVerified = company?.verificationStatus === 'verified';
  const isRejected = company?.verificationStatus === 'rejected';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Employer Branding Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {company ? 'Manage Company Profile' : 'Create Company Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Build your employer brand, showcase your company culture, and attract top candidates to your open roles.
          </p>
        </div>

        {/* Public Profile Preview Button */}
        {company?.slug && (
          <div className="shrink-0">
            <Link
              to={`/companies/${company.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-indigo-400" />
              <span>Preview Public Profile</span>
            </Link>
          </div>
        )}
      </div>

      {/* Verification Status Alert Banner */}
      {company && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isVerified
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : isRejected
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : isRejected ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1 text-xs">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Verification Status:</span>
              <span className="capitalize">{company.verificationStatus}</span>
            </div>
            <p className="text-slate-300">
              {isVerified
                ? 'Your company profile is verified. Candidates see the "Verified Employer" checkmark on all your job postings and company page.'
                : isRejected
                ? `Your company verification was rejected: "${company.rejectionReason || 'Please verify your company website and legal information.'}". Update your profile below to re-submit for review.`
                : 'Your profile has been submitted and is currently pending review by CareerHub administrators. Verification status is administrator-controlled.'}
            </p>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Visual Branding (Cover Image & Logo) */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <span>Visual Branding &amp; Media</span>
          </h2>

          <div className="space-y-6">
            {/* Cover Image Upload & Live Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Company Cover Banner (JPG, PNG, WebP &bull; Max 5 MB)
              </label>
              <div className="h-36 sm:h-44 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 relative overflow-hidden flex items-center justify-center group hover:border-indigo-500/60 transition-colors">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-1 p-4">
                    <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                    <span className="text-xs text-slate-400 block font-medium">
                      Click to upload cover banner
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Recommended: 1200 x 400 px
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Logo Upload & Live Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group hover:border-indigo-500 transition-colors">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-600" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white block">
                  Company Logo
                </span>
                <p className="text-[11px] text-slate-400">
                  Square aspect ratio (e.g. 256x256 px). Formats: PNG, JPG, WebP up to 5 MB.
                </p>
                <label className="inline-block mt-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                  Upload new logo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Core Details */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Company Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Tech Solutions"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Industry <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Primary Industry</option>
                {industriesList.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Company Size (Employees)
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {companySizes.map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </select>
            </div>

            {/* Location / HQ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Headquarters / Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Official Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Founded Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Founded Year
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* About / Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                About the Company &amp; Culture <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Introduce your mission, engineering culture, tech stack, and what makes your company a great place to work..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social & Online Presence */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Social &amp; Online Profiles</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <LinkedInIcon />
                <span>LinkedIn Company Page</span>
              </label>
              <input
                type="url"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/your-company"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <TwitterIcon />
                <span>Twitter / X Profile</span>
              </label>
              <input
                type="url"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/your-handle"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <GithubIcon />
                <span>GitHub Organization</span>
              </label>
              <input
                type="url"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
                placeholder="https://github.com/your-org"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FacebookIcon />
                <span>Facebook Page</span>
              </label>
              <input
                type="url"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/your-page"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            to="/dashboard/employer"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Profile...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
