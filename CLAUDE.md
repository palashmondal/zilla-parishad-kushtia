# ZP Kushtia Tools - Developer Guide

## Core Commands
* **Start Dev:** `npm run dev` (uses nodemon)
* **Start Prod:** `npm start`
* **DB Setup:** `mysql -u root -p < zpk_mysql_structure.sql`
* **Lint:** `npm run lint` (if configured)

## Tech Stack & Constraints
* **Backend:** Node.js / Express.js
* **Database:** MySQL 9.x (Database name: `zpk`). Use connection pooling from `config/database.js`.
* **Frontend:** Vanilla JS, Tailwind CSS (CDN), HTML5. No heavy frameworks.
* **Encoding:** **Strict UTF-8MB4 support required** for all Bengali text processing.
* **Style:** Use clean, functional Express controllers. Middleware for rate limiting and error handling is mandatory.

## Project Architecture
* `src/models/`: SQL query logic. Use prepared statements to prevent injection.
* `src/controllers/`: Request handling and response formatting.
* `public/`: All frontend assets. Ensure `scholarship.html` and `humanitarian_aid.html` stay lightweight.
* **Search Logic:** Implement multi-keyword search with space-separated tokens and relevance ranking as per the feature list.

## Database Guidelines
* **Tables:** `scholarship` and `humanitarian_aid`.
* **Data Types:** Use `DECIMAL(10,2)` for amounts; `VARCHAR` for phone/serial numbers to preserve leading zeros.
* **Indexes:** Always utilize the existing indexes on `name`, `father_name`, `nid`, and `phone`.

## Development Rules (Token Savers)
* **Brevity:** Skip explanations for standard Express/JS patterns. 
* **Bengali Text:** When generating UI elements or dummy data, use correct Bengali script (Hind Siliguri font).
* **Search Optimization:** Only fetch the top 10-20 results for search queries unless pagination is explicitly requested.
* **Environment:** Never hardcode credentials. Use `process.env`.
* **Safety:** Before running destructive SQL, verify the table name and `WHERE` clause.

## Known Pitfalls
* **CORS:** Ensure `CORS_ORIGINS` in `.env` matches the frontend port during local testing.
* **MySQL 9 Compatibility:** Ensure queries are compatible with MySQL 9.x strict mode.
* **Pathing:** Express serves `public/` as static; ensure internal links in HTML don't include `/public/`.