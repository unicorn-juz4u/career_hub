// server/middleware/authMiddleware.js
// Protects routes by verifying the JSON Web Token (JWT) sent in the Authorization header
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const { getFallbackUserById } = require('../controllers/authController');

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token using secret
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretjwtkey_jobportal_2026'
      );

      // Fetch user from MongoDB if connected and decoded.id is a valid ObjectId
      if (getDbStatus() && mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (err) {
          req.user = null;
        }
      }

      // Check in-memory store if not found in MongoDB
      if (!req.user) {
        req.user = getFallbackUserById(decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Please login again.',
        });
      }

      if (req.user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.',
        });
      }

      next();
    } catch (error) {
      console.error('Auth token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired session token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided. Please log in.',
    });
  }
};

module.exports = { protect };
