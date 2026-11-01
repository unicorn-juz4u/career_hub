// server/models/Company.js
// Mongoose schema and model for Company Profiles & Employer Branding
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Company slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    companySize: {
      type: String,
      default: '11-50',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location / Headquarters is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    foundedYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    socialLinks: {
      linkedin: { type: String, default: '', trim: true },
      twitter: { type: String, default: '', trim: true },
      github: { type: String, default: '', trim: true },
      facebook: { type: String, default: '', trim: true },
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer user reference is required'],
      unique: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate clean slugs from company name
companySchema.statics.generateSlug = function (name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Text index for search functionality
companySchema.index({ name: 'text', industry: 'text', description: 'text', location: 'text' });

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

module.exports = Company;
