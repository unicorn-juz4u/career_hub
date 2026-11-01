// server/models/Application.js
// Mongoose schema and model for Job Applications
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer reference is required'],
    },
    resume: {
      type: String,
      required: [true, 'Resume file path is required'],
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Hired',
        'Rejected',
      ],
      default: 'Applied',
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    interviewNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Interview notes cannot exceed 1000 characters'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound Unique Index: A candidate can only apply once to a given job listing
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Query indexes for fast lookups by candidate, employer, or status
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ employer: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
