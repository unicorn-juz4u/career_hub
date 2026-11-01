// server/seed.js
// Demo data seeder script: creates 1 Admin, 2 Employers, 5 Job Seekers
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdminAndUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';

  try {
    console.log(`🌱 Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB.');

    // Remove existing seed users to prevent duplicates
    console.log('🧹 Clearing previous users...');
    await User.deleteMany({});

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
    for (const userData of usersToCreate) {
      // User.create triggers the bcrypt password hashing pre-save hook
      await User.create(userData);
    }

    console.log(`🎉 Successfully seeded ${usersToCreate.length} demo accounts!`);
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
