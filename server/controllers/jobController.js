// server/controllers/jobController.js
// Complete CRUD controller for Jobs with MongoDB and In-Memory fallback support
const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const { getFallbackUserById } = require('./authController');

// Initial seed jobs for in-memory fallback (and instant testability)
let inMemoryJobs = [
  {
    _id: 'job-seed-1',
    title: 'Senior Full-Stack Engineer (React & Node.js)',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA / Remote',
    salary: '$135,000 - $165,000',
    experience: 'Senior',
    jobType: 'Full-time',
    workMode: 'remote',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    description:
      'We are looking for an experienced Senior Full-Stack Engineer to lead the architecture and delivery of modern enterprise cloud products.',
    requirements: [
      '5+ years building full-stack JavaScript/TypeScript web applications',
      'Strong expertise with React 18, state management, and modern component design',
      'Demonstrated proficiency in building secure REST APIs using Node.js and Express',
      'Experience with MongoDB schemas, indexing, and aggregation pipelines',
      'Familiarity with containerized deployments (Docker) and CI/CD workflows',
    ],
    responsibilities: [
      'Design, build, and maintain scalable full-stack web applications',
      'Collaborate closely with product managers, UX designers, and backend engineers',
      'Conduct comprehensive peer code reviews and champion engineering best practices',
      'Optimize web performance, accessibility, and responsiveness across all devices',
    ],
    employer: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.example.com',
      companyLocation: 'San Francisco, CA',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job-seed-2',
    title: 'Lead Frontend Architect',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    salary: '$150,000 - $185,000',
    experience: 'Lead / Exec',
    jobType: 'Full-time',
    workMode: 'hybrid',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Design Systems'],
    description:
      'Drive the vision and technical strategy for our customer-facing portals. Champion performance, design tokens, and modular UI component libraries.',
    requirements: [
      '7+ years in frontend engineering with 2+ years leading engineering teams',
      'Deep expertise in modern CSS architectures, Tailwind CSS, and accessibility standards (WCAG)',
      'Proven track record of optimizing Core Web Vitals and frontend bundle sizes',
      'Exceptional communication and cross-functional leadership capabilities',
    ],
    responsibilities: [
      'Define the long-term frontend architecture across multiple web properties',
      'Mentor senior and mid-level software engineers',
      'Establish automated frontend testing standards (unit, integration, and E2E)',
      'Partner with UX design leadership to evolve our design system',
    ],
    employer: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.example.com',
      companyLocation: 'San Francisco, CA',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job-seed-3',
    title: 'Cloud Infrastructure & DevOps Engineer',
    company: 'Cloud Innovate Labs',
    location: 'Austin, TX',
    salary: '$125,000 - $155,000',
    experience: 'Mid Level',
    jobType: 'Full-time',
    workMode: 'onsite',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    description:
      'Build resilient cloud infrastructure, automate deployment pipelines, and ensure high availability across multi-tenant microservices.',
    requirements: [
      '3+ years managing production workloads on AWS or GCP',
      'Hands-on experience with container orchestration (Kubernetes, ECS)',
      'Proficiency in Infrastructure as Code using Terraform or CloudFormation',
      'Knowledge of Prometheus, Grafana, and distributed tracing',
    ],
    responsibilities: [
      'Maintain and expand automated CI/CD deployment pipelines',
      'Implement proactive monitoring, alerting, and log aggregation',
      'Ensure zero-downtime rolling upgrades and robust disaster recovery strategies',
      'Work with developers to ensure cloud security compliance and cost optimization',
    ],
    employer: {
      _id: 'seed-emp-2',
      name: 'David Miller',
      email: 'hiring@cloudinnovate.com',
      companyName: 'Cloud Innovate Labs',
      companyWebsite: 'https://cloudinnovate.example.com',
      companyLocation: 'Austin, TX',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job-seed-4',
    title: 'Junior Backend Developer',
    company: 'Cloud Innovate Labs',
    location: 'Austin, TX / Remote',
    salary: '$75,000 - $95,000',
    experience: 'Entry Level',
    jobType: 'Full-time',
    workMode: 'remote',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git'],
    description:
      'Kickstart your backend development career! Collaborate with our senior engineers to build RESTful web services and integrate database models.',
    requirements: [
      'Solid understanding of JavaScript/ES6 fundamentals and Node.js runtime',
      'Basic knowledge of Express routing, middleware, and MongoDB CRUD operations',
      'Familiarity with version control (Git and GitHub workflows)',
      'Passionate about writing clean, maintainable, and well-tested code',
    ],
    responsibilities: [
      'Implement API endpoints under the guidance of senior developers',
      'Write unit tests and verify API behavior with Postman or curl',
      'Help maintain database indexes and query performance',
      'Participate in sprint planning and daily standups',
    ],
    employer: {
      _id: 'seed-emp-2',
      name: 'David Miller',
      email: 'hiring@cloudinnovate.com',
      companyName: 'Cloud Innovate Labs',
      companyWebsite: 'https://cloudinnovate.example.com',
      companyLocation: 'Austin, TX',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job-seed-5',
    title: 'UI/UX Product Designer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA / Remote',
    salary: '$105,000 - $130,000',
    experience: 'Mid Level',
    jobType: 'Contract',
    workMode: 'remote',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'],
    description:
      'Shape the user experience of next-gen SaaS portals. Create intuitive workflows, interactive wireframes, and production-ready design tokens.',
    requirements: [
      '3+ years designing complex SaaS products and responsive web applications',
      'Portfolio showcasing end-to-end UX research, wireframing, and visual design',
      'Mastery of Figma components, auto-layout, and interactive prototyping',
      'Understanding of HTML/CSS constraints to collaborate smoothly with developers',
    ],
    responsibilities: [
      'Conduct user interviews, usability testing, and synthesize feedback',
      'Produce wireframes, clickable mockups, and high-fidelity specifications',
      'Maintain the unified Figma design token library alongside frontend developers',
      'Iterate rapidly based on analytics data and customer interviews',
    ],
    employer: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.example.com',
      companyLocation: 'San Francisco, CA',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job-seed-6',
    title: 'AI & Data Integration Specialist',
    company: 'Cloud Innovate Labs',
    location: 'Austin, TX',
    salary: '$140,000 - $175,000',
    experience: 'Senior',
    jobType: 'Full-time',
    workMode: 'hybrid',
    skills: ['Python', 'FastAPI', 'PyTorch', 'Vector Databases', 'OpenAI API'],
    description:
      'Integrate generative AI capabilities, embeddings, and intelligent search into enterprise customer workflows.',
    requirements: [
      '4+ years building AI/ML powered backend applications or data pipelines',
      'Hands-on experience with LLM APIs, LangChain, embeddings, and vector indexing',
      'Strong Python and FastAPI knowledge with async database drivers',
      'Experience optimizing inference latency and tokens consumption',
    ],
    responsibilities: [
      'Architect and deploy semantic search and retrieval-augmented generation pipelines',
      'Collaborate with product teams to design delightful AI-driven features',
      'Benchmark model outputs for accuracy, latency, and cost efficiency',
      'Ensure strict data privacy and compliance safeguards',
    ],
    employer: {
      _id: 'seed-emp-2',
      name: 'David Miller',
      email: 'hiring@cloudinnovate.com',
      companyName: 'Cloud Innovate Labs',
      companyWebsite: 'https://cloudinnovate.example.com',
      companyLocation: 'Austin, TX',
    },
    status: 'open',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to sanitize employer info for in-memory jobs
const populateInMemoryEmployer = (job) => {
  if (typeof job.employer === 'object' && job.employer !== null && job.employer.name) {
    return job;
  }
  const empId = job.employer?._id || job.employer;
  const user = getFallbackUserById(empId);
  return {
    ...job,
    employer: user
      ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName || job.company,
          companyWebsite: user.companyWebsite || '',
          companyLocation: user.companyLocation || job.location,
        }
      : {
          _id: empId,
          name: 'Verified Recruiter',
          email: 'recruiter@careerhub.com',
          companyName: job.company,
          companyWebsite: '',
          companyLocation: job.location,
        },
  };
};

/**
 * @desc    Get all public jobs with filtering, searching, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      experience,
      page = 1,
      limit = 9,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));

    // 1. Try MongoDB if connected
    if (getDbStatus()) {
      try {
        const query = { status: 'open' };

        // Search in title, company, description, or skills
        if (search && search.trim()) {
          const searchRegex = new RegExp(search.trim(), 'i');
          query.$or = [
            { title: searchRegex },
            { company: searchRegex },
            { description: searchRegex },
            { skills: searchRegex },
          ];
        }

        if (location && location.trim() && location.toLowerCase() !== 'all') {
          query.location = new RegExp(location.trim(), 'i');
        }

        if (jobType && jobType.trim() && jobType.toLowerCase() !== 'all') {
          query.jobType = new RegExp(`^${jobType.trim()}$`, 'i');
        }

        if (workMode && workMode.trim() && workMode.toLowerCase() !== 'all') {
          query.workMode = workMode.trim().toLowerCase();
        }

        if (experience && experience.trim() && experience.toLowerCase() !== 'all') {
          query.experience = new RegExp(`^${experience.trim()}$`, 'i');
        }

        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum) || 1;

        const jobs = await Job.find(query)
          .populate('employer', 'name email companyName companyWebsite companyLocation')
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);

        return res.status(200).json({
          success: true,
          count: jobs.length,
          total,
          page: pageNum,
          totalPages,
          isInMemory: false,
          jobs,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query failed in getJobs, falling back to in-memory:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    let filtered = inMemoryJobs.filter((job) => job.status === 'open');

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          (job.skills && job.skills.some((s) => s.toLowerCase().includes(term)))
      );
    }

    if (location && location.trim() && location.toLowerCase() !== 'all') {
      const term = location.trim().toLowerCase();
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(term));
    }

    if (jobType && jobType.trim() && jobType.toLowerCase() !== 'all') {
      const term = jobType.trim().toLowerCase();
      filtered = filtered.filter((job) => job.jobType.toLowerCase() === term);
    }

    if (workMode && workMode.trim() && workMode.toLowerCase() !== 'all') {
      const term = workMode.trim().toLowerCase();
      filtered = filtered.filter((job) => (job.workMode || 'onsite').toLowerCase() === term);
    }

    if (experience && experience.trim() && experience.toLowerCase() !== 'all') {
      const term = experience.trim().toLowerCase();
      filtered = filtered.filter((job) => (job.experience || '').toLowerCase() === term);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum).map(populateInMemoryEmployer);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages,
      isInMemory: true,
      jobs: paginated,
    });
  } catch (error) {
    console.error('getJobs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving job listings.',
    });
  }
};

/**
 * @desc    Get all jobs belonging to the authenticated employer or admin
 * @route   GET /api/jobs/my-jobs
 * @access  Private (Employer / Admin)
 */
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Try MongoDB if connected
    if (getDbStatus()) {
      try {
        const query = isAdmin ? {} : { employer: userId };
        const jobs = await Job.find(query)
          .populate('employer', 'name email companyName companyWebsite companyLocation')
          .sort({ createdAt: -1 });

        const totalJobs = jobs.length;
        const activeJobs = jobs.filter((j) => j.status === 'open').length;
        const closedJobs = totalJobs - activeJobs;

        return res.status(200).json({
          success: true,
          stats: {
            totalJobs,
            activeJobs,
            closedJobs,
          },
          isInMemory: false,
          jobs,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query failed in getMyJobs, falling back to in-memory:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    let jobs = inMemoryJobs;
    if (!isAdmin) {
      jobs = jobs.filter((job) => {
        const empId = job.employer?._id || job.employer;
        return String(empId) === String(userId);
      });
    }

    jobs = jobs.map(populateInMemoryEmployer);
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'open').length;
    const closedJobs = totalJobs - activeJobs;

    return res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
      },
      isInMemory: true,
      jobs,
    });
  } catch (error) {
    console.error('getMyJobs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your job postings.',
    });
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public (Open jobs) / Private (Closed jobs if owner or admin)
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const job = await Job.findById(id).populate(
          'employer',
          'name email companyName companyWebsite companyDescription companyLocation'
        );

        if (job) {
          return res.status(200).json({
            success: true,
            isInMemory: false,
            job,
          });
        }
      } catch (mongoErr) {
        console.warn('MongoDB query warning in getJobById:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const job = inMemoryJobs.find((j) => String(j._id) === String(id));

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    return res.status(200).json({
      success: true,
      isInMemory: true,
      job: populateInMemoryEmployer(job),
    });
  } catch (error) {
    console.error('getJobById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving job details.',
    });
  }
};

/**
 * @desc    Create a new job listing
 * @route   POST /api/jobs
 * @access  Private (Employer / Admin)
 */
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      experience,
      jobType,
      workMode,
      skills,
      description,
      requirements,
      responsibilities,
    } = req.body;

    // Validation
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, company, location, and description.',
      });
    }

    const userId = req.user._id || req.user.id;

    // Normalize array helpers
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === 'string'
      ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const parsedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === 'string'
      ? responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const normalizedWorkMode = ['onsite', 'hybrid', 'remote'].includes(workMode?.toLowerCase())
      ? workMode.toLowerCase()
      : 'onsite';

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const newJob = await Job.create({
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          salary: salary ? salary.trim() : 'Competitive',
          experience: experience || 'Mid Level',
          jobType: jobType || 'Full-time',
          workMode: normalizedWorkMode,
          skills: parsedSkills,
          description: description.trim(),
          requirements: parsedRequirements,
          responsibilities: parsedResponsibilities,
          employer: userId,
          status: 'open',
        });

        await newJob.populate('employer', 'name email companyName companyWebsite companyLocation');

        return res.status(201).json({
          success: true,
          message: 'Job listing posted successfully!',
          isInMemory: false,
          job: newJob,
        });
      } catch (mongoErr) {
        console.warn('MongoDB insert failed in createJob, falling back to in-memory:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const newInMemoryJob = {
      _id: `job-mem-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary ? salary.trim() : 'Competitive',
      experience: experience || 'Mid Level',
      jobType: jobType || 'Full-time',
      workMode: normalizedWorkMode,
      skills: parsedSkills,
      description: description.trim(),
      requirements: parsedRequirements,
      responsibilities: parsedResponsibilities,
      employer: {
        _id: userId,
        name: req.user.name,
        email: req.user.email,
        companyName: company.trim(),
        companyWebsite: req.user.companyWebsite || '',
        companyLocation: location.trim(),
      },
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryJobs.unshift(newInMemoryJob);

    return res.status(201).json({
      success: true,
      message: 'Job listing posted successfully! (Running in in-memory session mode)',
      isInMemory: true,
      job: newInMemoryJob,
    });
  } catch (error) {
    console.error('createJob Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating job listing.',
    });
  }
};

/**
 * @desc    Update an existing job listing
 * @route   PUT /api/jobs/:id
 * @access  Private (Owning Employer / Admin)
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const job = await Job.findById(id);
        if (!job) {
          return res.status(404).json({
            success: false,
            message: 'Job listing not found.',
          });
        }

        // Ownership Verification
        if (!isAdmin && String(job.employer) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to modify this job posting.',
          });
        }

        // Update fields
        const allowedUpdates = [
          'title',
          'company',
          'location',
          'salary',
          'experience',
          'jobType',
          'workMode',
          'skills',
          'description',
          'requirements',
          'responsibilities',
          'status',
        ];

        allowedUpdates.forEach((field) => {
          if (req.body[field] !== undefined) {
            if (field === 'skills' && typeof req.body[field] === 'string') {
              job[field] = req.body[field].split(',').map((s) => s.trim()).filter(Boolean);
            } else if (
              (field === 'requirements' || field === 'responsibilities') &&
              typeof req.body[field] === 'string'
            ) {
              job[field] = req.body[field].split('\n').map((s) => s.trim()).filter(Boolean);
            } else {
              job[field] = req.body[field];
            }
          }
        });

        const updatedJob = await job.save();
        await updatedJob.populate('employer', 'name email companyName companyWebsite companyLocation');

        return res.status(200).json({
          success: true,
          message: 'Job listing updated successfully!',
          isInMemory: false,
          job: updatedJob,
        });
      } catch (mongoErr) {
        console.warn('MongoDB update warning in updateJob:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const jobIndex = inMemoryJobs.findIndex((j) => String(j._id) === String(id));
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    const job = inMemoryJobs[jobIndex];
    const jobEmployerId = job.employer?._id || job.employer;

    if (!isAdmin && String(jobEmployerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to modify this job posting.',
      });
    }

    // Parse array updates if passed as strings
    let parsedSkills = req.body.skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let parsedRequirements = req.body.requirements;
    if (typeof parsedRequirements === 'string') {
      parsedRequirements = parsedRequirements.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    let parsedResponsibilities = req.body.responsibilities;
    if (typeof parsedResponsibilities === 'string') {
      parsedResponsibilities = parsedResponsibilities.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    const updatedInMemoryJob = {
      ...job,
      ...req.body,
      skills: parsedSkills !== undefined ? parsedSkills : job.skills,
      requirements: parsedRequirements !== undefined ? parsedRequirements : job.requirements,
      responsibilities: parsedResponsibilities !== undefined ? parsedResponsibilities : job.responsibilities,
      updatedAt: new Date().toISOString(),
    };

    inMemoryJobs[jobIndex] = updatedInMemoryJob;

    return res.status(200).json({
      success: true,
      message: 'Job listing updated successfully! (In-memory)',
      isInMemory: true,
      job: populateInMemoryEmployer(updatedInMemoryJob),
    });
  } catch (error) {
    console.error('updateJob Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating job listing.',
    });
  }
};

/**
 * @desc    Toggle job status between open and closed
 * @route   PATCH /api/jobs/:id/status
 * @access  Private (Owning Employer / Admin)
 */
const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';
    const newStatus = req.body.status; // Optional target status: 'open' or 'closed'

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const job = await Job.findById(id);
        if (!job) {
          return res.status(404).json({
            success: false,
            message: 'Job listing not found.',
          });
        }

        if (!isAdmin && String(job.employer) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to modify this job status.',
          });
        }

        job.status = newStatus ? newStatus : job.status === 'open' ? 'closed' : 'open';
        await job.save();

        return res.status(200).json({
          success: true,
          message: `Job listing is now marked as ${job.status.toUpperCase()}.`,
          isInMemory: false,
          job,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in toggleJobStatus:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const jobIndex = inMemoryJobs.findIndex((j) => String(j._id) === String(id));
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    const job = inMemoryJobs[jobIndex];
    const jobEmployerId = job.employer?._id || job.employer;

    if (!isAdmin && String(jobEmployerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to modify this job status.',
      });
    }

    const toggledStatus = newStatus ? newStatus : job.status === 'open' ? 'closed' : 'open';
    job.status = toggledStatus;
    job.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: `Job listing is now marked as ${job.status.toUpperCase()}. (In-memory)`,
      isInMemory: true,
      job: populateInMemoryEmployer(job),
    });
  } catch (error) {
    console.error('toggleJobStatus Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating job status.',
    });
  }
};

/**
 * @desc    Delete a job listing
 * @route   DELETE /api/jobs/:id
 * @access  Private (Owning Employer / Admin)
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Try MongoDB if connected
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const job = await Job.findById(id);
        if (!job) {
          return res.status(404).json({
            success: false,
            message: 'Job listing not found.',
          });
        }

        if (!isAdmin && String(job.employer) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to delete this job posting.',
          });
        }

        await Job.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: 'Job listing deleted successfully.',
          isInMemory: false,
        });
      } catch (mongoErr) {
        console.warn('MongoDB delete warning in deleteJob:', mongoErr.message);
      }
    }

    // 2. In-Memory Store Logic
    const jobIndex = inMemoryJobs.findIndex((j) => String(j._id) === String(id));
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    const job = inMemoryJobs[jobIndex];
    const jobEmployerId = job.employer?._id || job.employer;

    if (!isAdmin && String(jobEmployerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to delete this job posting.',
      });
    }

    inMemoryJobs.splice(jobIndex, 1);

    return res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully. (In-memory)',
      isInMemory: true,
    });
  } catch (error) {
    console.error('deleteJob Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting job listing.',
    });
  }
};

module.exports = {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
};
