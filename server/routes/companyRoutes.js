// server/routes/companyRoutes.js
// Express routes for Company Profiles, Employer Branding & Admin Verification
const express = require('express');
const router = express.Router();

const {
  getCompanies,
  getCompanyBySlug,
  getEmployerCompany,
  createCompany,
  updateEmployerCompany,
  updateCompanyVerification,
} = require('../controllers/companyController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { handleCompanyUpload } = require('../middleware/companyUploadMiddleware');

// Public route to list companies
router.get('/', getCompanies);

// Employer route to get own company (MUST be before /:slug)
router.get('/me', protect, authorizeRoles('employer', 'admin'), getEmployerCompany);

// Employer route to update own company
router.put('/me', protect, authorizeRoles('employer', 'admin'), handleCompanyUpload, updateEmployerCompany);

// Public route to get single company by slug (with active job openings)
router.get('/:slug', getCompanyBySlug);

// Employer route to create company profile
router.post('/', protect, authorizeRoles('employer', 'admin'), handleCompanyUpload, createCompany);

// Admin route to verify or reject company profile
router.patch('/:id/verification', protect, authorizeRoles('admin'), updateCompanyVerification);

module.exports = router;
