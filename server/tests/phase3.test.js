// Comprehensive automated test suite for Phase 3 Job Application Management System
const app = require('../app');
const path = require('path');
const fs = require('fs');

async function runPhase3Tests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🧪 Running Phase 3 Job Application Management tests against ${baseUrl}`);

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
    // Seeker 1: Alex Rivera
    const alexRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'user123' }),
    }).then((r) => r.json());
    assert(alexRes.success && alexRes.token, 'Job seeker (Alex) logs in successfully');
    const alexToken = alexRes.token;

    // Seeker 2: Emily Chen
    const emilyRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'emily@example.com', password: 'user123' }),
    }).then((r) => r.json());
    assert(emilyRes.success && emilyRes.token, 'Job seeker (Emily) logs in successfully');
    const emilyToken = emilyRes.token;

    // Employer 1: Sarah Jenkins (TechCorp)
    const emp1Res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employer@techcorp.com', password: 'employer123' }),
    }).then((r) => r.json());
    assert(emp1Res.success && emp1Res.token, 'Employer 1 (TechCorp) logs in successfully');
    const emp1Token = emp1Res.token;

    // Employer 2: David Miller (Cloud Innovate)
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

    // Prepare a mock PDF buffer & invalid text file buffer for Multer testing
    const samplePdfBlob = new Blob(['%PDF-1.4\n%mock PDF file for automated testing\n%%EOF'], {
      type: 'application/pdf',
    });
    const invalidTextBlob = new Blob(['This is not a pdf file'], { type: 'text/plain' });

    // Target a job to apply to (e.g. job-seed-5 UI/UX Product Designer at TechCorp)
    const targetJobId = 'job-seed-5';

    // 1. Job seeker successfully applies with valid PDF resume (Scenario 1 & 12)
    const formData = new FormData();
    formData.append('jobId', targetJobId);
    formData.append('coverLetter', 'Excited to apply with full design & engineering credentials.');
    formData.append('resume', samplePdfBlob, 'alex_resume.pdf');

    const applyRes = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${alexToken}`,
      },
      body: formData,
    });
    const applyData = await applyRes.json();
    assert(
      applyRes.status === 201 && applyData.application?._id,
      'Scenario 1 & 12: Job seeker successfully applies with valid PDF resume'
    );
    const newAppId = applyData.application?._id;

    // 2. Duplicate application is rejected (Scenario 2)
    const dupFormData = new FormData();
    dupFormData.append('jobId', targetJobId);
    dupFormData.append('coverLetter', 'Trying to apply again');
    dupFormData.append('resume', samplePdfBlob, 'alex_resume_dup.pdf');

    const dupRes = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: dupFormData,
    });
    assert(
      dupRes.status === 400,
      'Scenario 2: Duplicate application to the same job is rejected (400 Bad Request)'
    );

    // 3. Job seeker can view their application history (Scenario 3)
    const historyRes = await fetch(`${baseUrl}/api/applications/me`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    }).then((r) => r.json());
    const alexHasApp = historyRes.applications?.some(
      (a) => (a._id || a.id) === newAppId
    );
    assert(
      historyRes.success && alexHasApp && historyRes.stats?.total >= 1,
      'Scenario 3: Job seeker views their application history and metrics'
    );

    // 4. Employer 1 can view applicants for their own jobs (Scenario 4)
    const emp1AppsRes = await fetch(`${baseUrl}/api/applications/employer`, {
      headers: { Authorization: `Bearer ${emp1Token}` },
    }).then((r) => r.json());
    const emp1SeesNewApp = emp1AppsRes.applications?.some(
      (a) => (a._id || a.id) === newAppId
    );
    assert(
      emp1AppsRes.success && emp1SeesNewApp,
      "Scenario 4: Employer 1 can view applicants for their own jobs"
    );

    // 5. Employer 2 CANNOT view Employer 1's applicants for Employer 1's job (Scenario 5)
    const emp2JobInspect = await fetch(`${baseUrl}/api/applications/job/${targetJobId}`, {
      headers: { Authorization: `Bearer ${emp2Token}` },
    });
    assert(
      emp2JobInspect.status === 403,
      "Scenario 5: Employer 2 cannot view applicants for another employer's job (403 Forbidden)"
    );

    // 6. Employer 1 can shortlist candidates (Scenario 6)
    const shortlistRes = await fetch(`${baseUrl}/api/applications/${newAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Token}`,
      },
      body: JSON.stringify({ status: 'Shortlisted' }),
    }).then((r) => r.json());
    assert(
      shortlistRes.success && shortlistRes.application.status === 'Shortlisted',
      'Scenario 6: Employer can shortlist candidates'
    );

    // 7. Employer 1 can schedule interviews (Scenario 7)
    const interviewRes = await fetch(`${baseUrl}/api/applications/${newAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Token}`,
      },
      body: JSON.stringify({
        status: 'Interview Scheduled',
        interviewDate: new Date(Date.now() + 86400000).toISOString(),
        interviewNotes: 'Interview with Design Lead on Zoom',
      }),
    }).then((r) => r.json());
    assert(
      interviewRes.success && interviewRes.application.status === 'Interview Scheduled',
      'Scenario 7: Employer can schedule interviews with date and notes'
    );

    // 8. Employer 1 can reject candidates (Scenario 8)
    const rejectRes = await fetch(`${baseUrl}/api/applications/${newAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Token}`,
      },
      body: JSON.stringify({ status: 'Rejected' }),
    }).then((r) => r.json());
    assert(
      rejectRes.success && rejectRes.application.status === 'Rejected',
      'Scenario 8: Employer can reject candidate applications'
    );

    // 9. Employer 1 can mark candidate as Hired (Scenario 9)
    const hiredRes = await fetch(`${baseUrl}/api/applications/${newAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Token}`,
      },
      body: JSON.stringify({ status: 'Hired' }),
    }).then((r) => r.json());
    assert(
      hiredRes.success && hiredRes.application.status === 'Hired',
      'Scenario 9: Employer can mark candidate as Hired'
    );

    // 10. Job seeker CANNOT change application status (Scenario 10)
    const seekerHack = await fetch(`${baseUrl}/api/applications/${newAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ status: 'Hired' }),
    });
    assert(
      seekerHack.status === 403,
      'Scenario 10: Job seeker cannot change application status (403 Forbidden)'
    );

    // 11. Closed jobs reject new applications (Scenario 11)
    await fetch(`${baseUrl}/api/jobs/job-seed-6/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp2Token}`,
      },
      body: JSON.stringify({ status: 'closed' }),
    });

    const applyClosedForm = new FormData();
    applyClosedForm.append('jobId', 'job-seed-6');
    applyClosedForm.append('resume', samplePdfBlob, 'emily_resume.pdf');

    const closedApplyRes = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${emilyToken}` },
      body: applyClosedForm,
    });
    assert(
      closedApplyRes.status === 400,
      'Scenario 11: Closed jobs reject new applications (400 Bad Request)'
    );

    // Reopen job-seed-6
    await fetch(`${baseUrl}/api/jobs/job-seed-6/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp2Token}`,
      },
      body: JSON.stringify({ status: 'open' }),
    });

    // 13. Invalid file formats are rejected (Scenario 13)
    const badFileForm = new FormData();
    badFileForm.append('jobId', targetJobId);
    badFileForm.append('resume', invalidTextBlob, 'malicious.txt');

    const badFileRes = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${emilyToken}` },
      body: badFileForm,
    });
    assert(
      badFileRes.status === 400,
      'Scenario 13: Non-PDF file uploads are rejected with 400'
    );

    // 14. Unauthorized resume access is blocked (Scenario 14)
    const unauthorizedResume = await fetch(`${baseUrl}/api/applications/${newAppId}/resume`, {
      headers: { Authorization: `Bearer ${emp2Token}` },
    });
    assert(
      unauthorizedResume.status === 403,
      'Scenario 14: Unauthorized resume access by unrelated employer is blocked (403 Forbidden)'
    );

    // Authorized resume access by candidate or hiring employer succeeds
    const authorizedResume = await fetch(`${baseUrl}/api/applications/${newAppId}/resume`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(
      authorizedResume.status === 200 && authorizedResume.headers.get('content-type')?.includes('application/pdf'),
      'Authorized candidate can access their own resume PDF'
    );

    // 15. Admin can inspect all applications across platform (Scenario 15)
    const adminApps = await fetch(`${baseUrl}/api/applications/employer`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(
      adminApps.success && adminApps.applications?.length >= 3,
      'Scenario 15: Admin can inspect all platform applications'
    );

    // 16. In-memory notifications work
    const notifsRes = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    }).then((r) => r.json());
    assert(
      notifsRes.success && Array.isArray(notifsRes.notifications),
      'Scenario 16: In-memory notifications generated and retrieved for candidate'
    );

    console.log(`\n🏁 Phase 3 Test Run Summary: ${passed} Passed, ${failed} Failed`);
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

runPhase3Tests();
