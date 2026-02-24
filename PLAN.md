# ZP Kushtia - Development & Restructuring Plan

## Current State (as of 2026-02-23)
- **Working**: Scholarship search, Humanitarian Aid search, Projects public page, Admin dashboard (full CRUD), Authentication system, Project management tool
- **Stack**: Node.js + Express, MySQL, TailwindCSS (CDN), Vanilla JS, Bengali UI
- **Architecture**: Fully modular MVC structure (routes → controllers → models)
- **Phases Complete**: Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅ (mostly), Phase 5 (partial)

---

## Target Directory Structure

```
zpkushtia.info/
├── config/
│   ├── database.js          ✅ MySQL pool
│   ├── auth.js              ✅ JWT config
│   └── multer.js            ✅ File upload config
│
├── src/
│   ├── server.js            ✅ Clean entry point
│   ├── middleware/
│   │   ├── auth.js          ✅ JWT verification + role check
│   │   ├── rateLimiter.js   ✅ Rate limiting
│   │   └── errorHandler.js  ✅
│   ├── routes/
│   │   ├── index.js         ✅ Route aggregator
│   │   ├── auth.routes.js   ✅
│   │   ├── scholarship.routes.js   ✅
│   │   ├── humanitarian.routes.js  ✅
│   │   ├── projects.routes.js      ✅
│   │   └── users.routes.js         ✅
│   ├── controllers/
│   │   ├── auth.controller.js          ✅
│   │   ├── scholarship.controller.js   ✅
│   │   ├── humanitarian.controller.js  ✅
│   │   ├── projects.controller.js      ✅
│   │   └── users.controller.js         ✅
│   └── models/
│       ├── scholarship.model.js   ✅
│       ├── humanitarian.model.js  ✅
│       ├── projects.model.js      ✅
│       └── users.model.js         ✅
│
├── public/                   ✅ Public pages
│   ├── dashboard.html        ✅
│   ├── scholarship.html      ✅
│   ├── humanitarian_aid.html ✅
│   ├── projects.html         ✅
│   └── assets/
│       ├── css/
│       ├── js/
│       └── images/
│
├── admin/                    ✅ Dashboard (auth required)
│   ├── login.html            ✅
│   ├── index.html            ✅ Dashboard home
│   ├── profile.html          ✅
│   ├── scholarship-manage.html   ✅
│   ├── humanitarian-manage.html  ✅
│   ├── projects-manage.html      ✅
│   ├── scholarship-add.html      ✅
│   ├── humanitarian-add.html     ✅
│   ├── users-manage.html         ✅
│   ├── components/
│   │   ├── header.html       ✅
│   │   ├── menu.html         ✅
│   │   └── footer.html       ✅
│   └── assets/
│       ├── css/
│       └── js/
│           ├── auth.js       ✅
│           └── crud.js       ✅
│
├── uploads/projects/         ✅ (gitignored)
├── ssl/                      ✅ (gitignored)
├── favicon/                  ✅
├── database_setup.sql
├── package.json
└── .gitignore
```

---

**Note:** The root-level HTML files (`scholarship.html`, `humanitarian_aid.html`) are legacy backups and will be removed later. Only the `public/` copies need updating since `src/server.js` serves static files from `public/`.

---

## Implementation Phases

### Phase 1: Code Restructuring ✅ COMPLETE
- Modular MVC: `src/routes/`, `src/controllers/`, `src/models/`
- `config/database.js` - MySQL connection pool
- `src/server.js` - Clean Express entry point
- `src/middleware/` - rateLimiter, errorHandler, auth
- All route/controller/model files extracted and functional

### Phase 2: Authentication System ✅ COMPLETE
**Goal**: Secure admin routes with JWT, support Admin and Normal User roles

**Implemented:**
- `admin_users` table with role column (admin/user)
- `config/auth.js` - JWT secret, expiry
- `src/middleware/auth.js` - `requireAuth` + `requireAdmin`
- `src/routes/auth.routes.js` with login, logout, me, user CRUD
- `admin/login.html` - login page with Bengali UI
- Default admin user seeded

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

### Phase 3: CRUD Dashboard ✅ COMPLETE
**Goal**: Admin panel for scholarship & humanitarian data with role-based UI

- ✅ `admin/index.html` - dashboard home with live stats
- ✅ `admin/scholarship-manage.html` - data table, search, pagination, add/edit/delete
- ✅ `admin/scholarship-add.html` - dedicated add form
- ✅ `admin/humanitarian-manage.html` - same pattern
- ✅ `admin/humanitarian-add.html` - dedicated add form
- ✅ `admin/users-manage.html` - user management (admin only)
- ✅ `admin/assets/js/crud.js` - reusable CRUD logic
- ✅ `admin/assets/js/auth.js` - token management, role-based UI
- ✅ `admin/components/` - shared header, menu, footer components
- ✅ All CRUD API endpoints for scholarship and humanitarian

### Phase 4: Project Management Tool ✅ MOSTLY COMPLETE
**Goal**: Full project tracking with photo uploads

**Database tables:** `projects`, `project_photos`

**Completed:**
- ✅ `config/multer.js` - storage config, file limits
- ✅ `src/models/projects.model.js` - CRUD + photo queries
- ✅ `src/controllers/projects.controller.js` - with image processing
- ✅ `src/routes/projects.routes.js` - public + admin endpoints
- ✅ `public/projects.html` - public search with cards, filters, progress bar, photo gallery
- ✅ `admin/projects-manage.html` - full admin management UI
- ✅ Infographs added

**Remaining:**
- [ ] Verify drag-and-drop photo upload fully working end-to-end
- [ ] Test photo reorder/caption/type management
- [ ] Photo gallery detail modal polish

### Phase 5: Frontend Cleanup & Polish ⏳ PARTIAL
- ✅ `public/assets/` structure exists (css, js, images)
- ✅ `admin/components/` shared components (header, menu, footer)
- [ ] Extract shared JS into `public/assets/js/api.js`
- [ ] Extract shared CSS into `public/assets/css/common.css`
- [ ] Ensure navigation is consistent across all public pages
- [ ] `public/dashboard.html` - verify it's a proper landing/overview page

### Phase 6: Git Cleanup & Documentation ⏳ TODO
1. Update `.gitignore` - ensure `uploads/`, `ssl/`, `.env` excluded
2. Remove any data PDFs from tracking
3. Update `README.md` with new structure and setup instructions
4. Create `.env.example` with all required variables

---

## API Endpoint Summary

### Authentication (`/api/auth/`)
- POST `/login` - Public
- POST `/logout` - Authenticated
- GET `/me` - Authenticated
- PUT `/profile` - Authenticated
- PUT `/change-password` - Authenticated
- POST `/users` - Admin only
- GET `/users` - Admin only
- PUT `/users/:id` - Admin only
- DELETE `/users/:id` - Admin only

### Scholarship (`/api/scholarship/`)
- GET `/search?q=...&year=...` - Public
- GET `/list?page=1&limit=20` - Public
- GET `/:id` - Public
- GET `/years` - Public
- GET `/stats` - Public
- POST `/create` - Admin only ✅
- PUT `/:id/update` - Admin only ✅
- DELETE `/:id/delete` - Admin only ✅

### Humanitarian (`/api/humanitarian/`)
- GET `/search?q=...&year=...` - Public
- GET `/list?page=1&limit=20` - Public
- GET `/:id` - Public
- GET `/years` - Public
- GET `/stats` - Public
- POST `/create` - Admin only ✅
- PUT `/:id/update` - Admin only ✅
- DELETE `/:id/delete` - Admin only ✅

### Projects (`/api/projects/`)
- GET `/search` - Public
- GET `/list` - Public
- GET `/:id` - Public
- GET `/:id/photos` - Public
- GET `/stats` - Public
- POST `/create` - Admin only ✅
- PUT `/:id/update` - Admin only ✅
- DELETE `/:id/delete` - Admin only ✅
- POST `/:id/photos` - Admin only ✅
- DELETE `/photos/:photoId` - Admin only ✅

---

## Dependencies
```
jsonwebtoken    ✅ JWT auth
bcryptjs        ✅ Password hashing
multer          ✅ File uploads
sharp           ✅ Image processing
```

---

## Deployment (ServBay + Nginx)
- Nginx (ServBay) handles SSL termination on port 443
- Nginx reverse-proxies to `http://localhost:3000` (Node.js HTTP port)
- Node.js HTTPS (port 3443) is not needed when behind Nginx
- Start server: `npm start` (production) or `npm run dev` (development)

## Verification Plan
1. After each phase, run `node src/server.js` and test all existing endpoints still work
2. Test auth: `curl -X POST /api/auth/login` with credentials
3. Test CRUD: create/read/update/delete via API calls
4. Test photo upload: upload image via form, verify resize/storage
5. Test public pages: search functionality still works after restructuring
6. Test on mobile: responsive design verification
7. Run `git status` to ensure no sensitive files are tracked
