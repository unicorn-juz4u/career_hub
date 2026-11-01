// server/controllers/authController.js
// Handles user registration, login, and session checks
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');

// Helper to generate a Signed JWT Token (valid for 30 days)
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecretjwtkey_jobportal_2026',
    { expiresIn: '30d' }
  );
};

// In-Memory Demo Users (Ensures 100% testability out of the box)
let inMemoryUsers = [
  {
    _id: 'seed-admin-1',
    name: 'System Admin',
    email: 'admin@jobportal.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    plan: 'pro',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'seed-emp-1',
    name: 'Sarah Jenkins',
    email: 'employer@techcorp.com',
    passwordHash: bcrypt.hashSync('employer123', 10),
    role: 'employer',
    plan: 'growth',
    companyName: 'TechCorp Solutions',
    companyLocation: 'San Francisco, CA',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'seed-emp-2',
    name: 'David Miller',
    email: 'hiring@cloudinnovate.com',
    passwordHash: bcrypt.hashSync('employer123', 10),
    role: 'employer',
    plan: 'basic',
    companyName: 'Cloud Innovate Labs',
    companyLocation: 'Austin, TX',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'seed-user-1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    passwordHash: bcrypt.hashSync('user123', 10),
    role: 'user',
    skills: ['React', 'JavaScript', 'Node.js', 'Tailwind CSS'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'seed-user-2',
    name: 'Emily Chen',
    email: 'emily@example.com',
    passwordHash: bcrypt.hashSync('user123', 10),
    role: 'user',
    skills: ['Node.js', 'Express', 'MongoDB'],
    createdAt: new Date().toISOString(),
  },
];

// Lookup user by ID for auth middleware
const getFallbackUserById = (id) => {
  const u = inMemoryUsers.find((user) => String(user._id) === String(id));
  if (!u) return null;
  const { passwordHash, ...safeUser } = u;
  return safeUser;
};

/**
 * @desc    Register a new user or employer
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Role check: Admin accounts cannot be self-registered
    const selectedRole = role === 'employer' ? 'employer' : 'user';
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly. They are created via server seed script.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Try MongoDB if connected
    if (getDbStatus()) {
      try {
        const userExists = await User.findOne({ email: normalizedEmail }).maxTimeMS(2500);
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please log in.',
          });
        }

        const newUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: selectedRole,
          plan: selectedRole === 'employer' ? 'basic' : undefined,
        });

        const token = generateToken(newUser._id, newUser.role);

        return res.status(201).json({
          success: true,
          message: 'Account registered successfully!',
          token,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            plan: newUser.plan,
          },
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in register:', mongoErr.message);
      }
    }

    // 3. In-Memory Store
    const existingMemory = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (existingMemory) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const newMemoryUser = {
      _id: `mem-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: selectedRole,
      plan: selectedRole === 'employer' ? 'basic' : undefined,
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newMemoryUser);
    const token = generateToken(newMemoryUser._id, newMemoryUser.role);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: newMemoryUser._id,
        name: newMemoryUser.name,
        email: newMemoryUser.email,
        role: newMemoryUser.role,
        plan: newMemoryUser.plan,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @desc    Login user / employer / admin
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try MongoDB if connected
    if (getDbStatus()) {
      try {
        const user = await User.findOne({ email: normalizedEmail }).maxTimeMS(2500);

        if (user) {
          if (user.isSuspended) {
            return res.status(403).json({
              success: false,
              message: 'This account has been suspended. Please contact support.',
            });
          }

          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const token = generateToken(user._id, user.role);
            return res.status(200).json({
              success: true,
              message: 'Logged in successfully!',
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
              },
            });
          }
        }
      } catch (mongoErr) {
        console.warn('MongoDB query warning in login:', mongoErr.message);
      }
    }

    // 2. Check In-Memory Users
    const fallbackUser = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (!fallbackUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = bcrypt.compareSync(password, fallbackUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(fallbackUser._id, fallbackUser.role);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: fallbackUser._id,
        name: fallbackUser.name,
        email: fallbackUser.email,
        role: fallbackUser.role,
        plan: fallbackUser.plan,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getFallbackUserById,
};
