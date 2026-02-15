# ZP Kushtia - Development & Restructuring Plan

## Current State
- **Working**: Scholarship search (complete), Humanitarian Aid search (complete)
- **Stack**: Node.js + Express, MySQL, TailwindCSS (CDN), Vanilla JS, Bengali UI
- **Missing**: Authentication, Dashboard, Project Management, Modular code structure
- **server.js**: 656 lines monolith with all routes inline

---

## Target Directory Structure

```
zpkushtia.info/
├── config/
│   ├── database.js          # MySQL pool (extract from server.js)
│   ├── auth.js              # JWT config
│   └── multer.js            # File upload config
│
├── src/
│   ├── server.js            # Clean entry point (~100 lines)
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── rateLimiter.js   # Rate limiting (extract from server.js)
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── index.js         # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── scholarship.routes.js
│   │   ├── humanitarian.routes.js
│   │   └── projects.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── scholarship.controller.js
│   │   ├── humanitarian.controller.js
│   │   └── projects.controller.js
│   └── models/
│       ├── scholarship.model.js
│       ├── humanitarian.model.js
│       └── projects.model.js
│
├── public/                   # Public pages (no auth)
│   ├── index.html
│   ├── scholarship.html
│   ├── humanitarian_aid.html
│   ├── projects.html         # NEW
│   └── assets/
│       ├── css/common.css
│       ├── js/api.js         # Shared API client
│       └── images/zpk_logo.jpg
│
├── admin/                    # Dashboard (auth required)
│   ├── login.html
│   ├── index.html            # Dashboard home
│   ├── scholarship-manage.html
│   ├── humanitarian-manage.html
│   ├── projects-manage.html
│   └── assets/
│       ├── css/admin.css
│       └── js/auth.js, crud.js
│
├── uploads/projects/         # Project photos (gitignored)
├── ssl/                      # Certificates (gitignored)
├── favicon/
├── database_setup.sql        # Updated with new tables
├── package.json
└── .gitignore
```

---

**Note:** The root-level HTML files (`scholarship.html`, `humanitarian_aid.html`) are legacy backups and will be removed later. Only the `public/` copies need updating since `src/server.js` serves static files from `public/`.

---

## Implementation Phases

### Phase 1: Restructure & Modularize Backend — ✅ DONE
**Goal**: Break monolithic server.js into clean modules

1. Create `config/database.js` - extract MySQL pool from server.js
2. Create `src/middleware/rateLimiter.js` - extract rate limiting
3. Create `src/middleware/errorHandler.js` - global error handler
4. Create models: extract DB queries into `src/models/scholarship.model.js` and `humanitarian.model.js`
5. Create controllers: extract request handling into `src/controllers/`
6. Create routes: wire up `src/routes/` with controllers
7. Create new `src/server.js` entry point (~100 lines)
8. Move HTML files to `public/` and serve via Express static
9. Update `package.json` scripts to point to `src/server.js`
10. Keep old `server.js` as backup until verified

### Phase 2: Authentication System (Multi-User with Roles)
**Goal**: Secure admin routes with JWT, support Admin and Normal User roles

**Roles:**
- **Admin**: Full access - CRUD all data, manage users, delete records, manage projects
- **Normal User**: Limited access - view dashboard, add/edit records, upload photos. Cannot delete records or manage users.

**Database:**
```sql
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Steps:**
1. Install: `jsonwebtoken`, `bcryptjs`
2. Create `admin_users` table with role column (admin/user)
3. Create `config/auth.js` - JWT secret, expiry (24h)
4. Create `src/middleware/auth.js` - JWT verification + role check middleware
   - `requireAuth` - any logged-in user
   - `requireAdmin` - admin role only
5. Create `src/routes/auth.routes.js`:
   - POST `/api/auth/login` - login
   - POST `/api/auth/logout` - logout
   - GET `/api/auth/me` - get current user info
   - POST `/api/auth/users` - create user (admin only)
   - GET `/api/auth/users` - list users (admin only)
   - PUT `/api/auth/users/:id` - update user (admin only)
   - DELETE `/api/auth/users/:id` - deactivate user (admin only)
6. Create `admin/login.html` - login page with Bengali UI
7. Create user management section in admin dashboard (admin only)
8. Seed default admin user (password to be changed on first login)

**Permission Matrix:**
| Action               | Admin | Normal User |
|---------------------|-------|-------------|
| View dashboard      | Yes   | Yes         |
| Search/view records | Yes   | Yes         |
| Add records         | Yes   | Yes         |
| Edit records        | Yes   | Yes         |
| Delete records      | Yes   | No          |
| Upload photos       | Yes   | Yes         |
| Delete photos       | Yes   | No          |
| Manage users        | Yes   | No          |

### Phase 3: CRUD Dashboard
**Goal**: Admin panel for scholarship & humanitarian data with role-based UI

1. Create `admin/index.html` - dashboard home with stats overview
2. Create `admin/scholarship-manage.html`:
   - Data table with search, pagination
   - Add/Edit forms (modal) - visible to all logged-in users
   - Delete button - visible to admin role only
3. Create `admin/humanitarian-manage.html` (same pattern)
4. Create `admin/users-manage.html` - user management (admin only)
5. Add CRUD API endpoints:
   - POST `/api/scholarship/create` (requireAuth)
   - PUT `/api/scholarship/:id/update` (requireAuth)
   - DELETE `/api/scholarship/:id/delete` (requireAdmin)
   - Same pattern for humanitarian
6. Create `admin/assets/js/crud.js` - reusable CRUD logic
7. Create `admin/assets/js/auth.js` - token management, role-based UI toggle, auto-redirect

### Phase 4: Project Management Tool (MOST IMPORTANT)
**Goal**: Full project tracking with photo uploads

**Database tables:**
```sql
-- projects table
id, project_name, description, budget DECIMAL(12,2),
location, upazila, start_date, expected_completion,
actual_completion, status ENUM('planned','ongoing','completed','suspended'),
progress_percentage INT(0-100), category, contractor_name,
contractor_phone, remarks, created_by, created_at, updated_at

-- project_photos table
id, project_id (FK), photo_path, photo_type ENUM('before','during','after'),
caption, uploaded_by, uploaded_at, display_order
```

**Backend:**
1. Install: `multer`, `sharp`
2. Create `config/multer.js` - storage config, 5MB limit, jpg/png/webp only
3. Create `src/models/projects.model.js` - all CRUD + photo queries
4. Create `src/controllers/projects.controller.js` - with image processing
5. Create `src/routes/projects.routes.js`:
   - Public: GET search, GET by id, GET photos, GET stats
   - Admin: POST create, PUT update, DELETE, POST upload photos, DELETE photo

**Frontend - Public (`public/projects.html`):**
- Search by name, location, contractor
- Filter by upazila, status, category
- Card layout with progress bar, status badge, thumbnail
- Detail modal with photo gallery

**Frontend - Admin (`admin/projects-manage.html`):**
- Table view with all projects
- Add/Edit project form
- Progress slider (0-100%)
- Drag-and-drop photo upload
- Photo gallery management (reorder, delete, caption, type)

### Phase 5: Frontend Cleanup & Polish
1. Extract shared JS into `public/assets/js/api.js` (API client)
2. Extract shared CSS into `public/assets/css/common.css`
3. Update existing HTML pages to use shared modules
4. Add navigation between all tools (scholarship, humanitarian, projects)
5. Update `public/index.html` to be a landing page with links to all tools

### Phase 6: Git Cleanup & Documentation
1. Update `.gitignore` - add `uploads/`, ensure `ssl/`, `.env` excluded
2. Remove data PDFs from tracking (they contain source data)
3. Update `README.md` with new structure and setup instructions
4. Create `.env.example` with all required variables
5. Clean commit history if needed

---

## New Dependencies
```
jsonwebtoken    # JWT auth
bcryptjs        # Password hashing
multer          # File uploads
sharp           # Image processing
```

---

## Key Files to Modify
- `server.js` → refactor into `src/server.js` + modules
- `database_setup.sql` → add admin_users, projects, project_photos tables
- `package.json` → add dependencies, update scripts
- `.gitignore` → add uploads/, remove tracked files that shouldn't be
- `scholarship.html` → move to `public/`, update asset paths
- `humanitarian_aid.html` → move to `public/`, update asset paths
- `index.html` → convert to landing page

## Deployment (ServBay + Nginx)
- Nginx (ServBay) handles SSL termination on port 443
- Nginx reverse-proxies to `http://localhost:3000` (Node.js HTTP port)
- Node.js HTTPS (port 3443) is not needed when behind Nginx — Nginx handles SSL
- Start server: `npm start` (production) or `npm run dev` (development)
- Legacy fallback: `npm run legacy` (runs old root server.js)

## Verification Plan
1. After each phase, run `node src/server.js` and test all existing endpoints still work
2. Test auth: `curl -X POST /api/auth/login` with credentials
3. Test CRUD: create/read/update/delete via API calls
4. Test photo upload: upload image via form, verify resize/storage
5. Test public pages: search functionality still works after restructuring
6. Test on mobile: responsive design verification
7. Run `git status` to ensure no sensitive files are tracked
