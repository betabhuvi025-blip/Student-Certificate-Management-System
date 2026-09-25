# 🎓 Student Event Tracker

A full-stack web application designed for a college **Information Technology Department** to centralize student co-curricular achievements (hackathons, workshops, NPTEL courses, paper presentations, symposiums) with certificate uploads, faculty verification, and accreditation reporting (NAAC/NBA).

---

## 🚀 Key Features

### 1. 👥 Multi-Role Access Control (RBAC)
- **Student**:
  - Register & update academic profile (Roll No, Year, Section, Department).
  - Submit achievement records with certificate uploads (PDF, JPG, PNG &le; 5MB).
  - Portfolio management (search, filter by category/status, edit resubmission, delete).
  - Personal analytics dashboard (Total entries, Approved wins vs participations, Pending count, Points).
  - In-app notification bell with real-time review feedback.
  - Department leaderboard rank tracking.
- **Faculty Advisor**:
  - Review queue for assigned / departmental student submissions.
  - One-click certificate inspection modal.
  - Approve submissions (auto-credits activity points: Win = 10 pts, Participated = 5 pts).
  - Reject submissions with mandatory constructive remarks/reason.
  - Real-time in-app notification dispatch to students on status updates.
- **Head of Department (HOD)**:
  - Executive department analytics dashboard:
    - **Line Chart**: Participation trend over time.
    - **Doughnut Chart**: Category-wise distribution (Hackathons, Workshops, NPTEL, etc.).
    - **Bar Chart**: Year-wise student participation & approval rate.
    - **Top Performers Table**: Current semester points leaders.
  - Full department approval authority.
  - Accreditation reports generator with multi-filter export to **CSV** and print-ready **PDF**.

### 2. 🏆 Points & Leaderboard System
- **Win / 1st / 2nd Place**: 10 points
- **Participation**: 5 points
- Live podium display (🥇 Gold, 🥈 Silver, 🥉 Bronze) with ties handled properly.

### 3. 📄 Export & Accreditation Engine
- Multi-parameter filtering: Academic Year, Section, Department, Category, Event Level (Inter-college, National, etc.), Status, Date range.
- **CSV Export**: Clean spreadsheet output formatted for administration.
- **PDF Print View**: Official college header, department seal, metrics summary, itemized table, and Faculty / HOD signature blocks.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Lucide Icons, Chart.js / React-Chartjs-2 |
| **Backend** | Node.js, Express 5, Multer (file upload & validation), Bcrypt.js, JSON Web Tokens (JWT) |
| **Database** | PostgreSQL (DDL migrations included) + Resilient Zero-Setup Embedded SQLite Fallback |
| **Storage** | Local `/uploads` directory for certificates (strictly validated for MIME type & size) |

---

## ⚡ Quick Demo Accounts (1-Click Login on UI)

The login screen features **1-Click Quick Demo Login** buttons for instant evaluation:

| Role | Name | Email | Password | Academic Details |
|---|---|---|---|---|
| **Student** | Priya Sharma | `student@college.edu` | `Password123!` | Roll: `21IT042`, 3rd Year, Sec A |
| **Student** | Rahul Verma | `rahul@college.edu` | `Password123!` | Roll: `21IT088`, 3rd Year, Sec B |
| **Student** | Ananya Iyer | `ananya@college.edu` | `Password123!` | Roll: `20IT015`, 4th Year, Sec A |
| **Student** | Karthik Raja | `karthik@college.edu` | `Password123!` | Roll: `22IT104`, 2nd Year, Sec C |
| **Faculty** | Dr. Rajesh Kumar | `faculty@college.edu` | `Password123!` | IT Faculty Advisor |
| **HOD** | Dr. Anand Mohan | `hod@college.edu` | `Password123!` | Head of IT Department |

---

## 📦 Project Structure

```
STUDENT-EVENT-TRACKER/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # PostgreSQL client with seamless SQLite fallback
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, Login, Refresh token, GetMe
│   │   │   ├── profileController.js     # Profile CRUD & student listings
│   │   │   ├── achievementController.js # Achievement CRUD & uploads
│   │   │   ├── approvalController.js    # Approval workflow & student notifications
│   │   │   ├── analyticsController.js   # Student & Department analytics + Leaderboard
│   │   │   ├── notificationController.js# Notification management
│   │   │   └── exportController.js      # CSV and report data generation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verification
│   │   │   ├── roleMiddleware.js        # RBAC role authorization
│   │   │   └── uploadMiddleware.js      # Multer file size & type validation
│   │   ├── models/
│   │   │   └── schema.sql               # PostgreSQL schema DDL
│   │   ├── routes/                      # Express route modules
│   │   ├── seeds/
│   │   │   └── seed.js                  # Preloaded demo users, certificates & entries
│   │   └── server.js                    # Express app & static uploads
│   ├── uploads/                         # Certificate storage directory
│   ├── test-api.js                      # Automated API verification test suite
│   ├── .env                             # Environment configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                # API client with token interceptor & session refresh
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Top navigation with role badge & notifications
│   │   │   ├── Sidebar.jsx              # Role-aware sidebar navigation
│   │   │   ├── StatusBadge.jsx          # Approved / Pending / Rejected badges
│   │   │   ├── StatCard.jsx             # KPI metric cards
│   │   │   ├── CertificateModal.jsx     # Certificate document previewer
│   │   │   ├── ConfirmationModal.jsx    # Review & deletion confirmation modals
│   │   │   ├── NotificationDropdown.jsx # In-app notification popover
│   │   │   └── EmptyState.jsx           # Clean zero-data empty state
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Auth provider & persistent session
│   │   │   └── NotificationContext.jsx  # Notification polling & read status
│   │   ├── pages/
│   │   │   ├── Login.jsx                # Login with 1-click quick demo buttons
│   │   │   ├── Register.jsx             # Account registration with role/academic fields
│   │   │   ├── StudentDashboard.jsx     # Student stats, category breakdown, submissions
│   │   │   ├── Portfolio.jsx            # Achievement portfolio with filters & actions
│   │   │   ├── AddAchievementModal.jsx  # Add/edit entry with certificate upload
│   │   │   ├── ApprovalsList.jsx        # Faculty verification & approval queue
│   │   │   ├── HODDashboard.jsx         # Department analytics with interactive charts
│   │   │   ├── Leaderboard.jsx          # Points ranking with top 3 podium
│   │   │   ├── ReportsExport.jsx        # Accreditation reports with CSV/PDF export
│   │   │   ├── Profile.jsx              # Academic profile updates & badges
│   │   │   └── NotFound.jsx             # 404 / 500 error page
│   │   ├── App.jsx
│   │   ├── index.css                    # Academic deep blue CSS design system
│   │   └── main.jsx
│   ├── vite.config.js                   # Vite config with backend proxy
│   └── package.json
├── package.json                         # Root workspace scripts
└── README.md
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **NPM** (v9 or higher)
- *(Optional)* **PostgreSQL** (v13+). If PostgreSQL is not installed or configured, the application **automatically uses the built-in SQLite engine** (`tracker.db`) with zero setup needed!

### 1. Clone & Install Dependencies
From the repository root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
The backend configuration is stored in `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=student_event_tracker_jwt_secret_dev_2026
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=student_event_tracker_refresh_secret_dev_2026
REFRESH_TOKEN_EXPIRES_IN=7d
UPLOAD_DIR=uploads

# Optional PostgreSQL Connection URL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_event_tracker
```

### 3. Database Migration & Seeding
To populate realistic demo data (students, faculty, HOD, certificates, and achievements in different statuses):
```bash
cd backend
npm run seed
```

### 4. Run the Automated Backend Test Suite
Verify that all 14 API modules, auth flows, and export endpoints work:
```bash
cd backend
node test-api.js
```

### 5. Start the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

## 🔒 Security Measures
1. **Password Hashing**: Passwords hashed using `bcryptjs` with 10 salt rounds.
2. **JWT Sessions**: Short-lived access tokens with secure refresh token rotation.
3. **Role-Based Middleware**: Route protection guards on every endpoint (`authenticate` + `authorize(['student', 'faculty', 'hod'])`).
4. **File Validation**: Server-side MIME type and extension checking, limited strictly to PDF, JPG, PNG and max 5MB.
5. **SQL Injection Prevention**: All queries use parameterized inputs (`$1, $2` or `?`).

---

## 📄 License
MIT &bull; Developed for College IT Department Academic Portals.
