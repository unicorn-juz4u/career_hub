// client/src/pages/dashboards/AdminDashboard.jsx
// Administrator Command Center with Company Verification & Platform Oversight
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminDashboardData,
  getMyJobs,
  getEmployerApplications,
  getCompanies,
  verifyCompany,
} from '../../services/api';
import {
  Shield,
  Users,
  Building,
  Briefcase,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Building2,
  MapPin,
  Globe,
  Calendar,
  X,
  Check,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [serverVerification, setServerVerification] = useState(null);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [rejectedAppsCount, setRejectedAppsCount] = useState(0);

  // Companies Management State
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [reviewCompanyModal, setReviewCompanyModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'verify' | 'reject', company }
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, jobsRes, appsRes, compRes] = await Promise.all([
        getAdminDashboardData().catch(() => null),
        getMyJobs().catch(() => ({ stats: { activeJobs: 0 } })),
        getEmployerApplications().catch(() => ({ count: 0, applications: [] })),
        getCompanies({ status: 'all', limit: 100 }).catch(() => ({ companies: [] })),
      ]);

      if (res) setServerVerification(res);
      if (jobsRes && jobsRes.stats) setActiveJobsCount(jobsRes.stats.activeJobs);

      if (appsRes) {
        setApplicationsCount(appsRes.count || (appsRes.applications ? appsRes.applications.length : 0));
        const rejected = (appsRes.applications || []).filter((a) => a.status === 'Rejected').length;
        setRejectedAppsCount(rejected);
      }

      if (compRes && compRes.companies) {
        setCompanies(compRes.companies);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived company metrics
  const pendingCount = companies.filter((c) => c.verificationStatus === 'pending').length;
  const verifiedCount = companies.filter((c) => c.verificationStatus === 'verified').length;
  const rejectedCount = companies.filter((c) => c.verificationStatus === 'rejected').length;

  // Filtered company list
  const filteredCompanies = companies.filter((c) => {
    const statusMatch = filterStatus === 'all' || c.verificationStatus === filterStatus;
    const searchMatch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Action: Verify Company
  const handleVerifyConfirm = async (company) => {
    setActionLoading(true);
    try {
      const targetId = company._id || company.id;
      const res = await verifyCompany(targetId, 'verified');
      if (res && res.success) {
        showToast(`Company "${company.name}" has been successfully verified!`, 'success');
        setConfirmModal(null);
        if (reviewCompanyModal && (reviewCompanyModal._id === targetId || reviewCompanyModal.id === targetId)) {
          setReviewCompanyModal((prev) => ({ ...prev, verificationStatus: 'verified' }));
        }
        await loadData();
      }
    } catch (err) {
      console.error('Error verifying company:', err);
      showToast(err.response?.data?.message || 'Failed to verify company.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject Company
  const handleRejectConfirm = async (company) => {
    setActionLoading(true);
    try {
      const targetId = company._id || company.id;
      const res = await verifyCompany(targetId, 'rejected', rejectionReason);
      if (res && res.success) {
        showToast(`Company "${company.name}" verification was rejected.`, 'success');
        setConfirmModal(null);
        setRejectionReason('');
        if (reviewCompanyModal && (reviewCompanyModal._id === targetId || reviewCompanyModal.id === targetId)) {
          setReviewCompanyModal((prev) => ({
            ...prev,
            verificationStatus: 'rejected',
            rejectionReason,
          }));
        }
        await loadData();
      }
    } catch (err) {
      console.error('Error rejecting company verification:', err);
      showToast(err.response?.data?.message || 'Failed to reject verification.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xl border ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrator Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300">
              Account: <span className="font-mono text-white">{user?.email}</span> &bull; Privileges:{' '}
              <span className="text-purple-400 font-bold uppercase">Root Super Admin</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-1 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Role Middleware: Verified</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Access: <code className="text-purple-300 font-mono">role === 'admin'</code>
            </div>
          </div>
        </div>
      </div>

      {/* Platform & Verification Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Pending Verifications */}
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Verifications</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {loading ? '...' : pendingCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Needs review</span>
        </div>

        {/* Verified Companies */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Companies</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {loading ? '...' : verifiedCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Badged employers</span>
        </div>

        {/* Rejected Companies */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rejected Verifications</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {loading ? '...' : rejectedCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Disapproved profiles</span>
        </div>

        {/* Active Jobs */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : activeJobsCount}
          </div>
          <Link to="/jobs" className="text-[11px] text-indigo-400 hover:underline">
            Inspect Openings &rarr;
          </Link>
        </div>

        {/* Total Applications */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Applications</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : applicationsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Platform total</span>
        </div>

        {/* Rejected Applications */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rejected Applications</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : rejectedAppsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Candidate rejections</span>
        </div>
      </div>

      {/* Section: Company Verification Management */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Company Verification Requests</span>
            </h2>
            <p className="text-xs text-slate-400">
              Review and verify employer branding profiles. Employers cannot self-verify.
            </p>
          </div>

          {/* Search & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses ({companies.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="verified">Verified ({verifiedCount})</option>
              <option value="rejected">Rejected ({rejectedCount})</option>
            </select>

            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verification Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Industry</th>
                <th className="py-3 px-3">Headquarters</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((c) => {
                  const isVerified = c.verificationStatus === 'verified';
                  const isPending = c.verificationStatus === 'pending';

                  return (
                    <tr key={c._id || c.slug} className="hover:bg-slate-900/40 transition-colors">
                      {/* Company Name & Slug */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          /{c.slug}
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-3 text-slate-300">
                        {c.industry}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 text-slate-300">
                        {c.location}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {getStatusBadge(c.verificationStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {/* Review Company Details */}
                        <button
                          onClick={() => setReviewCompanyModal(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                          title="Review Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                          Review
                        </button>

                        {/* View Public Page */}
                        <Link
                          to={`/companies/${c.slug}`}
                          target="_blank"
                          className="p-1.5 inline-block rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Verify Button (if not already verified) */}
                        {!isVerified && (
                          <button
                            onClick={() => setConfirmModal({ type: 'verify', company: c })}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 inline mr-1" />
                            Verify
                          </button>
                        )}

                        {/* Reject Button (if pending or verified) */}
                        {c.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => setConfirmModal({ type: 'reject', company: c })}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors"
                          >
                            <X className="w-3.5 h-3.5 inline mr-1" />
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No company profiles match the selected status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Company Modal */}
      {reviewCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[11px] text-indigo-400 font-semibold">
                  <Building2 className="w-3 h-3" />
                  <span>Company Profile Review</span>
                </div>
                <h3 className="text-lg font-bold text-white">{reviewCompanyModal.name}</h3>
              </div>
              <button
                onClick={() => setReviewCompanyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Verification</span>
                  <div>{getStatusBadge(reviewCompanyModal.verificationStatus)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Headquarters</span>
                  <span className="font-medium text-white">{reviewCompanyModal.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Industry</span>
                  <span className="font-medium text-white">{reviewCompanyModal.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Company Size</span>
                  <span className="font-medium text-white">{reviewCompanyModal.companySize}</span>
                </div>
              </div>

              {reviewCompanyModal.website && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Website</span>
                  <a
                    href={reviewCompanyModal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{reviewCompanyModal.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-[11px] mb-1">Company Description</span>
                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {reviewCompanyModal.description}
                </p>
              </div>

              {reviewCompanyModal.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold block">Rejection Reason:</span>
                  <span>{reviewCompanyModal.rejectionReason}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Link
                to={`/companies/${reviewCompanyModal.slug}`}
                target="_blank"
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="space-x-2">
                {reviewCompanyModal.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => {
                      setReviewCompanyModal(null);
                      setConfirmModal({ type: 'verify', company: reviewCompanyModal });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    Verify Company
                  </button>
                )}

                {reviewCompanyModal.verificationStatus !== 'rejected' && (
                  <button
                    onClick={() => {
                      setReviewCompanyModal(null);
                      setConfirmModal({ type: 'reject', company: reviewCompanyModal });
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors"
                  >
                    Reject Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs for Verification / Rejection */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              {confirmModal.type === 'verify' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {confirmModal.type === 'verify'
                    ? 'Verify Company Profile'
                    : 'Reject Company Verification'}
                </h3>
                <p className="text-xs text-slate-400">{confirmModal.company?.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.type === 'verify'
                ? `Are you sure you want to officially verify "${confirmModal.company?.name}"? The company will receive the "Verified Employer" badge across all job listings and public search results.`
                : `Are you sure you want to reject verification for "${confirmModal.company?.name}"?`}
            </p>

            {confirmModal.type === 'reject' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Reason for rejection (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide feedback on why verification was declined..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => {
                  setConfirmModal(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              {confirmModal.type === 'verify' ? (
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerifyConfirm(confirmModal.company)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Confirm Verification'}
                </button>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleRejectConfirm(confirmModal.company)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
