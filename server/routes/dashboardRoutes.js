// server/routes/dashboardRoutes.js
// Protected routes verifying role middleware on the backend
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// 1. Job Seeker (User) Protected Dashboard Data
router.get('/user', protect, authorizeRoles('user'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome to the Job Seeker Dashboard, ${req.user.name}!`,
    role: req.user.role,
    user: req.user,
  });
});

// 2. Employer Protected Dashboard Data
router.get('/employer', protect, authorizeRoles('employer'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome to the Employer Hiring Dashboard, ${req.user.name}!`,
    role: req.user.role,
    plan: req.user.plan || 'basic',
    user: req.user,
  });
});

// 3. Admin Protected Dashboard Data
router.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome to the Admin Command Center, ${req.user.name}!`,
    role: req.user.role,
    user: req.user,
  });
});

module.exports = router;
