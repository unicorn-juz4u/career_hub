// server/seed.js
// Demo data seeder script: creates 1 Admin, 2 Employers, 5 Job Seekers
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const Company = require('./models/Company');

const seedAdminAndUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';

  try {
    console.log(`🌱 Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB.');

    // Remove existing seed users, jobs, applications, notifications & companies to prevent duplicates
    console.log('🧹 Clearing previous users, jobs, applications, notifications & companies...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await Company.deleteMany({});

    // Demo Data
    const usersToCreate = [
      // 1. Admin
      {
        name: 'System Admin',
        email: 'admin@jobportal.com',
        password: 'admin123',
        role: 'admin',
        plan: 'pro',
      },
      // 2. Employers
      {
        name: 'Sarah Jenkins',
        email: 'employer@techcorp.com',
        password: 'employer123',
        role: 'employer',
        plan: 'growth',
        companyName: 'TechCorp Solutions',
        companyWebsite: 'https://techcorp.example.com',
        companyLocation: 'San Francisco, CA',
        companyDescription: 'Leading enterprise cloud and AI infrastructure provider.',
      },
      {
        name: 'David Miller',
        email: 'hiring@cloudinnovate.com',
        password: 'employer123',
        role: 'employer',
        plan: 'basic',
        companyName: 'Cloud Innovate Labs',
        companyWebsite: 'https://cloudinnovate.example.com',
        companyLocation: 'Austin, TX',
        companyDescription: 'Next-generation web applications and cloud consulting.',
      },
      // 3. Job Seekers (Users)
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: 'user123',
        role: 'user',
        city: 'New York, NY',
        phone: '+1 555-0101',
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js'],
        education: 'B.S. in Computer Science, NYU',
        experience: '2 years as Frontend Developer at WebStudio',
        jobPreferences: 'Remote Full-time Software Engineer',
      },
      {
        name: 'Emily Chen',
        email: 'emily@example.com',
        password: 'user123',
        role: 'user',
        city: 'Seattle, WA',
        phone: '+1 555-0102',
        skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
        education: 'B.S. in Software Engineering, UW',
        experience: '3 years Backend Engineer at FinTech Corp',
        jobPreferences: 'Hybrid Backend Engineer',
      },
      {
        name: 'Michael Patel',
        email: 'michael@example.com',
        password: 'user123',
        role: 'user',
        city: 'Chicago, IL',
        phone: '+1 555-0103',
        skills: ['UI/UX Design', 'Figma', 'HTML/CSS', 'Tailwind'],
        education: 'B.A. in Digital Design, DePaul University',
        experience: '1 year Product Designer at Creative Agency',
        jobPreferences: 'UI/UX Designer',
      },
      {
        name: 'Jessica Taylor',
        email: 'jessica@example.com',
        password: 'user123',
        role: 'user',
        city: 'Austin, TX',
        phone: '+1 555-0104',
        skills: ['Python', 'Django', 'React', 'MongoDB'],
        education: 'Self-taught Full Stack Developer',
        experience: 'Freelance web developer for 2 years',
        jobPreferences: 'Full Stack Developer',
      },
      {
        name: 'Robert Garcia',
        email: 'robert@example.com',
        password: 'user123',
        role: 'user',
        city: 'Denver, CO',
        phone: '+1 555-0105',
        skills: ['QA Automation', 'Cypress', 'JavaScript', 'Jest'],
        education: 'B.S. in Information Systems, CU Boulder',
        experience: '2 years QA Specialist',
        jobPreferences: 'QA Automation Engineer',
      },
    ];

    console.log('Inserting seed accounts...');
    const createdUsers = {};
    for (const userData of usersToCreate) {
      // User.create triggers the bcrypt password hashing pre-save hook
      const created = await User.create(userData);
      createdUsers[created.email] = created;
    }

    console.log(`🎉 Successfully seeded ${usersToCreate.length} demo accounts!`);

    // Seed Jobs for TechCorp and Cloud Innovate
    console.log('Inserting initial job listings...');
    const techCorpEmployer = createdUsers['employer@techcorp.com'];
    const cloudEmployer = createdUsers['hiring@cloudinnovate.com'];

    const jobsToCreate = [
      {
        title: 'Senior Full-Stack Engineer (React & Node.js)',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA / Remote',
        salary: '$135,000 - $165,000',
        experience: 'Senior',
        jobType: 'Full-time',
        workMode: 'remote',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
        description: 'Lead the architecture and delivery of modern enterprise cloud products.',
        requirements: [
          '5+ years building full-stack JavaScript web applications',
          'Strong expertise with React 18 and Node.js REST APIs',
          'Experience with MongoDB indexing and aggregation pipelines',
        ],
        responsibilities: [
          'Design and maintain scalable full-stack applications',
          'Collaborate closely with UX designers and backend engineers',
          'Champion engineering best practices and peer reviews',
        ],
        employer: techCorpEmployer._id,
        status: 'open',
      },
      {
        title: 'Lead Frontend Architect',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        salary: '$150,000 - $185,000',
        experience: 'Lead / Exec',
        jobType: 'Full-time',
        workMode: 'hybrid',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
        description: 'Drive the vision and technical strategy for our customer-facing portals.',
        requirements: [
          '7+ years in frontend engineering with 2+ years leading teams',
          'Deep expertise in modern CSS architectures and accessibility',
        ],
        responsibilities: [
          'Define long-term frontend architecture across multiple properties',
          'Mentor junior and mid-level software engineers',
        ],
        employer: techCorpEmployer._id,
        status: 'open',
      },
      {
        title: 'Cloud Infrastructure & DevOps Engineer',
        company: 'Cloud Innovate Labs',
        location: 'Austin, TX',
        salary: '$125,000 - $155,000',
        experience: 'Mid Level',
        jobType: 'Full-time',
        workMode: 'onsite',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
        description: 'Build resilient cloud infrastructure and automate deployment pipelines.',
        requirements: [
          '3+ years managing production workloads on AWS',
          'Hands-on experience with Kubernetes and Docker',
        ],
        responsibilities: [
          'Maintain and expand automated CI/CD deployment pipelines',
          'Implement proactive monitoring and alerting with Prometheus',
        ],
        employer: cloudEmployer._id,
        status: 'open',
      },
      {
        title: 'Junior Backend Developer',
        company: 'Cloud Innovate Labs',
        location: 'Austin, TX / Remote',
        salary: '$75,000 - $95,000',
        experience: 'Entry Level',
        jobType: 'Full-time',
        workMode: 'remote',
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git'],
        description: 'Collaborate with senior engineers to build RESTful web services.',
        requirements: [
          'Solid understanding of JavaScript and Node.js fundamentals',
          'Basic knowledge of Express routing and MongoDB CRUD operations',
        ],
        responsibilities: [
          'Implement API endpoints under senior guidance',
          'Write unit tests and participate in sprint standups',
        ],
        employer: cloudEmployer._id,
        status: 'open',
      },
      {
        title: 'UI/UX Product Designer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA / Remote',
        salary: '$105,000 - $130,000',
        experience: 'Mid Level',
        jobType: 'Contract',
        workMode: 'remote',
        skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
        description: 'Shape the user experience of next-gen SaaS portals.',
        requirements: [
          '3+ years designing complex SaaS products and responsive web applications',
          'Mastery of Figma components and interactive prototyping',
        ],
        responsibilities: [
          'Conduct user interviews and usability testing',
          'Produce wireframes, clickable mockups, and specs',
        ],
        employer: techCorpEmployer._id,
        status: 'open',
      },
    ];

    const createdJobs = [];
    for (const jobData of jobsToCreate) {
      const created = await Job.create(jobData);
      createdJobs.push(created);
    }
    console.log(`🎉 Successfully seeded ${createdJobs.length} active job listings!`);

    // Seed Applications
    console.log('Inserting candidate applications & notifications...');
    const alexRivera = createdUsers['alex@example.com'];
    const emilyChen = createdUsers['emily@example.com'];

    const app1 = await Application.create({
      job: createdJobs[0]._id, // Senior Full-Stack Engineer at TechCorp
      applicant: alexRivera._id,
      employer: techCorpEmployer._id,
      resume: 'secure_uploads/resumes/seed-alex-rivera-resume.pdf',
      coverLetter: 'I am excited to bring my 5 years of MERN stack development to TechCorp Solutions.',
      status: 'Shortlisted',
      interviewDate: null,
      interviewNotes: 'Strong profile, qualified for technical screen.',
    });

    const app2 = await Application.create({
      job: createdJobs[1]._id, // Lead Frontend Architect at TechCorp
      applicant: emilyChen._id,
      employer: techCorpEmployer._id,
      resume: 'secure_uploads/resumes/seed-emily-chen-resume.pdf',
      coverLetter: 'Passionate about frontend performance, design tokens, and modular systems.',
      status: 'Under Review',
    });

    const app3 = await Application.create({
      job: createdJobs[3]._id, // Junior Backend Developer at Cloud Innovate
      applicant: emilyChen._id,
      employer: cloudEmployer._id,
      resume: 'secure_uploads/resumes/seed-emily-chen-resume.pdf',
      coverLetter: 'I would love to help scale microservices and APIs with your engineering team.',
      status: 'Interview Scheduled',
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      interviewNotes: 'Technical round scheduled for Thursday 2:00 PM EST via Google Meet.',
    });

    // Seed Notifications
    await Notification.create([
      {
        recipient: alexRivera._id,
        sender: techCorpEmployer._id,
        type: 'APPLICATION_SHORTLISTED',
        title: 'Application Shortlisted! 🎉',
        message: 'Your application for "Senior Full-Stack Engineer (React & Node.js)" at TechCorp Solutions has been shortlisted.',
        application: app1._id,
        job: createdJobs[0]._id,
        isRead: false,
      },
      {
        recipient: techCorpEmployer._id,
        sender: emilyChen._id,
        type: 'APPLICATION_RECEIVED',
        title: 'New Candidate Application! 📄',
        message: 'Emily Chen submitted an application for "Lead Frontend Architect".',
        application: app2._id,
        job: createdJobs[1]._id,
        isRead: false,
      },
      {
        recipient: emilyChen._id,
        sender: cloudEmployer._id,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled! 📅',
        message: 'Your interview for "Junior Backend Developer" at Cloud Innovate Labs is scheduled.',
        application: app3._id,
        job: createdJobs[3]._id,
        isRead: false,
      },
    ]);

    // Seed Companies
    console.log('Inserting seed company profiles...');
    await Company.create([
      {
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
        employer: techCorpEmployer._id,
        verificationStatus: 'verified',
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
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
        employer: cloudEmployer._id,
        verificationStatus: 'pending',
        verifiedAt: null,
      },
    ]);

    console.log(`🎉 Successfully seeded demo applications, notifications, and company profiles!`);
    console.log(`
═════════════════════════════════════════════════════════════
📋 DEMO LOGIN CREDENTIALS:
-------------------------------------------------------------
👑 ADMIN:      admin@jobportal.com      / admin123
🏢 EMPLOYER:   employer@techcorp.com    / employer123
💼 JOB SEEKER: alex@example.com         / user123
═════════════════════════════════════════════════════════════
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedAdminAndUsers();
