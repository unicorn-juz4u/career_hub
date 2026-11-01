// client/src/services/api.js
// Centralized Axios API client with automatic JWT token attachment
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error message handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the server's error message if available
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

/* ================= AUTHENTICATION APIs ================= */

// Register a new user or employer
export const registerUser = async (formData) => {
  const response = await API.post('/auth/register', formData);
  return response.data;
};

// Login user / employer / admin
export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

// Fetch current user info using saved JWT
export const getCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

/* ================= DASHBOARD TEST APIs (Role Protected) ================= */

export const getUserDashboardData = async () => {
  const response = await API.get('/dashboard/user');
  return response.data;
};

export const getEmployerDashboardData = async () => {
  const response = await API.get('/dashboard/employer');
  return response.data;
};

export const getAdminDashboardData = async () => {
  const response = await API.get('/dashboard/admin');
  return response.data;
};

/* ================= JOB MANAGEMENT APIs ================= */

// Public: Get all open jobs with search, filtering, and pagination
export const getJobs = async (params = {}) => {
  const response = await API.get('/jobs', { params });
  return response.data;
};

// Private (Employer/Admin): Get jobs created by the current employer with status stats
export const getMyJobs = async () => {
  const response = await API.get('/jobs/my-jobs');
  return response.data;
};

// Public/Private: Get single job details by ID
export const getJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

// Private (Employer/Admin): Create a new job listing
export const createJob = async (jobData) => {
  const response = await API.post('/jobs', jobData);
  return response.data;
};

// Private (Employer/Admin): Update an existing job listing
export const updateJob = async (id, jobData) => {
  const response = await API.put(`/jobs/${id}`, jobData);
  return response.data;
};

// Private (Employer/Admin): Toggle status (open/closed)
export const toggleJobStatus = async (id, status) => {
  const response = await API.patch(`/jobs/${id}/status`, { status });
  return response.data;
};

// Private (Employer/Admin): Delete job listing
export const deleteJob = async (id) => {
  const response = await API.delete(`/jobs/${id}`);
  return response.data;
};

/* ================= APPLICATION MANAGEMENT APIs ================= */

// Job Seeker: Submit application with PDF resume & cover letter
export const submitApplication = async (formData) => {
  const response = await API.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Job Seeker: Get list of candidate's own applications with metrics
export const getMyApplications = async () => {
  const response = await API.get('/applications/me');
  return response.data;
};

// Employer/Admin: Get all applications across employer's postings
export const getEmployerApplications = async (params = {}) => {
  const response = await API.get('/applications/employer', { params });
  return response.data;
};

// Employer/Admin: Get applications for a specific job listing
export const getJobApplications = async (jobId) => {
  const response = await API.get(`/applications/job/${jobId}`);
  return response.data;
};

// Private: Get single application details
export const getApplicationById = async (id) => {
  const response = await API.get(`/applications/${id}`);
  return response.data;
};

// Employer/Admin: Update candidate status (Shortlist, Interview, Hire, Reject)
export const updateApplicationStatus = async (id, statusData) => {
  const response = await API.patch(`/applications/${id}/status`, statusData);
  return response.data;
};

// Job Seeker / Admin: Withdraw application
export const deleteApplication = async (id) => {
  const response = await API.delete(`/applications/${id}`);
  return response.data;
};

// Secure resume download helper
export const getResumeDownloadUrl = (applicationId) => {
  const baseURL = import.meta.env.VITE_API_URL || '/api';
  return `${baseURL}/applications/${applicationId}/resume`;
};

/* ================= NOTIFICATION APIs ================= */

// Get user's notifications & unread counter
export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};

/* ================= COMPANY & BRANDING APIs ================= */

// Public: Get list of companies with search & filters
export const getCompanies = async (params = {}) => {
  const response = await API.get('/companies', { params });
  return response.data;
};

// Public: Get single company profile by slug (with active job postings)
export const getCompanyBySlug = async (slug) => {
  const response = await API.get(`/companies/${slug}`);
  return response.data;
};

// Employer/Admin: Get authenticated employer's company profile
export const getMyCompany = async () => {
  const response = await API.get('/companies/me');
  return response.data;
};

// Employer/Admin: Create company profile with optional logo/cover upload
export const createCompany = async (formData) => {
  const response = await API.post('/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Employer/Admin: Update company profile with optional logo/cover upload
export const updateMyCompany = async (formData) => {
  const response = await API.put('/companies/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Admin: Verify or reject company profile
export const verifyCompany = async (id, status, rejectionReason = '') => {
  const response = await API.patch(`/companies/${id}/verification`, {
    status,
    rejectionReason,
  });
  return response.data;
};

export default API;

