// server/models/User.js
// Mongoose schema and model for User accounts (job seekers, employers, admin)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['user', 'employer', 'admin'],
      default: 'user', // 'user' = job seeker, 'employer' = hiring manager, 'admin' = app owner
    },
    // Employer membership plan (default: 'basic')
    plan: {
      type: String,
      enum: ['basic', 'growth', 'pro'],
      default: 'basic',
    },
    // Job seeker profile fields (expanded in Phase 2)
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    education: { type: String, default: '' },
    experience: { type: String, default: '' },
    certifications: { type: String, default: '' },
    skills: { type: [String], default: [] },
    hobbies: { type: String, default: '' },
    jobPreferences: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    resume: { type: String, default: '' }, // Path to uploaded PDF/DOCX file

    // Employer company fields (expanded in Phase 3)
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    companyLocation: { type: String, default: '' },

    // Account status
    isSuspended: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify if entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
