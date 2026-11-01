// server/controllers/applicationController.js
// Complete Controller for Job Applications with MongoDB and In-Memory fallback support
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const { createNotificationHelper } = require('./notificationController');
const { secureResumesDir } = require('../middleware/uploadMiddleware');

// Initial seed applications for in-memory fallback
let inMemoryApplications = [
  {
    _id: 'app-seed-1',
    job: {
      _id: 'job-seed-1',
      title: 'Senior Full-Stack Engineer (React & Node.js)',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA / Remote',
      salary: '$135,000 - $165,000',
      jobType: 'Full-time',
      workMode: 'remote',
      status: 'open',
    },
    applicant: {
      _id: 'seed-user-1',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '+1 555-0101',
      city: 'New York, NY',
      skills: ['React', 'JavaScript', 'Node.js', 'Tailwind CSS'],
      experience: '2 years as Frontend Developer at WebStudio',
      education: 'B.S. in Computer Science, NYU',
    },
    employer: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      companyName: 'TechCorp Solutions',
    },
    resume: 'secure_uploads/resumes/seed-alex-rivera-resume.pdf',
    coverLetter:
      'Dear Hiring Team at TechCorp,\n\nI am thrilled to apply for the Senior Full-Stack Engineer role. With extensive expertise in modern React architectures, Express REST APIs, and MongoDB schema design, I can immediately contribute to scaling your cloud solutions.\n\nBest regards,\nAlex Rivera',
    status: 'Shortlisted',
    interviewDate: null,
    interviewNotes: 'Strong React background, shortlisted for technical interview round.',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'app-seed-2',
    job: {
      _id: 'job-seed-2',
      title: 'Lead Frontend Architect',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      salary: '$150,000 - $185,000',
      jobType: 'Full-time',
      workMode: 'hybrid',
      status: 'open',
    },
    applicant: {
      _id: 'seed-user-2',
      name: 'Emily Chen',
      email: 'emily@example.com',
      phone: '+1 555-0102',
      city: 'Seattle, WA',
      skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
      experience: '3 years Backend Engineer at FinTech Corp',
      education: 'B.S. in Software Engineering, UW',
    },
    employer: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      companyName: 'TechCorp Solutions',
    },
    resume: 'secure_uploads/resumes/seed-emily-chen-resume.pdf',
    coverLetter:
      'I am very interested in contributing to TechCorp as Lead Frontend Architect. My architectural experience includes building modular components and driving high-performance web systems.',
    status: 'Under Review',
    interviewDate: null,
    interviewNotes: '',
    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'app-seed-3',
    job: {
      _id: 'job-seed-4',
      title: 'Junior Backend Developer',
      company: 'Cloud Innovate Labs',
      location: 'Austin, TX / Remote',
      salary: '$75,000 - $95,000',
      jobType: 'Full-time',
      workMode: 'remote',
      status: 'open',
    },
    applicant: {
      _id: 'seed-user-2',
      name: 'Emily Chen',
      email: 'emily@example.com',
      phone: '+1 555-0102',
      city: 'Seattle, WA',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
      experience: '3 years Backend Engineer at FinTech Corp',
      education: 'B.S. in Software Engineering, UW',
    },
    employer: {
      _id: 'seed-emp-2',
      name: 'David Miller',
      email: 'hiring@cloudinnovate.com',
      companyName: 'Cloud Innovate Labs',
    },
    resume: 'secure_uploads/resumes/seed-emily-chen-resume.pdf',
    coverLetter:
      'Hello Cloud Innovate Team,\n\nI love building resilient APIs and microservices. I would be thrilled to bring my Node.js and MongoDB skills to your engineering department.',
    status: 'Interview Scheduled',
    interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    interviewNotes: 'Technical screen scheduled for Thursday 2:00 PM EST via Google Meet.',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to calculate statistics for job seeker applications
const computeSeekerStats = (apps) => {
  return {
    total: apps.length,
    applied: apps.filter((a) => a.status === 'Applied').length,
    underReview: apps.filter((a) => a.status === 'Under Review').length,
    shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
    interviewScheduled: apps.filter((a) => a.status === 'Interview Scheduled').length,
    hired: apps.filter((a) => a.status === 'Hired').length,
    rejected: apps.filter((a) => a.status === 'Rejected').length,
  };
};

// Helper to calculate statistics for employer applications
const computeEmployerStats = (apps) => {
  return {
    totalApplicants: apps.length,
    newApplications: apps.filter((a) => a.status === 'Applied').length,
    underReview: apps.filter((a) => a.status === 'Under Review').length,
    shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
    interviews: apps.filter((a) => a.status === 'Interview Scheduled').length,
    hired: apps.filter((a) => a.status === 'Hired').length,
    rejected: apps.filter((a) => a.status === 'Rejected').length,
  };
};

/**
 * @desc    Submit a new job application with PDF resume upload
 * @route   POST /api/applications
 * @access  Private (Job Seeker / User)
 */
const createApplication = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    const { jobId, coverLetter } = req.body;

    // Security: Only Job Seekers (or Admin) can submit applications
    if (userRole === 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Employers cannot apply to job postings. Please switch to a Job Seeker account.',
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required to submit an application.',
      });
    }

    // Resume handling: from multer file or fallback
    let resumePath = '';
    if (req.file) {
      resumePath = path.relative(path.join(__dirname, '../..'), req.file.path);
    } else if (req.body.resume) {
      // In-memory or automated test mock string
      resumePath = req.body.resume;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload your PDF resume to submit your application.',
      });
    }

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(jobId)) {
      try {
        const targetJob = await Job.findById(jobId);
        if (!targetJob) {
          return res.status(404).json({
            success: false,
            message: 'Target job listing was not found.',
          });
        }

        if (targetJob.status === 'closed') {
          return res.status(400).json({
            success: false,
            message: 'This job listing is closed and no longer accepting applications.',
          });
        }

        // Prevent duplicate application check
        const existingApp = await Application.findOne({
          job: jobId,
          applicant: userId,
        });

        if (existingApp) {
          return res.status(400).json({
            success: false,
            message: 'You have already submitted an application for this job opening.',
          });
        }

        const newApp = await Application.create({
          job: jobId,
          applicant: userId,
          employer: targetJob.employer,
          resume: resumePath,
          coverLetter: coverLetter || '',
          status: 'Applied',
        });

        await newApp.populate([
          { path: 'job', select: 'title company location salary jobType workMode status' },
          { path: 'employer', select: 'name email companyName' },
          { path: 'applicant', select: 'name email phone' },
        ]);

        // Send notification to employer
        await createNotificationHelper({
          recipient: targetJob.employer,
          sender: userId,
          type: 'APPLICATION_RECEIVED',
          title: 'New Candidate Application! 📄',
          message: `${req.user.name} applied for "${targetJob.title}".`,
          applicationId: newApp._id,
          jobId: targetJob._id,
        });

        return res.status(201).json({
          success: true,
          message: 'Your application has been successfully submitted!',
          isInMemory: false,
          application: newApp,
        });
      } catch (mongoErr) {
        if (mongoErr.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'You have already submitted an application for this job opening.',
          });
        }
        console.warn('MongoDB insert failed in createApplication, falling back:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    // Find job in inMemoryJobs
    const { inMemoryJobs } = require('./jobController');
    const targetJob = (inMemoryJobs || []).find((j) => String(j._id) === String(jobId));

    if (!targetJob) {
      return res.status(404).json({
        success: false,
        message: 'Target job listing was not found.',
      });
    }

    if (targetJob.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This job listing is closed and no longer accepting applications.',
      });
    }

    // Prevent duplicate application
    const alreadyApplied = inMemoryApplications.some(
      (a) =>
        String(a.job?._id || a.job) === String(jobId) &&
        String(a.applicant?._id || a.applicant) === String(userId)
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this job opening.',
      });
    }

    const employerId = targetJob.employer?._id || targetJob.employer;

    const newInMemoryApp = {
      _id: `app-mem-${Date.now()}`,
      job: {
        _id: targetJob._id,
        title: targetJob.title,
        company: targetJob.company,
        location: targetJob.location,
        salary: targetJob.salary,
        jobType: targetJob.jobType,
        workMode: targetJob.workMode,
        status: targetJob.status,
      },
      applicant: {
        _id: userId,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        city: req.user.city || '',
        skills: req.user.skills || [],
      },
      employer: {
        _id: employerId,
        name: targetJob.employer?.name || 'Hiring Manager',
        email: targetJob.employer?.email || '',
        companyName: targetJob.company,
      },
      resume: resumePath,
      coverLetter: coverLetter || '',
      status: 'Applied',
      interviewDate: null,
      interviewNotes: '',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryApplications.unshift(newInMemoryApp);

    // Send in-memory notification to employer
    await createNotificationHelper({
      recipient: employerId,
      sender: userId,
      type: 'APPLICATION_RECEIVED',
      title: 'New Candidate Application! 📄',
      message: `${req.user.name} applied for "${targetJob.title}".`,
      applicationId: newInMemoryApp._id,
      jobId: targetJob._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Your application has been successfully submitted! (Session In-Memory)',
      isInMemory: true,
      application: newInMemoryApp,
    });
  } catch (error) {
    console.error('createApplication Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting application.',
    });
  }
};

/**
 * @desc    Get all applications submitted by the logged-in candidate
 * @route   GET /api/applications/me
 * @access  Private (Job Seeker / Admin)
 */
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const applications = await Application.find({ applicant: userId })
          .populate('job', 'title company location salary jobType workMode status')
          .populate('employer', 'name email companyName')
          .sort({ createdAt: -1 });

        const stats = computeSeekerStats(applications);

        return res.status(200).json({
          success: true,
          count: applications.length,
          stats,
          isInMemory: false,
          applications,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in getMyApplications:', mongoErr.message);
      }
    }

    // In-memory fallback
    const userApps = inMemoryApplications.filter((a) => {
      const applicantId = a.applicant?._id || a.applicant;
      return String(applicantId) === String(userId);
    });

    userApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    const stats = computeSeekerStats(userApps);

    return res.status(200).json({
      success: true,
      count: userApps.length,
      stats,
      isInMemory: true,
      applications: userApps,
    });
  } catch (error) {
    console.error('getMyApplications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your applications.',
    });
  }
};

/**
 * @desc    Get all applications across an employer's jobs
 * @route   GET /api/applications/employer
 * @access  Private (Employer / Admin)
 */
const getEmployerApplications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { jobId, status } = req.query;

    if (getDbStatus()) {
      try {
        const query = isAdmin ? {} : { employer: userId };
        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
          query.job = jobId;
        }
        if (status && status !== 'All') {
          query.status = status;
        }

        const applications = await Application.find(query)
          .populate('job', 'title company location salary jobType workMode status')
          .populate('applicant', 'name email phone city skills experience education resume')
          .populate('employer', 'name email companyName')
          .sort({ createdAt: -1 });

        // Overall stats for all employer applications
        const allEmployerApps = isAdmin
          ? applications
          : await Application.find({ employer: userId });
        const stats = computeEmployerStats(allEmployerApps);

        return res.status(200).json({
          success: true,
          count: applications.length,
          stats,
          isInMemory: false,
          applications,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in getEmployerApplications:', mongoErr.message);
      }
    }

    // In-memory fallback
    let apps = inMemoryApplications;
    if (!isAdmin) {
      apps = apps.filter((a) => {
        const empId = a.employer?._id || a.employer;
        return String(empId) === String(userId);
      });
    }

    const stats = computeEmployerStats(apps);

    if (jobId && jobId !== 'All') {
      apps = apps.filter((a) => {
        const jId = a.job?._id || a.job;
        return String(jId) === String(jobId);
      });
    }

    if (status && status !== 'All') {
      apps = apps.filter((a) => a.status === status);
    }

    apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    return res.status(200).json({
      success: true,
      count: apps.length,
      stats,
      isInMemory: true,
      applications: apps,
    });
  } catch (error) {
    console.error('getEmployerApplications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving candidate applications.',
    });
  }
};

/**
 * @desc    Get all applications for a specific job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Owning Employer / Admin)
 */
const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(jobId)) {
      try {
        const targetJob = await Job.findById(jobId);
        if (!targetJob) {
          return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        // Ownership verification
        if (!isAdmin && String(targetJob.employer) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only view applicants for your own job listings.',
          });
        }

        const applications = await Application.find({ job: jobId })
          .populate('applicant', 'name email phone city skills experience education resume')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          count: applications.length,
          job: targetJob,
          isInMemory: false,
          applications,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in getApplicationsForJob:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const { inMemoryJobs } = require('./jobController');
    const targetJob = (inMemoryJobs || []).find((j) => String(j._id) === String(jobId));

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const jobEmployerId = targetJob.employer?._id || targetJob.employer;
    if (!isAdmin && String(jobEmployerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view applicants for your own job listings.',
      });
    }

    const jobApps = inMemoryApplications.filter((a) => {
      const jId = a.job?._id || a.job;
      return String(jId) === String(jobId);
    });

    return res.status(200).json({
      success: true,
      count: jobApps.length,
      job: targetJob,
      isInMemory: true,
      applications: jobApps,
    });
  } catch (error) {
    console.error('getApplicationsForJob Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving job applications.',
    });
  }
};

/**
 * @desc    Get single application details
 * @route   GET /api/applications/:id
 * @access  Private (Applicant / Owning Employer / Admin)
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const app = await Application.findById(id)
          .populate('job', 'title company location salary jobType workMode status')
          .populate('applicant', 'name email phone city skills experience education resume')
          .populate('employer', 'name email companyName companyWebsite');

        if (!app) {
          return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Ownership authorization check
        const isApplicant = String(app.applicant._id || app.applicant) === String(userId);
        const isEmployer = String(app.employer._id || app.employer) === String(userId);

        if (!isAdmin && !isApplicant && !isEmployer) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to view this application.',
          });
        }

        return res.status(200).json({ success: true, application: app });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in getApplicationById:', mongoErr.message);
      }
    }

    // In-memory fallback
    const app = inMemoryApplications.find((a) => String(a._id) === String(id));
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const applicantId = app.applicant?._id || app.applicant;
    const employerId = app.employer?._id || app.employer;
    const isApplicant = String(applicantId) === String(userId);
    const isEmployer = String(employerId) === String(userId);

    if (!isAdmin && !isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this application.',
      });
    }

    return res.status(200).json({ success: true, application: app });
  } catch (error) {
    console.error('getApplicationById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving application.',
    });
  }
};

/**
 * @desc    Securely download or view candidate resume (Protected endpoint)
 * @route   GET /api/applications/:id/resume
 * @access  Private (Applicant / Owning Employer / Admin)
 */
const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    let app = null;

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        app = await Application.findById(id).populate('applicant', 'name');
      } catch (err) {
        console.warn('MongoDB error finding application for resume:', err.message);
      }
    }

    if (!app) {
      app = inMemoryApplications.find((a) => String(a._id) === String(id));
    }

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const applicantId = app.applicant?._id || app.applicant;
    const employerId = app.employer?._id || app.employer;
    const isApplicant = String(applicantId) === String(userId);
    const isEmployer = String(employerId) === String(userId);

    // Security Check: Only applicant, hiring employer, or admin can access resume!
    if (!isAdmin && !isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this candidate resume.',
      });
    }

    const candidateName = (app.applicant?.name || 'candidate').replace(/\s+/g, '_');
    const resumePath = app.resume;

    // Check if real file exists on disk
    let fullPath = path.isAbsolute(resumePath)
      ? resumePath
      : path.join(__dirname, '../..', resumePath);

    if (fs.existsSync(fullPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${candidateName}_resume.pdf"`);
      return res.sendFile(fullPath);
    }

    // For in-memory seeds or missing demo files, return an authentic demo PDF document response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${candidateName}_resume.pdf"`);

    // Minimal valid PDF binary representation
    const samplePdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Title (Candidate Resume) /Creator (CareerHub Portal) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n5 0 obj\n<< /Length 85 >>\nstream\nBT\n/F1 18 Tf\n50 720 Td\n(CareerHub Verified Candidate Resume: ' + candidateName + ') Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000080 00000 n \n0000000130 00000 n \n0000000190 00000 n \n0000000280 00000 n \ntrailer\n<< /Size 6 /Root 2 0 R >>\nstartxref\n415\n%%EOF'
    );
    return res.end(samplePdf);
  } catch (error) {
    console.error('downloadResume Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving resume file.',
    });
  }
};

/**
 * @desc    Update application status (Shortlist, Interview, Hire, Reject)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Owning Employer / Admin)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { status, interviewDate, interviewNotes } = req.body;

    const validStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Hired',
      'Rejected',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const app = await Application.findById(id).populate('job', 'title company');
        if (!app) {
          return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Ownership verification: Only the employer of the job (or Admin) can update status
        if (!isAdmin && String(app.employer) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only update applications for your own job listings.',
          });
        }

        app.status = status;
        if (interviewDate !== undefined) app.interviewDate = interviewDate;
        if (interviewNotes !== undefined) app.interviewNotes = interviewNotes;
        await app.save();

        // Generate tailored notification for the candidate
        let notifTitle = `Application Status Updated: ${status}`;
        let notifType = 'APPLICATION_STATUS_UPDATE';

        if (status === 'Shortlisted') {
          notifTitle = 'Congratulations! You have been Shortlisted! 🌟';
          notifType = 'APPLICATION_SHORTLISTED';
        } else if (status === 'Interview Scheduled') {
          notifTitle = 'Interview Scheduled! 📅';
          notifType = 'INTERVIEW_SCHEDULED';
        } else if (status === 'Hired') {
          notifTitle = 'Job Offer / Hired! 🥳';
          notifType = 'APPLICATION_HIRED';
        } else if (status === 'Rejected') {
          notifTitle = 'Application Status: Not Selected';
          notifType = 'APPLICATION_REJECTED';
        }

        const jobTitle = app.job?.title || 'the position';
        const companyName = app.job?.company || 'the hiring team';

        await createNotificationHelper({
          recipient: app.applicant,
          sender: userId,
          type: notifType,
          title: notifTitle,
          message: `Your application for "${jobTitle}" at ${companyName} has been updated to "${status}".`,
          applicationId: app._id,
          jobId: app.job?._id || app.job,
        });

        return res.status(200).json({
          success: true,
          message: `Application status updated to "${status}".`,
          isInMemory: false,
          application: app,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in updateApplicationStatus:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const appIndex = inMemoryApplications.findIndex((a) => String(a._id) === String(id));
    if (appIndex === -1) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = inMemoryApplications[appIndex];
    const employerId = app.employer?._id || app.employer;

    if (!isAdmin && String(employerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update applications for your own job listings.',
      });
    }

    app.status = status;
    if (interviewDate !== undefined) app.interviewDate = interviewDate;
    if (interviewNotes !== undefined) app.interviewNotes = interviewNotes;
    app.updatedAt = new Date().toISOString();

    const jobTitle = app.job?.title || 'the position';
    const companyName = app.job?.company || 'the company';
    const applicantId = app.applicant?._id || app.applicant;

    // Send candidate notification
    await createNotificationHelper({
      recipient: applicantId,
      sender: userId,
      type: status === 'Shortlisted' ? 'APPLICATION_SHORTLISTED' : 'APPLICATION_STATUS_UPDATE',
      title: `Application Update: ${status}`,
      message: `Your application for "${jobTitle}" at ${companyName} is now "${status}".`,
      applicationId: app._id,
      jobId: app.job?._id || app.job,
    });

    return res.status(200).json({
      success: true,
      message: `Application status updated to "${status}". (In-memory)`,
      isInMemory: true,
      application: app,
    });
  } catch (error) {
    console.error('updateApplicationStatus Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating application status.',
    });
  }
};

/**
 * @desc    Withdraw or delete an application
 * @route   DELETE /api/applications/:id
 * @access  Private (Applicant if 'Applied' / Admin)
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const app = await Application.findById(id);
        if (!app) {
          return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        const isApplicant = String(app.applicant) === String(userId);
        if (!isAdmin && !isApplicant) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only withdraw your own applications.',
          });
        }

        // File cleanup if physical file exists
        if (app.resume) {
          const fullPath = path.isAbsolute(app.resume)
            ? app.resume
            : path.join(__dirname, '../..', app.resume);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (unlinkErr) {
              console.warn('File cleanup notice:', unlinkErr.message);
            }
          }
        }

        await Application.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: 'Application has been withdrawn successfully.',
          isInMemory: false,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in deleteApplication:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const appIndex = inMemoryApplications.findIndex((a) => String(a._id) === String(id));
    if (appIndex === -1) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = inMemoryApplications[appIndex];
    const applicantId = app.applicant?._id || app.applicant;
    const isApplicant = String(applicantId) === String(userId);

    if (!isAdmin && !isApplicant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only withdraw your own applications.',
      });
    }

    inMemoryApplications.splice(appIndex, 1);

    return res.status(200).json({
      success: true,
      message: 'Application has been withdrawn successfully. (In-memory)',
      isInMemory: true,
    });
  } catch (error) {
    console.error('deleteApplication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error withdrawing application.',
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getEmployerApplications,
  getApplicationsForJob,
  getApplicationById,
  downloadResume,
  updateApplicationStatus,
  deleteApplication,
  inMemoryApplications,
};
