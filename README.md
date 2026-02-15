# ZP Kushtia Tools
## জেলা পরিষদ, কুষ্টিয়া

A web-based toolset for Zilla Parishad, Kushtia to manage and search beneficiary records including **Education Scholarships** and **Humanitarian Financial Aid**.

**Live:** [https://zpkushtia.info](https://zpkushtia.info)

---

## Features

- **Scholarship Search** — Search education scholarship beneficiaries by name, parent name, school, phone, or upazila
- **Humanitarian Aid Search** — Search financial aid records by name, NID, profession, address, or category
- **Multi-keyword Search** — Space-separated keywords with relevance-based ranking
- **Year Filtering** — Filter results by financial year
- **Bengali Language UI** — Full UTF-8MB4 support with Hind Siliguri font
- **Responsive Design** — Mobile, tablet, and desktop compatible
- **Rate Limiting** — API protection against abuse

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Backend | Express.js |
| Database | MySQL 9.x (utf8mb4) |
| Frontend | HTML5, Vanilla JavaScript, Tailwind CSS (CDN) |
| Web Server | Nginx (ServBay) reverse proxy |
| SSL | ServBay managed certificates |

---

## Project Structure

```
zpkushtia.info/
├── config/
│   └── database.js              # MySQL connection pool
├── src/
│   ├── server.js                # Express app entry point
│   ├── middleware/
│   │   ├── rateLimiter.js       # Rate limiting (general, search, login)
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── scholarship.routes.js
│   │   └── humanitarian.routes.js
│   ├── controllers/
│   │   ├── scholarship.controller.js
│   │   └── humanitarian.controller.js
│   └── models/
│       ├── scholarship.model.js
│       └── humanitarian.model.js
├── public/                      # Static files served by Express
│   ├── index.html               # Redirects to scholarship.html
│   ├── scholarship.html         # Scholarship search page
│   ├── humanitarian_aid.html    # Humanitarian aid search page
│   └── assets/
│       └── images/zpk_logo.jpg
├── favicon/                     # Favicon assets
├── ssl/                         # SSL certificates (gitignored)
├── zpk_mysql_structure.sql      # Database schema
├── package.json
├── .env                         # Environment config (gitignored)
└── .gitignore
```

---

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/zpkushtia.info.git
cd zpkushtia.info
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

```bash
mysql -u root -p < zpk_mysql_structure.sql
```

This creates the `zpk` database with two tables: `scholarship` and `humanitarian_aid`.

### 4. Configure environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zpk

PORT=3000
HTTPS_PORT=3443

USE_HTTPS=false
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

### 5. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The application will be available at `http://localhost:3000`.

---

## Database Schema

### Database: `zpk`

### Table: `scholarship`

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| serial | VARCHAR(20) | Original serial number |
| name | VARCHAR(255) | Student name (আবেদনকারীর নাম) |
| father_name | VARCHAR(255) | Father's name (পিতার নাম) |
| mother_name | VARCHAR(255) | Mother's name (মাতার নাম) |
| sang | VARCHAR(255) | Village/area (সাং) |
| post | VARCHAR(255) | Post office (পোস্ট) |
| upazila | VARCHAR(100) | Sub-district (উপজেলা) |
| zila | VARCHAR(100) | District, default: কুষ্টিয়া |
| phone | VARCHAR(20) | Mobile number |
| passing_year | VARCHAR(120) | Year of passing |
| school | VARCHAR(500) | Institution name |
| gpa | VARCHAR(500) | GPA |
| category | VARCHAR(50) | SSC / HSC / JSC |
| financial_year | VARCHAR(20) | Financial year |
| amount | DECIMAL(10,2) | Scholarship amount |
| status | VARCHAR(50) | Payment status, default: Delivered |

**Indexes:** name, father_name, mother_name, school, phone, upazila, full-text search on (name, father_name, mother_name, school)

### Table: `humanitarian_aid`

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| financial_year | VARCHAR(20) | Financial year (অর্থবছর) |
| name | VARCHAR(255) | Applicant name |
| father_name | VARCHAR(255) | Father's name |
| mother_name | VARCHAR(255) | Mother's name |
| nid_birth_reg_no | VARCHAR(50) | NID / Birth registration number |
| profession | VARCHAR(255) | Profession |
| relation_to_beneficiary | VARCHAR(100) | Relation to beneficiary |
| address | TEXT | Full address |
| upazila | VARCHAR(100) | Sub-district |
| zila | VARCHAR(100) | District, default: কুষ্টিয়া |
| mobile | VARCHAR(20) | Mobile number |
| category | VARCHAR(100) | Aid category |
| amount_eng | DECIMAL(10,2) | Amount in numeric format |
| bank | VARCHAR(255) | Bank name |
| check_no | VARCHAR(50) | Check number |
| check_date | VARCHAR(50) | Check date |
| reference | VARCHAR(255) | Reference |
| application_details | TEXT | Application details |
| status | VARCHAR(50) | Payment status, default: Delivered |

**Indexes:** name, father_name, mother_name, nid, mobile, address, financial_year, upazila, category

### Humanitarian Aid Categories

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
| জেলা পরিষদ কর্মচারী কল্যাণ | Aid for staffs of zilla parishad |
---

## API Endpoints

Base URL: `http://localhost:3000/api`

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

### Scholarship

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scholarship/search?q={query}&year={year}` | Search beneficiaries (top 10 by relevance) |
| GET | `/api/scholarship/:id` | Get beneficiary by ID |
| GET | `/api/scholarship/years` | List available financial years |
| GET | `/api/scholarship/stats` | Total count, by category, by year |
| GET | `/api/scholarship/list?page=1&limit=20&search=&year=` | Paginated list |

### Humanitarian Aid

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/humanitarian/search?q={query}&year={year}` | Search beneficiaries (top 10 by relevance) |
| GET | `/api/humanitarian/:id` | Get beneficiary by ID |
| GET | `/api/humanitarian/years` | List available financial years |
| GET | `/api/humanitarian/stats` | Total count, by category, by year |
| GET | `/api/humanitarian/list?page=1&limit=20&search=&year=` | Paginated list |

---

## Deployment

The production site runs on ServBay with Nginx as a reverse proxy:

- Nginx handles SSL termination on port 443
- Nginx proxies requests to Node.js on `http://localhost:3000`
- Domain: `zpkushtia.info`

```bash
# Start production server
npm start

# Start with auto-restart (development)
npm run dev
```

---

## Roadmap

- [ ] Authentication system (JWT, multi-user with admin/user roles)
- [ ] Admin dashboard with CRUD operations
- [ ] Project management tool with photo uploads
- [ ] Landing page with navigation to all tools

---

## License

This project is developed for Zilla Parishad, Kushtia (জেলা পরিষদ, কুষ্টিয়া).
