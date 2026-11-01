# 💼 CareerHub - Job Portal Web App

A clean, beginner-friendly full-stack Job Portal web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## 🎯 Project Tech Stack & Design Principles

- **Frontend**: React + Vite, React Router (`react-router-dom`), Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js + Express (**CommonJS**, using `require()`)
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT stored in `localStorage`, passwords hashed with `bcryptjs`
- **File Upload**: Multer, local `/uploads` storage *(Phase 2)*
- **Chat**: Polled every 5 seconds from MongoDB *(Phase 6)*
- **Architecture**: Simple, readable, well-commented code without complex microservices or TypeScript.

---

## 👥 Three Roles & Role-Based Access Control

1. **User (`user`)**: Job Seeker applying to open vacancies and managing their primary resume.
2. **Employer (`employer`)**: Company recruiter posting jobs (1st post free!) and managing candidates.
3. **Admin (`admin`)**: Platform owner managing accounts and subscriptions (created securely via seed script).

Server-side middleware (`authMiddleware.js` and `roleMiddleware.js`) strictly checks JWT tokens and role permissions on every protected route.

---

## 🚀 Phase 1 Features Implemented

- ✅ **Client & Server Structure**: Separate `client/` and `server/` with a single unified `.gitignore`.
- ✅ **CommonJS Backend**: Express backend configured with `require()`, models, routes, controllers, middleware, and config.
- ✅ **Secure Authentication**:
  - `POST /api/auth/register` (Choose role: Job Seeker or Employer)
  - `POST /api/auth/login` (Returns signed JWT valid for 30 days)
  - `GET /api/auth/me` (Protected route for session rehydration)
- ✅ **Server-Side Role Protection**:
  - `GET /api/dashboard/user` (Protected for `user`)
  - `GET /api/dashboard/employer` (Protected for `employer`)
  - `GET /api/dashboard/admin` (Protected for `admin`)
- ✅ **Dedicated Role Dashboards**:
  - `/dashboard/user` — Job Seeker Dashboard
  - `/dashboard/employer` — Employer Hiring Dashboard
  - `/dashboard/admin` — Admin Command Center
- ✅ **Real-World UI**: Removed all developer-analysis/HUD widgets and implemented a clean, production-style web application interface.

---

## 📋 Demo Login Credentials

You can test Phase 1 immediately using these credentials (or by using the **1-Click Demo Buttons** on the Login page):

| Role | Email | Password | Allowed Dashboard |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@jobportal.com` | `admin123` | `/dashboard/admin` |
| **🏢 Employer** | `employer@techcorp.com` | `employer123` | `/dashboard/employer` |
| **💼 Job Seeker** | `alex@example.com` | `user123` | `/dashboard/user` |

---

## ⚡ How to Run and Test Phase 1

### 1. Start the Project
```bash
# Start both Backend (port 5000) and Frontend (port 5173) concurrently:
npm run dev
```

### 2. Test in the Browser
Open **`http://localhost:5173`** in your browser.

1. **Test Registration**:
   - Click **"Get Started"** or navigate to `/register`.
   - Toggle role between **Job Seeker** and **Employer**.
   - Register a new account — notice it automatically redirects you to your role-specific dashboard!
2. **Test Demo Logins**:
   - Go to `/login` and click one of the quick demo buttons (**Job Seeker**, **Employer**, or **Admin**).
   - Sign in to verify each role accesses their distinct dashboard.
3. **Test Role Protection**:
   - While logged in as a Job Seeker, try manually typing `http://localhost:5173/dashboard/admin` in your URL bar — notice it automatically intercepts and protects the route, redirecting you back to your allowed dashboard!
4. **Test Logout**:
   - Click **"Logout"** in the navigation bar to clear your session token from `localStorage`.
