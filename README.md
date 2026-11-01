# 💼 CareerHub - Full-Stack Job Portal Web App

A modern, production-grade full-stack Job Portal web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## 🎯 Tech Stack & Architectural Principles

- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS v3 (Dark Theme), Axios, Lucide React
- **Backend**: Node.js + Express (**CommonJS**, `require()`), CORS, RESTful API architecture
- **Database**: MongoDB + Mongoose, featuring an **automatic in-memory fallback** so all CRUD, authentication, and filter functionality works immediately even if local MongoDB is offline.
- **Authentication & Security**: Signed JWT stored in `localStorage`, `bcryptjs` password hashing, role-based access control middleware (`authMiddleware.js`, `roleMiddleware.js`), and ownership validation.
- **File Storage**: Prepared local `/uploads` storage for resumes and profile photos.

---

## 👥 Three Distinct Roles & Permissions

1. **Job Seeker (`user`)**: Browse open positions with real-time keyword search, work mode, location, and type filters. View detailed requirements, responsibilities, and employer profiles.
2. **Employer (`employer`)**: Manage hiring pipelines, create/edit job postings, view real-time statistics (total, active, closed postings), toggle listing status (Open/Closed), and delete listings.
3. **Admin (`admin`)**: Super-user governance with platform-wide oversight, user account monitoring, and system-wide job management.

---

## 🚀 Implemented Phases & Features

### Phase 1: Authentication & Role-Based Access Control
- ✅ CommonJS Express backend with models, routes, controllers, middleware, and database config.
- ✅ Full JWT Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- ✅ Client-side authentication context (`AuthContext.jsx`) with session rehydration.
- ✅ Protected route guards (`ProtectedRoute.jsx`) and role dashboards:
  - `/dashboard/user` — Job Seeker Dashboard
  - `/dashboard/employer` — Employer Hiring Dashboard
  - `/dashboard/admin` — Admin Command Center

### Phase 2: Complete Job Management System
- ✅ **Job Mongoose Model** (`server/models/Job.js`):
  - Fields: `title`, `company`, `location`, `salary`, `experience`, `jobType`, `workMode` (`onsite`, `hybrid`, `remote`), `skills`, `description`, `requirements`, `responsibilities`, `employer` (ref: `User`), `status` (`open`, `closed`), and timestamps.
  - Multi-key indexes for fast text search and filter performance.
- ✅ **Complete Backend Job CRUD Endpoints** (`server/routes/jobRoutes.js`, `server/controllers/jobController.js`):
  - `GET /api/jobs`: Public listing with keyword search, location, jobType, workMode, experience, and pagination.
  - `GET /api/jobs/my-jobs`: Private (Employer/Admin) endpoint returning jobs owned by current employer with status metrics (`totalJobs`, `activeJobs`, `closedJobs`).
  - `GET /api/jobs/:id`: Public single-job detail endpoint with populated employer metadata.
  - `POST /api/jobs`: Private (Employer/Admin) endpoint to publish vacancies.
  - `PUT /api/jobs/:id`: Private endpoint with ownership check to edit job details.
  - `PATCH /api/jobs/:id/status`: Private endpoint to toggle job status between `open` and `closed`.
  - `DELETE /api/jobs/:id`: Private endpoint with ownership check to permanently delete a listing.
- ✅ **Database & Fallback Persistence**:
  - Full MongoDB Mongoose support.
  - Seamless in-memory fallback store pre-seeded with rich tech positions.
  - Ownership protection enforced in both MongoDB and in-memory modes.

### Phase 3: Complete Job Application Management System
- ✅ **Application Model** (`server/models/Application.js`):
  - Fields: `job` (ref: `Job`), `applicant` (ref: `User`), `employer` (ref: `User`), `resume` (safe file path), `coverLetter` (String), `status` (Enum: `'Applied'`, `'Under Review'`, `'Shortlisted'`, `'Interview Scheduled'`, `'Hired'`, `'Rejected'`), `interviewDate`, `interviewNotes`, `appliedAt`, `updatedAt`.
  - Compound unique index on `{ job: 1, applicant: 1 }` preventing duplicate applications from the same candidate.
- ✅ **Protected Resume Storage via Multer** (`server/middleware/uploadMiddleware.js`):
  - Stored outside public static routes in `server/secure_uploads/resumes/`.
  - PDF format only (`application/pdf`), maximum 5 MB limit.
  - MIME type and file extension verification with crypto-safe unique filename generation.
- ✅ **Complete Application REST APIs** (`server/routes/applicationRoutes.js`, `server/controllers/applicationController.js`):
  - `POST /api/applications`: Authenticated job seeker application flow with resume PDF upload, closed-job check, and duplicate check.
  - `GET /api/applications/me`: Candidate view of their own application history with pipeline statistics.
  - `GET /api/applications/:id`: Detailed view of a single application with ownership verification.
  - `GET /api/applications/job/:jobId`: Hiring employer / Admin view of applicants for a specific job listing.
  - `GET /api/applications/employer`: Overview of all applicants across the employer's active jobs with pipeline metrics.
  - `GET /api/applications/:id/resume`: Protected resume streaming endpoint verifying that `req.user` is the candidate, the hiring employer, or an admin.
  - `PATCH /api/applications/:id/status`: Employer-controlled status progression (`Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Hired` / `Rejected`) with optional interview date/notes.
  - `DELETE /api/applications/:id`: Application withdrawal (candidate) or removal (admin) with file cleanup.
- ✅ **In-App Notification System** (`server/models/Notification.js`, `server/controllers/notificationController.js`, `server/routes/notificationRoutes.js`):
  - Automated triggers on Application submission, Candidate Shortlisting, Interview Scheduling, Rejection, and Hiring.
  - `GET /api/notifications`: Retrieve unread and recent notifications.
  - `PATCH /api/notifications/:id/read` & `PATCH /api/notifications/read-all`: Mark alerts read.
- ✅ **Job Seeker Dashboard** (`client/src/pages/dashboards/UserDashboard.jsx`):
  - 6 pipeline metric cards: Total Applications, Under Review, Shortlisted, Interviews, Hired, Rejected.
  - Comprehensive application history table with company, job title, date, live badge, and actions.
  - Application inspection modal and confirmation dialog for application withdrawal.
- ✅ **Employer Dashboard** (`client/src/pages/dashboards/EmployerDashboard.jsx`):
  - Applicant pipeline counters: Total Applicants, New Applications, Shortlisted, Interviews, Hired.
  - Filterable candidate table (by status and search).
  - Review candidate profile & cover letter modal.
  - Secure PDF resume viewer launcher.
  - Status progression actions (Shortlist, Schedule Interview modal with date/time and notes, Hire, Reject).
- ✅ **Live Apply Modal on Job Details** (`client/src/pages/JobDetails.jsx`):
  - PDF drag-and-drop / file selector with size and type validation.
  - Cover letter text area.
  - Pre-submission checks (unauthenticated redirect, role check, closed job prevention, duplicate application banner).
- ✅ **Interactive Navbar Notification Bell** (`client/src/components/Navbar.jsx`):
  - Real-time polling with unread badge count.
  - Dropdown popover with quick status alerts and one-click "Mark all as read".
### Phase 4: Company Profiles, Employer Branding & Verification
- ✅ **Company Model** (`server/models/Company.js`):
  - Fields: `name`, `slug` (unique lowercase URL-safe slug), `logo`, `coverImage`, `industry`, `companySize`, `website`, `location`, `description`, `foundedYear`, `socialLinks` (`linkedin`, `twitter`, `github`, `facebook`), `employer` (ref: `User`), `verificationStatus` (Enum: `'pending'`, `'verified'`, `'rejected'`), `verifiedAt`, `rejectionReason`, timestamps.
  - Full-text indexes and slug auto-generation helper.
- ✅ **Company Image Uploads via Multer** (`server/middleware/companyUploadMiddleware.js`):
  - Supports Logo & Cover image upload (`JPG`, `PNG`, `WebP`).
  - Strict 5 MB file size limit and MIME-type / extension verification.
  - Stored in publicly accessible `server/uploads/companies/` directory with unique safe filenames.
- ✅ **Complete Company REST APIs** (`server/routes/companyRoutes.js`, `server/controllers/companyController.js`):
  - `POST /api/companies`: Private (`employer`, `admin`) to create profile with logo/cover; initial status always `pending`.
  - `GET /api/companies`: Public listing with keyword search, industry filter, verification status filter, and pagination.
  - `GET /api/companies/:slug`: Public single company profile by slug, populated with active job openings from this employer.
  - `GET /api/companies/me`: Private (`employer`, `admin`) to retrieve the authenticated employer's company profile.
  - `PUT /api/companies/me`: Private (`employer`, `admin`) to update company profile and branding images (strictly blocks self-verification).
  - `PATCH /api/companies/:id/verification`: Private (`admin` only) to verify or reject company profiles with feedback reason and automated notifications.
- ✅ **Public Company Pages**:
  - `client/src/pages/Companies.jsx` (`/companies`): Searchable and filterable directory of employers with verified badges.
  - `client/src/pages/CompanyDetails.jsx` (`/companies/:slug`): Public profile showcasing logo, cover image, verified badge, headquarters, size, about overview, social links, and live active job openings.
- ✅ **Employer Company Dashboard** (`client/src/pages/dashboards/CompanyDashboard.jsx`):
  - Route: `/dashboard/company`
  - Logo and Cover banner upload with real-time browser preview.
  - Company overview editor (name, industry, size, location, website, founded year, description, social profiles).
  - Prominent verification status banner (`Verified`, `Pending Review`, `Rejected` with feedback).
  - "Preview Public Profile" direct link button.
- ✅ **Admin Verification Command Center** (`client/src/pages/dashboards/AdminDashboard.jsx`):
  - Real-time counters: Pending Verifications, Verified Companies, Rejected Verifications, and Rejected Applications.
  - Company verification review table with status filter.
  - Interactive Review Details modal and Confirmation Dialogs for verifying or rejecting with reason.
- ✅ **Job Integration**:
  - Company names and avatars in `JobCard.jsx` and `JobDetails.jsx` dynamically link to `/companies/:slug`.
- ✅ **Dual Database & In-Memory Fallback Persistence**:
  - Pre-seeded in-memory companies for TechCorp Solutions (`verified`) and Cloud Innovate Labs (`pending`).
  - Seamless fallback support across all endpoints and filters.

---

## 📋 Demo Login Credentials

Test the application immediately using the pre-seeded credentials (or click the **1-Click Demo Buttons** on the Login page):

| Role | Email | Password | Assigned Dashboard |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@jobportal.com` | `admin123` | `/dashboard/admin` |
| **🏢 Employer 1** | `employer@techcorp.com` | `employer123` | `/dashboard/employer` |
| **🏢 Employer 2** | `hiring@cloudinnovate.com` | `employer123` | `/dashboard/employer` |
| **💼 Job Seeker (Alex)** | `alex@example.com` | `user123` | `/dashboard/user` |
| **💼 Job Seeker (Emily)** | `emily@example.com` | `user123` | `/dashboard/user` |

---

## ⚡ How to Run and Test

### 1. Start Client & Server Concurrently
```bash
npm run dev
```
- Backend REST API: `http://localhost:5000`
- Frontend Web App: `http://localhost:5173`

### 2. Run Production Build Validation
```bash
npm run build
```

### 3. Run Automated System Test Suite (All 16 Phase 3 Scenarios)
```bash
npm test
```
Or directly:
```bash
node server/tests/phase3.test.js
```

---

## 🧪 Step-by-Step Feature Testing Guide

### Scenario 1: Job Seeker Applies to a Position
1. Log in as **Job Seeker (Alex)** (`alex@example.com`) or click the demo button.
2. Go to **"Browse Jobs"** (`/jobs`) and click on any open position (e.g. `UI/UX Product Designer`).
3. Click **"Apply for this Position"**.
4. Attach a PDF resume (max 5 MB) and enter a cover letter.
5. Click **"Submit Application"**. Verify the modal confirms submission and displays the updated status badge.
6. Open `/dashboard/user` — verify the application appears in your history table and application metrics increment.

### Scenario 2: Duplicate Prevention & Closed Job Guard
1. Navigate back to the same job page where you just applied.
2. Notice the button displays **"Already Applied"** with your current status.
3. If an unauthenticated user or employer clicks apply, proper role guards prevent invalid submissions.
4. Try applying to a closed job — the system rejects the submission with a clear error.

### Scenario 3: Employer Reviews Candidates & Updates Pipeline
1. Log in as **Employer 1** (`employer@techcorp.com`).
2. Navigate to `/dashboard/employer`.
3. In the **"Candidate Pipeline & Applications"** section, review incoming candidates.
4. Click **"View Details"** to inspect the candidate's profile, cover letter, and contact info.
5. Click **"View Resume (PDF)"** to securely stream the candidate's protected resume.
6. Click **"Shortlist"** or **"Schedule Interview"** (enter interview date, time, and instructions).
7. Confirm status changes — the candidate table and pipeline metric counters update immediately.

### Scenario 4: Notifications & Candidate Status Updates
1. When Employer 1 shortlists Alex or schedules an interview, a notification is generated.
2. Log back in as **Alex Rivera** (`alex@example.com`).
3. Check the **Notification Bell** in the top navigation bar — notice the unread count badge.
4. Click the bell to view the update (e.g., *"Interview Scheduled: TechCorp scheduled an interview for UI/UX Product Designer"*).
5. Open `/dashboard/user` to see the updated status badge.

### Scenario 5: Security & Ownership Protection
1. Log in as **Employer 2** (`hiring@cloudinnovate.com`).
2. Attempt to view applicants or download resumes for jobs belonging to **Employer 1** (`employer@techcorp.com`).
3. Verify that requests are blocked with `403 Forbidden`.
4. Verify that candidates cannot alter application statuses (`PATCH /api/applications/:id/status` returns `403 Forbidden`).

