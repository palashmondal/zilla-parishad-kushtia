# ZP Kushtia Tools

## জেলা পরিষদ, কুষ্টিয়া

Web application for Zilla Parishad, Kushtia to publish and manage beneficiary records and development projects: **Education Scholarships**, **Humanitarian Financial Aid**, **Development Projects** and **Approval Memos**, with a role-based admin panel.

**Live:** [https://zpkushtia.org](https://zpkushtia.org)

---

## Features

### Public site

- **Project Search** (`/projects.html`, home page): search development projects by name, upazila, financial year or memo number, with progress status
- **Scholarship Search** (`/scholarship.html`): search scholarship beneficiaries by name, parent name, institution, phone or upazila
- **Humanitarian Aid Search** (`/humanitarian_aid.html`): search aid records by name, NID, profession, address or category
- **Dashboard** (`/dashboard.html`): summary of projects, scholarships and aid by financial year
- Multi-keyword search with relevance ranking and financial-year filtering
- Bengali UI (Hind Siliguri), fully responsive

### Admin panel (`/admin`)

- JWT login, profile management with photo upload, password change
- **Users**: create and manage admin users, assign module access (scholarship, humanitarian aid, projects)
- **Scholarships / Humanitarian Aid**: add, edit and delete records
- **Projects**: full CRUD, progress tracking by implementation method, photo and document uploads, duplicate detection
- **Approval Memos**: manage memos and link them to projects
- **Project Map**: projects plotted by upazila
- KPI dashboard with filters and charts

### Security

- bcrypt password hashing, JWT authentication, per-module authorization
- Rate limiting on API, search and login endpoints
- Prepared statements for all database queries

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Backend | Express.js |
| Database | MySQL 9.x (utf8mb4) |
| Auth | JSON Web Tokens, bcryptjs |
| Uploads | Multer |
| Frontend | HTML5, Vanilla JavaScript, Tailwind CSS |
| Hosting | Nginx reverse proxy, pm2, GitHub Actions deploy |

---

## Project Structure

```
zpkushtia.org/
├── config/                  # Database pool, JWT and upload config
├── src/
│   ├── server.js            # Express entry point
│   ├── routes/              # auth, users, scholarship, humanitarian, projects, approval-memos
│   ├── controllers/
│   ├── models/              # SQL queries
│   ├── middleware/          # auth, rate limiter, upload, error handler
│   ├── utils/               # progress calculation, location helpers
│   └── data/                # upazila coordinates
├── public/                  # Public pages, compiled CSS, images
├── admin/                   # Admin panel pages, shared components and scripts
├── database/
│   ├── zpkushti_zpk_structure_only.sql   # Full schema
│   ├── admin_users_table.sql             # Initial admin account
│   ├── migrate.js                        # Migration runner
│   └── migrations/                       # Incremental SQL migrations
├── scripts/                 # Import/export and maintenance scripts
├── docs/                    # Development notes and schema reference
├── favicon/
├── data/                    # Local CSV imports/exports (gitignored)
└── uploads/                 # Uploaded files (gitignored)
```

---

## Setup

### 1. Install

```bash
git clone https://github.com/palashmondal/zilla-parishad-kushtia.git
cd zilla-parishad-kushtia
npm install
```

### 2. Database

```bash
mysql -u root -p -e "CREATE DATABASE zpkushti_zpk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p zpkushti_zpk < database/zpkushti_zpk_structure_only.sql
node database/migrate.js
```

Then create the first admin account with `database/admin_users_table.sql` or `scripts/fix-admin-password.js`, and change the password after the first login.

### 3. Environment

Create `.env` in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zpkushti_zpk

PORT=3000
HTTPS_PORT=3443
USE_HTTPS=false

JWT_SECRET=a_long_random_string

CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

### 4. Run

```bash
npm run dev     # development, auto-restart
npm start       # production
```

The site runs at `http://localhost:3000`, the admin panel at `http://localhost:3000/admin`.

### 5. Styles

Pages use the compiled `public/output.css`. After changing Tailwind classes, rebuild it:

```bash
npx tailwindcss -i public/styles.css -o public/output.css --minify
```

---

## Database

| Table | Purpose |
|-------|---------|
| `scholarship` | Education scholarship beneficiaries |
| `humanitarian_aid` | Humanitarian financial aid records |
| `projects` | Development projects |
| `project_progress_log` | Progress updates per project |
| `progress_step_definitions` | Progress steps by implementation method |
| `project_images`, `project_documents` | Project uploads |
| `approval_memos` | Approval memos linked to projects |
| `admin_users`, `user_modules` | Admin accounts and module access |
| `migrations` | Applied migrations |

Amounts are stored as `DECIMAL(10,2)`. Phone, NID and serial numbers are stored as `VARCHAR` to keep leading zeros. See [docs/database-schema.md](docs/database-schema.md) for column details.

### Humanitarian aid categories

| Category | Description |
|----------|-------------|
| দরিদ্র শিক্ষার্থীর জন্য শিক্ষা সহায়তা | Education aid for poor students |
| অসুস্থ ব্যক্তির জন্য চিকিৎসা সহায়তা | Medical aid for sick persons |
| দুর্ঘটনায় আহত ব্যক্তির জন্য মানবিক সহায়তা | Aid for accident victims |
| প্রতিবন্ধী ব্যক্তির জন্য মানবিক সহায়তা | Aid for disabled persons |
| প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্থ মানবিক সহায়তা | Aid for natural disaster victims |
| দরিদ্র ও অসহায় ব্যক্তির জন্য মানবিক সহায়তা | Aid for poor and helpless persons |
| জুলাই যোদ্ধার জন্য মানবিক সহায়তা | Aid for July fighters |
| বীর মুক্তিযোদ্ধার জন্য মানবিক সহায়তা | Aid for freedom fighters |
| জেলা পরিষদ কর্মচারী কল্যাণ | Welfare for Zilla Parishad staff |

---

## API

All endpoints are under `/api`. `GET /api/health` returns server status.

Read endpoints are public. Write endpoints require a JWT (`Authorization: Bearer <token>`) and access to the relevant module.

### Scholarship and Humanitarian Aid

`{module}` is `scholarship` or `humanitarian`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{module}/search?q=&year=` | Search, top results by relevance |
| GET | `/api/{module}/list?page=1&limit=20&search=&year=` | Paginated list |
| GET | `/api/{module}/years` | Financial years |
| GET | `/api/{module}/stats` | Totals by category and year |
| GET | `/api/{module}/:id` | Single record |
| POST | `/api/{module}` | Create |
| PUT | `/api/{module}/:id` | Update |
| DELETE | `/api/{module}/:id` | Delete |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/search`, `/list`, `/years`, `/stats`, `/upazilas` | Search, list and lookups |
| GET | `/api/projects/map-data` | Projects for the map |
| GET | `/api/projects/progress-steps` | Progress step definitions |
| GET | `/api/projects/:id`, `/:id/progress`, `/:id/images`, `/:id/documents` | Project details |
| POST | `/api/projects`, `/check-duplicates` | Create, duplicate check |
| PUT / DELETE | `/api/projects/:id` | Update, delete |
| POST / DELETE | `/api/projects/:id/progress`, `/images`, `/documents` | Manage progress and uploads |

### Approval Memos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approval-memos/list`, `/years`, `/check-memo-number` | List and lookups |
| GET | `/api/approval-memos/:id`, `/:id/projects` | Memo and linked projects |
| POST / PUT / DELETE | `/api/approval-memos[/:id]` | Manage memos |

### Auth and Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/me`, `/modules` | Current user and module access |
| PUT | `/api/auth/profile`, `/change-password` | Update own profile |
| POST | `/api/auth/profile/photo` | Upload profile photo |
| GET / POST / PUT / DELETE | `/api/users[/:id]` | Manage users (admin only) |

---

## Deployment

Every push to `main` deploys through GitHub Actions (`.github/workflows/deploy.yml`). The workflow connects over SSH, pulls the code, installs dependencies, creates the upload folders, runs `database/migrate.js` and restarts the app with pm2. Nginx handles SSL and proxies to Node.js on port 3000.

---

## License

Developed for Zilla Parishad, Kushtia (জেলা পরিষদ, কুষ্টিয়া).
