// server/models/Job.js
// Mongoose schema and model for Job listings
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      type: String,
      default: 'Competitive',
      trim: true,
    },
    experience: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead / Exec'],
      default: 'Mid Level',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    workMode: {
      type: String,
      enum: ['onsite', 'hybrid', 'remote'],
      default: 'onsite',
      lowercase: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer reference is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for high-performance searching and filtering
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, workMode: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
