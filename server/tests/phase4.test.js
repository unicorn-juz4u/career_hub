// server/tests/phase4.test.js
// Automated test suite for Phase 4: Company Profiles, Employer Branding & Verification
const app = require('../app');
const path = require('path');
const fs = require('fs');

async function runPhase4Tests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🧪 Running Phase 4 Company Profile & Branding tests against ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Auth Setup: Log in accounts
    // Seeker (Alex)
    const alexRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'user123' }),
    }).then((r) => r.json());
    assert(alexRes.success && alexRes.token, 'Job seeker (Alex) logs in successfully');
    const alexToken = alexRes.token;

    // Employer 1 (TechCorp)
    const emp1Res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employer@techcorp.com', password: 'employer123' }),
    }).then((r) => r.json());
    assert(emp1Res.success && emp1Res.token, 'Employer 1 (TechCorp) logs in successfully');
    const emp1Token = emp1Res.token;

    // Employer 2 (Cloud Innovate)
    const emp2Res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hiring@cloudinnovate.com', password: 'employer123' }),
    }).then((r) => r.json());
    assert(emp2Res.success && emp2Res.token, 'Employer 2 (Cloud Innovate) logs in successfully');
    const emp2Token = emp2Res.token;

    // Admin
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@jobportal.com', password: 'admin123' }),
    }).then((r) => r.json());
    assert(adminRes.success && adminRes.token, 'Admin logs in successfully');
    const adminToken = adminRes.token;

    // Register a new test employer to test profile creation
    const newEmpEmail = `startup-${Date.now()}@testcorp.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Founder',
        email: newEmpEmail,
        password: 'password123',
        role: 'employer',
      }),
    }).then((r) => r.json());
    assert(regRes.success && regRes.token, 'New employer registers successfully');
    const newEmpToken = regRes.token;

    // Prepare mock valid PNG and invalid TXT file Blobs
    const samplePngBlob = new Blob(['\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRmock_png_image_data'], {
      type: 'image/png',
    });
    const invalidTextBlob = new Blob(['Not an image file'], { type: 'text/plain' });

    // 1. Employer creates company profile (Scenario 1 & 9: Logo upload works)
    const createForm = new FormData();
    createForm.append('name', 'Quantum Robotics Inc');
    createForm.append('industry', 'Robotics & AI');
    createForm.append('companySize', '51-200');
    createForm.append('location', 'Boston, MA');
    createForm.append('website', 'https://quantumrobotics.example.com');
    createForm.append('description', 'Pioneering autonomous industrial robotics and intelligent vision.');
    createForm.append('foundedYear', '2021');
    createForm.append('logo', samplePngBlob, 'robotics_logo.png');

    const createRes = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newEmpToken}` },
      body: createForm,
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 &&
        createData.company?.slug === 'quantum-robotics-inc' &&
        createData.company?.verificationStatus === 'pending',
      'Scenario 1 & 9: Employer creates company profile with logo and initial pending status'
    );
    const newCompanyId = createData.company?._id;

    // 2. Employer edits own company (Scenario 2)
    const editForm = new FormData();
    editForm.append('description', 'Updated: Next-gen AI vision robotics.');
    editForm.append('companySize', '201-500');

    const editRes = await fetch(`${baseUrl}/api/companies/me`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newEmpToken}` },
      body: editForm,
    });
    const editData = await editRes.json();
    assert(
      editRes.status === 200 &&
        editData.company?.description === 'Updated: Next-gen AI vision robotics.' &&
        editData.company?.companySize === '201-500',
      'Scenario 2: Employer edits own company profile information successfully'
    );

    // 3. Public visitor views company (Scenario 3 & 4: Slug works)
    const publicRes = await fetch(`${baseUrl}/api/companies/quantum-robotics-inc`);
    const publicData = await publicRes.json();
    assert(
      publicRes.status === 200 &&
        publicData.company?.name === 'Quantum Robotics Inc' &&
        publicData.company?.slug === 'quantum-robotics-inc',
      'Scenario 3 & 4: Public visitor views company profile by slug'
    );

    // 4. Job Seeker CANNOT create company profile (Scenario 5 authorization)
    const seekerCreate = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: createForm,
    });
    assert(
      seekerCreate.status === 403,
      'Scenario 5a: Job seeker cannot create company profile (403 Forbidden)'
    );

    // 5. Employer cannot self-verify (Scenario 6)
    const hackForm = new FormData();
    hackForm.append('verificationStatus', 'verified');
    const hackRes = await fetch(`${baseUrl}/api/companies/me`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newEmpToken}` },
      body: hackForm,
    });
    const hackData = await hackRes.json();
    assert(
      hackData.company?.verificationStatus === 'pending',
      'Scenario 6: Employer cannot self-verify (verificationStatus remains pending)'
    );

    // 6. Admin verifies company (Scenario 7)
    const verifyRes = await fetch(`${baseUrl}/api/companies/${newCompanyId}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'verified' }),
    });
    const verifyData = await verifyRes.json();
    assert(
      verifyRes.status === 200 &&
        verifyData.company?.verificationStatus === 'verified' &&
        verifyData.company?.verifiedAt !== null,
      'Scenario 7: Admin verifies company profile successfully'
    );

    // 7. Admin rejects company (Scenario 8)
    const rejectRes = await fetch(`${baseUrl}/api/companies/${newCompanyId}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'rejected',
        rejectionReason: 'Invalid business registry documentation provided.',
      }),
    });
    const rejectData = await rejectRes.json();
    assert(
      rejectRes.status === 200 &&
        rejectData.company?.verificationStatus === 'rejected' &&
        rejectData.company?.rejectionReason === 'Invalid business registry documentation provided.',
      'Scenario 8: Admin rejects company with specified reason'
    );

    // 8. Non-admin cannot verify company (Security check)
    const empVerifyHack = await fetch(`${baseUrl}/api/companies/${newCompanyId}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newEmpToken}`,
      },
      body: JSON.stringify({ status: 'verified' }),
    });
    assert(
      empVerifyHack.status === 403,
      'Security: Non-admin employer cannot access verification endpoint (403 Forbidden)'
    );

    // 9. Invalid image format is rejected (Scenario 10)
    // Register another employer for upload test
    const uploadEmpEmail = `uploader-${Date.now()}@uploadcorp.com`;
    const regUpload = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Upload Tester',
        email: uploadEmpEmail,
        password: 'password123',
        role: 'employer',
      }),
    }).then((r) => r.json());

    const badImageForm = new FormData();
    badImageForm.append('name', 'Bad Upload Corp');
    badImageForm.append('industry', 'Software');
    badImageForm.append('location', 'Austin, TX');
    badImageForm.append('description', 'Test bad image upload');
    badImageForm.append('logo', invalidTextBlob, 'malicious_script.txt');

    const badImageRes = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${regUpload.token}` },
      body: badImageForm,
    });
    assert(
      badImageRes.status === 400,
      'Scenario 10: Non-image format upload is rejected (400 Bad Request)'
    );

    // 10. Company active jobs appear on public page (Scenario 11)
    const techCorpPublic = await fetch(`${baseUrl}/api/companies/techcorp-solutions`).then((r) =>
      r.json()
    );
    assert(
      techCorpPublic.success &&
        Array.isArray(techCorpPublic.jobs) &&
        techCorpPublic.jobs.length >= 1,
      'Scenario 11: Company active job openings appear on public company details page'
    );

    // 11. Public companies directory search and filters (Scenario 12)
    const companiesList = await fetch(`${baseUrl}/api/companies?status=all`).then((r) =>
      r.json()
    );
    assert(
      companiesList.success &&
        Array.isArray(companiesList.companies) &&
        companiesList.companies.length >= 2,
      'Scenario 12: Public companies directory lists registered companies (In-Memory Fallback works)'
    );

    console.log(`\n🏁 Phase 4 Test Run Summary: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runPhase4Tests();
