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
  - Seamless in-memory fallback store (`inMemoryJobs`) pre-seeded with 6 rich tech positions for demo employers.
  - Ownership protection enforced in both MongoDB and in-memory modes.
- ✅ **Public Job Listing Page** (`client/src/pages/Jobs.jsx`):
  - Real-time search by keyword, title, skills, and description.
  - Location search filter.
  - Select filters for Job Type, Work Mode (`Remote`, `Hybrid`, `On-Site`), and Experience level.
  - Server-side pagination controls with active page indicator.
  - Elegant skeleton loading states and empty state with 1-click filter reset.
- ✅ **Job Details Page** (`client/src/pages/JobDetails.jsx`):
  - Comprehensive view of salary, experience, work mode, and posted dates.
  - Full role overview, key responsibilities list, and qualifications list.
  - Desired tech stack pills and employer profile sidebar.
  - "Apply for this Position" action button with Phase 3 informational placeholder modal.
- ✅ **Employer Dashboard Real-Time Integration** (`client/src/pages/dashboards/EmployerDashboard.jsx`):
  - Real stats cards: Total Postings, Active (Open), Closed, and Plan tier.
  - Interactive job management table with responsive layout.
  - Actions: View Public Details, Edit (pre-populated modal), Close/Reopen status toggle, and Delete.
  - Destructive action confirmation dialogs.
  - "Post New Job Listing" button integrated with enhanced `AddJobModal`.

---

## 📋 Demo Login Credentials

Test the application immediately using the pre-seeded credentials (or click the **1-Click Demo Buttons** on the Login page):

| Role | Email | Password | Assigned Dashboard |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@jobportal.com` | `admin123` | `/dashboard/admin` |
| **🏢 Employer 1** | `employer@techcorp.com` | `employer123` | `/dashboard/employer` |
| **🏢 Employer 2** | `hiring@cloudinnovate.com` | `employer123` | `/dashboard/employer` |
| **💼 Job Seeker** | `alex@example.com` | `user123` | `/dashboard/user` |

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

### 3. Run Automated System Test Suite
```bash
node /home/a/.gemini/antigravity-ide/brain/8bfec0d3-ffde-4c53-a231-05de34d7fe6f/scratch/test_job_system.js
```

---

## 🧪 Step-by-Step Feature Testing Guide

### Scenario 1: Browse Public Jobs & Filter
1. Navigate to `http://localhost:5173/jobs` (or click **"Browse Jobs"** in the navigation bar).
2. Type `React` in the search box — notice the list instantly filters to matching positions.
3. Select **Work Mode: Remote** — notice only remote jobs are displayed.
4. Click on any job card or **"View Details & Requirements"** to open the full job page (`/jobs/:id`).
5. Click **"Apply for this Position"** to verify the Phase 3 application modal pops up.

### Scenario 2: Employer Job Management & Posting
1. Go to `/login` and click the **"Employer"** quick demo button (`employer@techcorp.com`).
2. You will be automatically redirected to `/dashboard/employer`.
3. Notice the real metrics: Total Postings, Active Postings, and Closed Postings.
4. Click **"Post New Job Listing"** in the banner or above the table.
5. Fill in the job details (e.g. Title: `Principal Cloud Architect`, Location: `San Francisco, CA`, Work Mode: `Remote`, Description, etc.) and click **Publish Job Listing**.
6. The new job listing immediately appears in your table and the counters update in real time.
7. Click the **Close / Reopen** power icon on the job row to toggle its status to Closed.
8. Switch to the public `/jobs` page — verify that the closed job is automatically hidden from public visitors.
9. Click **Edit** on your job to update compensation or requirements.
10. Click **Delete** to remove the listing after confirming the modal prompt.

### Scenario 3: Authorization & Security Verification
1. Log in as a **Job Seeker** (`alex@example.com`).
2. Try sending a `POST /api/jobs` request — verify it is intercepted and rejected with `403 Forbidden`.
3. Log in as **Employer 2** (`hiring@cloudinnovate.com`).
4. Try modifying or deleting a job created by **Employer 1** — verify it is rejected with `403 Forbidden (Access denied)`.
5. Log in as **Admin** (`admin@jobportal.com`) — verify the admin can manage all platform listings and inspect open jobs.
