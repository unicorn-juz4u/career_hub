// server/controllers/companyController.js
// Company profile and employer branding controller with MongoDB & In-Memory Fallback
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Job = require('../models/Job');
const User = require('../models/User');
const { inMemoryJobs } = require('./jobController');
const { createNotificationHelper } = require('./notificationController');
const { getDbStatus } = require('../config/db');

// Helper to generate clean slugs from company name
const generateSlug = (name) => {
  if (!name) return 'company';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// In-Memory Fallback Store for Companies
let inMemoryCompanies = [
  {
    _id: 'company-seed-1',
    name: 'TechCorp Solutions',
    slug: 'techcorp-solutions',
    logo: '',
    coverImage: '',
    industry: 'Software & Cloud Infrastructure',
    companySize: '201-500',
    website: 'https://techcorp.example.com',
    location: 'San Francisco, CA',
    description: 'Leading enterprise cloud, AI infrastructure and digital product engineering provider.',
    foundedYear: 2016,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp',
      github: 'https://github.com/techcorp',
      facebook: '',
    },
    employer: 'seed-emp-1',
    employerObj: {
      _id: 'seed-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
    },
    verificationStatus: 'verified',
    verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: '',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'company-seed-2',
    name: 'Cloud Innovate Labs',
    slug: 'cloud-innovate-labs',
    logo: '',
    coverImage: '',
    industry: 'Cloud Consulting & SaaS',
    companySize: '51-200',
    website: 'https://cloudinnovate.example.com',
    location: 'Austin, TX',
    description: 'Next-generation web applications, microservices architecture, and cloud consultancy.',
    foundedYear: 2019,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/cloudinnovate',
      twitter: 'https://twitter.com/cloudinnovate',
      github: 'https://github.com/cloudinnovate',
      facebook: '',
    },
    employer: 'seed-emp-2',
    employerObj: {
      _id: 'seed-emp-2',
      name: 'David Miller',
      email: 'hiring@cloudinnovate.com',
    },
    verificationStatus: 'pending',
    verifiedAt: null,
    rejectionReason: '',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * @desc    Get all public companies with optional filtering and pagination
 * @route   GET /api/companies
 * @access  Public
 */
const getCompanies = async (req, res) => {
  try {
    const { search = '', industry = '', status = '', page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;

    // 1. MongoDB Query
    if (getDbStatus()) {
      try {
        const query = {};

        // Verification status filter (default: verified for public unless specified)
        if (status && status !== 'all') {
          query.verificationStatus = status;
        }

        // Industry filter
        if (industry && industry !== 'all') {
          query.industry = new RegExp(industry, 'i');
        }

        // Search filter (name, location, industry, description)
        if (search.trim()) {
          const s = search.trim();
          query.$or = [
            { name: new RegExp(s, 'i') },
            { location: new RegExp(s, 'i') },
            { industry: new RegExp(s, 'i') },
            { description: new RegExp(s, 'i') },
          ];
        }

        const totalCompanies = await Company.countDocuments(query);
        const companies = await Company.find(query)
          .populate('employer', 'name email companyName')
          .sort({ verificationStatus: -1, createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);

        return res.json({
          success: true,
          count: totalCompanies,
          totalPages: Math.ceil(totalCompanies / limitNum) || 1,
          currentPage: pageNum,
          companies,
          isInMemory: false,
        });
      } catch (mongoErr) {
        console.warn('MongoDB getCompanies fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    let filtered = [...inMemoryCompanies];

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.verificationStatus === status);
    }

    if (industry && industry !== 'all') {
      filtered = filtered.filter((c) =>
        c.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    const totalCount = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      count: totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      companies: paginated,
      isInMemory: true,
    });
  } catch (error) {
    console.error('getCompanies Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving companies.',
    });
  }
};

/**
 * @desc    Get single company profile by slug (with active job openings)
 * @route   GET /api/companies/:slug
 * @access  Public
 */
const getCompanyBySlug = async (req, res) => {
  try {
    const slugParam = (req.params.slug || '').toLowerCase().trim();

    // 1. MongoDB Query
    if (getDbStatus()) {
      try {
        const company = await Company.findOne({ slug: slugParam }).populate(
          'employer',
          'name email companyName companyWebsite companyLocation companyDescription'
        );

        if (company) {
          // Fetch active jobs from this company's employer
          const employerId = company.employer?._id || company.employer;
          const jobs = await Job.find({ employer: employerId, status: 'open' })
            .sort({ createdAt: -1 })
            .limit(20);

          return res.json({
            success: true,
            company,
            jobs,
            isInMemory: false,
          });
        }
      } catch (mongoErr) {
        console.warn('MongoDB getCompanyBySlug fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    const company = inMemoryCompanies.find(
      (c) => c.slug.toLowerCase() === slugParam
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with slug "${slugParam}" was not found.`,
      });
    }

    // Match active jobs from inMemoryJobs
    const employerIdStr = String(company.employer?._id || company.employer);
    const jobs = (inMemoryJobs || []).filter(
      (j) =>
        String(j.employer?._id || j.employer) === employerIdStr &&
        j.status === 'open'
    );

    return res.json({
      success: true,
      company,
      jobs,
      isInMemory: true,
    });
  } catch (error) {
    console.error('getCompanyBySlug Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving company details.',
    });
  }
};

/**
 * @desc    Get authenticated employer's company profile
 * @route   GET /api/companies/me
 * @access  Private (Employer, Admin)
 */
const getEmployerCompany = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1. MongoDB Query
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const company = await Company.findOne({ employer: userId }).populate(
          'employer',
          'name email companyName'
        );

        if (company) {
          return res.json({
            success: true,
            company,
            isInMemory: false,
          });
        }
      } catch (mongoErr) {
        console.warn('MongoDB getEmployerCompany fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    const company = inMemoryCompanies.find(
      (c) => String(c.employer?._id || c.employer) === String(userId)
    );

    return res.json({
      success: true,
      company: company || null,
      message: company ? 'Company profile retrieved.' : 'No company profile registered yet.',
      isInMemory: true,
    });
  } catch (error) {
    console.error('getEmployerCompany Error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving employer's company profile.",
    });
  }
};

/**
 * @desc    Create company profile for authenticated employer
 * @route   POST /api/companies
 * @access  Private (Employer, Admin)
 */
const createCompany = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Check employer role
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employers and administrators can create company profiles.',
      });
    }

    const {
      name,
      industry,
      companySize = '11-50',
      website = '',
      location,
      description,
      foundedYear,
      socialLinks: rawSocial,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    if (!industry || !industry.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company industry is required.',
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company headquarters / location is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company description is required.',
      });
    }

    // Parse social links if passed as string or object
    let socialLinks = {
      linkedin: '',
      twitter: '',
      github: '',
      facebook: '',
    };

    if (rawSocial) {
      if (typeof rawSocial === 'string') {
        try {
          socialLinks = { ...socialLinks, ...JSON.parse(rawSocial) };
        } catch (e) {
          // ignore
        }
      } else if (typeof rawSocial === 'object') {
        socialLinks = { ...socialLinks, ...rawSocial };
      }
    }

    // Process image uploads if provided
    let logo = '';
    let coverImage = '';
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logo = `/uploads/companies/${req.files.logo[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImage = `/uploads/companies/${req.files.coverImage[0].filename}`;
      }
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let finalSlug = baseSlug;

    // 1. Try MongoDB
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        // Prevent duplicate company for same employer
        const existing = await Company.findOne({ employer: userId });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'You already have a registered company profile. Please update your existing profile.',
          });
        }

        // Check slug collision
        let collision = await Company.findOne({ slug: finalSlug });
        if (collision) {
          finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const newCompany = await Company.create({
          name: name.trim(),
          slug: finalSlug,
          logo,
          coverImage,
          industry: industry.trim(),
          companySize: companySize.trim(),
          website: website.trim(),
          location: location.trim(),
          description: description.trim(),
          foundedYear: parseInt(foundedYear, 10) || new Date().getFullYear(),
          socialLinks,
          employer: userId,
          verificationStatus: 'pending', // Enforce pending status!
          verifiedAt: null,
          rejectionReason: '',
        });

        // Also update User's companyName if blank
        await User.findByIdAndUpdate(userId, {
          companyName: name.trim(),
          companyWebsite: website.trim(),
          companyLocation: location.trim(),
          companyDescription: description.trim(),
        });

        return res.status(201).json({
          success: true,
          message: 'Company profile created successfully and submitted for administrator verification.',
          company: newCompany,
          isInMemory: false,
        });
      } catch (mongoErr) {
        console.warn('MongoDB createCompany fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    const existingMemory = inMemoryCompanies.find(
      (c) => String(c.employer?._id || c.employer) === String(userId)
    );
    if (existingMemory) {
      return res.status(400).json({
        success: false,
        message: 'You already have a registered company profile. Please update your existing profile.',
      });
    }

    // Check slug collision in memory
    const slugCollision = inMemoryCompanies.some((c) => c.slug === finalSlug);
    if (slugCollision) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newInMemoryCompany = {
      _id: `company-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      logo,
      coverImage,
      industry: industry.trim(),
      companySize: companySize.trim(),
      website: website.trim(),
      location: location.trim(),
      description: description.trim(),
      foundedYear: parseInt(foundedYear, 10) || new Date().getFullYear(),
      socialLinks,
      employer: String(userId),
      employerObj: {
        _id: String(userId),
        name: req.user.name,
        email: req.user.email,
      },
      verificationStatus: 'pending',
      verifiedAt: null,
      rejectionReason: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryCompanies.unshift(newInMemoryCompany);

    return res.status(201).json({
      success: true,
      message: 'Company profile created successfully (In-Memory Fallback).',
      company: newInMemoryCompany,
      isInMemory: true,
    });
  } catch (error) {
    console.error('createCompany Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating company profile.',
    });
  }
};

/**
 * @desc    Update authenticated employer's company profile
 * @route   PUT /api/companies/me
 * @access  Private (Employer, Admin)
 */
const updateEmployerCompany = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      name,
      industry,
      companySize,
      website,
      location,
      description,
      foundedYear,
      socialLinks: rawSocial,
      // NOTE: verificationStatus is explicitly NOT destructured to prevent self-verification!
    } = req.body;

    // Process new images if uploaded
    let newLogo = null;
    let newCoverImage = null;
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        newLogo = `/uploads/companies/${req.files.logo[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        newCoverImage = `/uploads/companies/${req.files.coverImage[0].filename}`;
      }
    }

    // 1. Try MongoDB
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const company = await Company.findOne({ employer: userId });
        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'No company profile found for this employer. Please create one first.',
          });
        }

        if (name && name.trim()) {
          company.name = name.trim();
          // Optionally update slug if requested or keep stable
          const newSlug = generateSlug(name);
          const collision = await Company.findOne({ slug: newSlug, _id: { $ne: company._id } });
          if (!collision) {
            company.slug = newSlug;
          }
        }

        if (industry) company.industry = industry.trim();
        if (companySize) company.companySize = companySize.trim();
        if (website !== undefined) company.website = website.trim();
        if (location) company.location = location.trim();
        if (description) company.description = description.trim();
        if (foundedYear) company.foundedYear = parseInt(foundedYear, 10) || company.foundedYear;

        if (rawSocial) {
          let parsedSocial = {};
          if (typeof rawSocial === 'string') {
            try {
              parsedSocial = JSON.parse(rawSocial);
            } catch (e) {}
          } else if (typeof rawSocial === 'object') {
            parsedSocial = rawSocial;
          }
          company.socialLinks = {
            linkedin: parsedSocial.linkedin ?? company.socialLinks?.linkedin ?? '',
            twitter: parsedSocial.twitter ?? company.socialLinks?.twitter ?? '',
            github: parsedSocial.github ?? company.socialLinks?.github ?? '',
            facebook: parsedSocial.facebook ?? company.socialLinks?.facebook ?? '',
          };
        }

        if (newLogo) company.logo = newLogo;
        if (newCoverImage) company.coverImage = newCoverImage;

        // Save company (verificationStatus remains untouched)
        const updated = await company.save();

        return res.json({
          success: true,
          message: 'Company profile updated successfully.',
          company: updated,
          isInMemory: false,
        });
      } catch (mongoErr) {
        console.warn('MongoDB updateEmployerCompany fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    const companyIndex = inMemoryCompanies.findIndex(
      (c) => String(c.employer?._id || c.employer) === String(userId)
    );

    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No company profile found for this employer. Please create one first.',
      });
    }

    const company = inMemoryCompanies[companyIndex];

    if (name && name.trim()) {
      company.name = name.trim();
      const newSlug = generateSlug(name);
      const collision = inMemoryCompanies.some(
        (c) => c.slug === newSlug && String(c._id) !== String(company._id)
      );
      if (!collision) {
        company.slug = newSlug;
      }
    }

    if (industry) company.industry = industry.trim();
    if (companySize) company.companySize = companySize.trim();
    if (website !== undefined) company.website = website.trim();
    if (location) company.location = location.trim();
    if (description) company.description = description.trim();
    if (foundedYear) company.foundedYear = parseInt(foundedYear, 10) || company.foundedYear;

    if (rawSocial) {
      let parsed = {};
      if (typeof rawSocial === 'string') {
        try {
          parsed = JSON.parse(rawSocial);
        } catch (e) {}
      } else if (typeof rawSocial === 'object') {
        parsed = rawSocial;
      }
      company.socialLinks = {
        linkedin: parsed.linkedin ?? company.socialLinks?.linkedin ?? '',
        twitter: parsed.twitter ?? company.socialLinks?.twitter ?? '',
        github: parsed.github ?? company.socialLinks?.github ?? '',
        facebook: parsed.facebook ?? company.socialLinks?.facebook ?? '',
      };
    }

    if (newLogo) company.logo = newLogo;
    if (newCoverImage) company.coverImage = newCoverImage;

    company.updatedAt = new Date().toISOString();
    inMemoryCompanies[companyIndex] = company;

    return res.json({
      success: true,
      message: 'Company profile updated successfully (In-Memory Fallback).',
      company,
      isInMemory: true,
    });
  } catch (error) {
    console.error('updateEmployerCompany Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating company profile.',
    });
  }
};

/**
 * @desc    Verify or reject company profile (Admin only)
 * @route   PATCH /api/companies/:id/verification
 * @access  Private (Admin)
 */
const updateCompanyVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason = '' } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be "pending", "verified", or "rejected".',
      });
    }

    // 1. Try MongoDB
    if (getDbStatus()) {
      try {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
          query._id = id;
        } else {
          query.slug = id;
        }

        const company = await Company.findOne(query);
        if (company) {
          company.verificationStatus = status;
          company.verifiedAt = status === 'verified' ? new Date() : null;
          company.rejectionReason = status === 'rejected' ? rejectionReason.trim() : '';
          const updated = await company.save();

          // Send notification to employer
          await createNotificationHelper({
            recipient: company.employer,
            sender: req.user._id,
            type: status === 'verified' ? 'COMPANY_VERIFIED' : 'COMPANY_REJECTED',
            title: status === 'verified' ? 'Company Verified! 🌟' : 'Company Verification Update',
            message:
              status === 'verified'
                ? `Your company profile "${company.name}" has been officially verified by CareerHub administrators.`
                : `Your company verification for "${company.name}" was ${status}: ${rejectionReason || 'Please review your company details.'}`,
          });

          return res.json({
            success: true,
            message: `Company profile verification status updated to "${status}".`,
            company: updated,
            isInMemory: false,
          });
        }
      } catch (mongoErr) {
        console.warn('MongoDB updateCompanyVerification fallback:', mongoErr.message);
      }
    }

    // 2. In-Memory Fallback
    const companyIndex = inMemoryCompanies.findIndex(
      (c) => String(c._id) === String(id) || c.slug === id
    );

    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    const company = inMemoryCompanies[companyIndex];
    company.verificationStatus = status;
    company.verifiedAt = status === 'verified' ? new Date().toISOString() : null;
    company.rejectionReason = status === 'rejected' ? rejectionReason.trim() : '';
    company.updatedAt = new Date().toISOString();
    inMemoryCompanies[companyIndex] = company;

    // Send notification
    await createNotificationHelper({
      recipient: company.employer,
      sender: req.user._id || req.user.id,
      type: status === 'verified' ? 'COMPANY_VERIFIED' : 'COMPANY_REJECTED',
      title: status === 'verified' ? 'Company Verified! 🌟' : 'Company Verification Update',
      message:
        status === 'verified'
          ? `Your company profile "${company.name}" has been officially verified by CareerHub administrators.`
          : `Your company verification for "${company.name}" was ${status}: ${rejectionReason || 'Please review your company details.'}`,
    });

    return res.json({
      success: true,
      message: `Company profile verification status updated to "${status}". (In-Memory Fallback)`,
      company,
      isInMemory: true,
    });
  } catch (error) {
    console.error('updateCompanyVerification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating company verification.',
    });
  }
};

module.exports = {
  getCompanies,
  getCompanyBySlug,
  getEmployerCompany,
  createCompany,
  updateEmployerCompany,
  updateCompanyVerification,
  inMemoryCompanies,
};
