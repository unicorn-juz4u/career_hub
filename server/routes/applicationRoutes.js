// server/routes/applicationRoutes.js
// Express routes for Job Applications with role authorization and resume upload middleware
const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getEmployerApplications,
  getApplicationsForJob,
  getApplicationById,
  downloadResume,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { handleResumeUpload } = require('../middleware/uploadMiddleware');

// All application routes require authentication
router.use(protect);

// 1. Job Seeker: View their submitted applications with statistics
router.get('/me', getMyApplications);

// 2. Employer & Admin: View all applicants across employer's postings
router.get('/employer', authorizeRoles('employer', 'admin'), getEmployerApplications);

// 3. Employer & Admin: View applicants for a specific job
router.get('/job/:jobId', authorizeRoles('employer', 'admin'), getApplicationsForJob);

// 4. Secure Resume Download/View (Protected: Applicant, Hiring Employer, or Admin only)
router.get('/:id/resume', downloadResume);

// 5. Submit an application (Job Seekers only)
router.post('/', handleResumeUpload, createApplication);

// 6. Application status management (Employer / Admin only)
router.patch('/:id/status', authorizeRoles('employer', 'admin'), updateApplicationStatus);

// 7. Single application detail & application withdrawal
router
  .route('/:id')
  .get(getApplicationById)
  .delete(deleteApplication);

module.exports = router;
