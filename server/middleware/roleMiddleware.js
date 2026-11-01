// server/middleware/roleMiddleware.js
// Middleware to restrict access based on the user's role (user, employer, admin)

/**
 * authorizeRoles - Pass one or more allowed roles, e.g. authorizeRoles('employer', 'admin')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authMiddleware has run and attached req.user
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: This action requires [${allowedRoles.join(' or ')}] privileges, but your role is [${req.user.role}].`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
