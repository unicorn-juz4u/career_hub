// server/routes/jobRoutes.js
// Express routes for Job listings with role-based access control
const express = require('express');
const router = express.Router();
const {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// 1. Employer & Admin: Retrieve jobs belonging to the authenticated account
// Note: Placed BEFORE /:id so 'my-jobs' is not matched as an :id parameter
router.get('/my-jobs', protect, authorizeRoles('employer', 'admin'), getMyJobs);

// 2. Public: List all open jobs with search, filtering, and pagination
//    Private (Employer/Admin): Create a new job listing
router
  .route('/')
  .get(getJobs)
  .post(protect, authorizeRoles('employer', 'admin'), createJob);

// 3. Status toggle endpoint (convenient for instant Open/Closed switching)
router.patch('/:id/status', protect, authorizeRoles('employer', 'admin'), toggleJobStatus);

// 4. Public: View single job details
//    Private (Employer/Admin): Update job or Delete job (ownership verified in controller)
router
  .route('/:id')
  .get(getJobById)
  .put(protect, authorizeRoles('employer', 'admin'), updateJob)
  .delete(protect, authorizeRoles('employer', 'admin'), deleteJob);

module.exports = router;
