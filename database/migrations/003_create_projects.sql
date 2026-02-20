-- ============================================================
-- Migration 003: Project Management Tables
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Tables: projects, project_images, project_progress_log
-- ============================================================

-- ============================================================
-- Table 1: projects
-- প্রকল্প — Government development projects
-- ============================================================

CREATE TABLE IF NOT EXISTS `projects` (
    -- প্রকল্প আইডি — human-readable code, generated in app
    -- Format: R-{YY}-{YY}-{serial}  e.g. R-25-26-217
    `id`                    VARCHAR(50) NOT NULL
                            COMMENT 'প্রকল্প আইডি — human-readable code e.g. R-25-26-217',

    -- প্রকল্পের নাম — full Bengali project title, can be very long
    `project_name`          TEXT NOT NULL
                            COMMENT 'প্রকল্পের নাম — full Bengali project title',

    -- Financial fields
    -- বরাদ্দ — total budget allocated in BDT
    `allocation_amount`     DECIMAL(15,2) NOT NULL DEFAULT '0.00'
                            COMMENT 'বরাদ্দ — total budget allocation in BDT',
    -- ছাড়কৃত অর্থ — amount released/disbursed so far
    `released_amount`       DECIMAL(15,2) NOT NULL DEFAULT '0.00'
                            COMMENT 'ছাড়কৃত অর্থ — amount released to contractor so far',

    -- তহবিলের ধরণ — VARCHAR: fund type names change across policy years
    -- e.g. "জেলা পরিষদ উন্নয়ন সহায়তা (সাধারণ বরাদ্দ)"
    `fund_type`             VARCHAR(500) NOT NULL
                            COMMENT 'তহবিলের ধরণ — fund source/type in Bengali',

    -- অর্থবছর — e.g. "২০২৫-২৬" in Bengali numerals
    -- Matches exact convention in scholarship and humanitarian_aid tables
    `financial_year`        VARCHAR(20) NOT NULL
                            COMMENT 'অর্থবছর — financial year e.g. ২০২৫-২৬',

    -- প্রকল্প অনুমোদনের তারিখ — date the project was officially approved
    `project_approval_date` DATE NULL DEFAULT NULL
                            COMMENT 'প্রকল্প অনুমোদনের তারিখ — date project was officially approved',

    -- বাস্তবায়ন পদ্ধতি — ENUM: exactly 3 procurement methods defined by PPR 2008
    -- টেন্ডার = Open Tender | সিপিপিসি = CPPC | আরএফকিউ = RFQ
    `implementation_method` ENUM('টেন্ডার', 'সিপিপিসি', 'আরএফকিউ') NOT NULL
                            COMMENT 'বাস্তবায়ন পদ্ধতি — টেন্ডার / সিপিপিসি / আরএফকিউ',

    -- উপজেলা — VARCHAR: sub-district names may be extended
    `upazila`               VARCHAR(255) NOT NULL
                            COMMENT 'উপজেলা — upazila/sub-district location',

    -- প্রকল্পের ধরণ — ENUM: 4 fixed categories defined by Zilla Parishad
    `project_type`          ENUM('শিক্ষা', 'ধর্মীয় ও সামাজিক', 'সেবামূলক', 'ক্রীড়া') NOT NULL
                            COMMENT 'প্রকল্পের ধরণ — Education / Religious & Social / Service / Sports',

    -- বর্তমান অবস্থা — VARCHAR: valid values depend on implementation_method
    -- Validated at app layer (projects.controller.js STATUS_MAP) since MySQL
    -- CHECK constraints cannot cross-reference another column's value
    --
    -- টেন্ডার statuses:  কাজ শুরু হয়নি → টেন্ডার ফ্লোটিং → কার্যাদেশ সম্পন্ন → বাস্তবায়ন চলমান → বাস্তবায়ন সম্পন্ন
    -- সিপিপিসি statuses: কাজ শুরু হয়নি → প্রকল্পপত্র প্রেরণ সম্পন্ন → ১ম বিল দাখিলকৃত → ১ম কিস্তি ছাড় সম্পন্ন
    --                     → ২য় বিল দাখিলকৃত → ২য় কিস্তি ছাড় সম্পন্ন → প্রকল্প বাস্তবায়িত
    -- আরএফকিউ statuses:  কাজ শুরু হয়নি → কোটেশন আহ্বান সম্পন্ন → বিল দাখিলকৃত → কিস্তি ছাড় সম্পন্ন → প্রকল্প বাস্তবায়িত
    `current_status`        VARCHAR(255) NOT NULL DEFAULT 'কাজ শুরু হয়নি'
                            COMMENT 'বর্তমান অবস্থা — validated per method in app layer',

    -- অগ্রগতি — 0-100 percentage completion
    `progress_percentage`   TINYINT UNSIGNED NOT NULL DEFAULT '0'
                            COMMENT 'অগ্রগতি — completion percentage 0-100',

    -- Completion and delay flags — set explicitly by app logic, not computed columns
    `is_completed`          TINYINT(1) NOT NULL DEFAULT '0'
                            COMMENT 'Completion Flag — 1 when project is fully done',
    `is_delayed`            TINYINT(1) NOT NULL DEFAULT '0'
                            COMMENT 'Delay Flag — 1 if project is behind schedule',

    -- Performance score — computed in Node.js, stored for filtering/sorting
    -- DECIMAL(5,2): supports values like 87.50, 100.00; NULL until evaluated
    `performance_score`     DECIMAL(5,2) DEFAULT NULL
                            COMMENT 'Performance Score 0-100.00 — computed in app, stored for querying',

    -- Timeline dates
    `start_date`            DATE DEFAULT NULL
                            COMMENT 'শুরু তারিখ — actual project start date',
    `expected_end_date`     DATE DEFAULT NULL
                            COMMENT 'সম্ভাব্য শেষ তারিখ — expected completion date',
    -- Actual completion date — NULL until is_completed = 1
    `actual_end_date`       DATE DEFAULT NULL
                            COMMENT 'প্রকৃত শেষ তারিখ — actual completion date if done',

    -- মন্তব্য — optional remarks or notes
    `remarks`               TEXT COLLATE utf8mb4_unicode_ci
                            COMMENT 'মন্তব্য — optional remarks or notes',

    -- Audit fields — matches admin_users_table.sql pattern exactly
    `created_by`            INT DEFAULT NULL
                            COMMENT 'FK to admin_users.id — who created this record',
    `created_at`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (`id`),

    -- Foreign key — ON DELETE SET NULL matches admin_users_table.sql convention
    CONSTRAINT `fk_projects_created_by`
        FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT `chk_progress`
        CHECK (`progress_percentage` BETWEEN 0 AND 100),
    CONSTRAINT `chk_performance`
        CHECK ((`performance_score` IS NULL) OR (`performance_score` BETWEEN 0.00 AND 100.00)),
    -- Allow up to 5% overshoot for released_amount (rounding/fee scenarios)
    CONSTRAINT `chk_released_lte_allocation`
        CHECK (`released_amount` <= (`allocation_amount` * 1.05)),

    -- Indexes — on all search-heavy, filter, and sort fields
    KEY `idx_project_name`        (`project_name`(100)),
    KEY `idx_financial_year`      (`financial_year`),
    KEY `idx_upazila`             (`upazila`),
    KEY `idx_project_type`        (`project_type`),
    KEY `idx_current_status`      (`current_status`),
    KEY `idx_is_completed`        (`is_completed`),
    KEY `idx_is_delayed`          (`is_delayed`),
    KEY `idx_start_date`          (`start_date`),
    KEY `idx_expected_end_date`   (`expected_end_date`),
    KEY `idx_implementation_method` (`implementation_method`),
    KEY `idx_project_approval_date` (`project_approval_date`),
    -- Composite: most common dashboard query — projects by year and status
    KEY `idx_year_status_active`  (`financial_year`, `current_status`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='প্রকল্প — Government development projects managed by Zilla Parishad Kushtia';


-- ============================================================
-- Table 2: project_images
-- প্রকল্পের ছবি — Multiple photos per project
-- Photos stored at /uploads/projects/{filename} on disk
-- ============================================================

CREATE TABLE IF NOT EXISTS `project_images` (
    `id`              INT NOT NULL AUTO_INCREMENT,

    -- FK to projects — CASCADE: removing a project removes all its images
    -- VARCHAR(50) to match projects.id type
    `project_id`      VARCHAR(50) NOT NULL
                      COMMENT 'FK to projects.id',

    -- Relative path stored, e.g., "projects/proj-R-25-26-217-before-1.jpg"
    -- Served via Express static from /uploads/ root
    `photo_path`      VARCHAR(500) NOT NULL
                      COMMENT 'Relative path under /uploads/ — e.g. projects/proj-R-25-26-217-1.jpg',

    -- Photo classification — ENUM safe here: these 4 types are permanently defined
    -- before=কাজের আগে, during=কাজ চলাকালীন, after=কাজের পরে, general=সাধারণ
    `photo_type`      ENUM('before', 'during', 'after', 'general') NOT NULL DEFAULT 'general'
                      COMMENT 'before=কাজের আগে, during=চলাকালীন, after=সম্পন্নের পরে, general=সাধারণ',

    -- Optional Bengali caption
    `caption`         VARCHAR(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                      COMMENT 'Bengali caption for the photo — ছবির বিবরণ',

    -- Display order for gallery reordering in admin UI (lower = shown first)
    `display_order`   TINYINT UNSIGNED NOT NULL DEFAULT '0'
                      COMMENT 'Sort order for gallery display — lower number shown first',

    -- File size for admin UI display and storage reporting
    `file_size_bytes` INT UNSIGNED DEFAULT NULL
                      COMMENT 'Original file size in bytes',

    -- Audit
    `uploaded_by`     INT DEFAULT NULL
                      COMMENT 'FK to admin_users.id — who uploaded this image',
    `uploaded_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    -- Foreign keys
    CONSTRAINT `fk_project_images_project_id`
        FOREIGN KEY (`project_id`)  REFERENCES `projects` (`id`)     ON DELETE CASCADE,
    CONSTRAINT `fk_project_images_uploaded_by`
        FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`)  ON DELETE SET NULL,

    -- Indexes
    KEY `idx_pi_project_id`    (`project_id`),
    KEY `idx_pi_photo_type`    (`photo_type`),
    -- Composite for ordered gallery fetch: SELECT * WHERE project_id=? ORDER BY display_order
    KEY `idx_pi_project_order` (`project_id`, `display_order`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='প্রকল্পের ছবি — Multiple photos per project with before/during/after classification';


-- ============================================================
-- Table 3: project_progress_log
-- প্রকল্পের অগ্রগতির ইতিহাস — Time-series progress snapshots
-- Lightweight: stores key numeric/status fields only, not a full row copy
-- Written by app logic in projects.model.js update() — no MySQL triggers
-- ============================================================

CREATE TABLE IF NOT EXISTS `project_progress_log` (
    `id`                  INT NOT NULL AUTO_INCREMENT,

    -- FK — CASCADE: if project deleted, its history is deleted too
    -- VARCHAR(50) to match projects.id type
    `project_id`          VARCHAR(50) NOT NULL
                          COMMENT 'FK to projects.id',

    -- Snapshot of key fields at this point in time
    `progress_percentage` TINYINT UNSIGNED NOT NULL DEFAULT '0'
                          COMMENT 'অগ্রগতি snapshot at log time',
    `released_amount`     DECIMAL(15,2) NOT NULL DEFAULT '0.00'
                          COMMENT 'ছাড়কৃত অর্থ at log time',
    `current_status`      VARCHAR(255) NOT NULL
                          COMMENT 'বর্তমান অবস্থা at log time',
    `is_completed`        TINYINT(1) NOT NULL DEFAULT '0',
    `is_delayed`          TINYINT(1) NOT NULL DEFAULT '0',

    -- Optional note for this snapshot (e.g., "site inspection completed")
    `note`                VARCHAR(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                          COMMENT 'Update note for this progress snapshot',

    -- Who logged this update and when
    `logged_by`           INT DEFAULT NULL
                          COMMENT 'FK to admin_users.id — who made this update',
    `logged_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                          COMMENT 'When this snapshot was captured',

    PRIMARY KEY (`id`),

    -- Foreign keys
    CONSTRAINT `fk_ppl_project_id`
        FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)     ON DELETE CASCADE,
    CONSTRAINT `fk_ppl_logged_by`
        FOREIGN KEY (`logged_by`)  REFERENCES `admin_users` (`id`)  ON DELETE SET NULL,

    -- Constraint
    CONSTRAINT `chk_ppl_progress` CHECK (`progress_percentage` BETWEEN 0 AND 100),

    -- Indexes
    KEY `idx_ppl_project_id`       (`project_id`),
    -- Composite for timeline chart: SELECT * WHERE project_id=? ORDER BY logged_at ASC
    KEY `idx_ppl_project_timeline` (`project_id`, `logged_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='প্রকল্পের অগ্রগতির ইতিহাস — Time-series snapshots of project progress for charts';


-- ============================================================
-- App-layer STATUS_MAP reference (enforce in projects.controller.js)
-- MySQL CHECK cannot cross-reference columns, so validation is in Node.js
-- ============================================================
--
-- const STATUS_MAP = {
--   'টেন্ডার':  ['কাজ শুরু হয়নি', 'টেন্ডার ফ্লোটিং', 'কার্যাদেশ সম্পন্ন', 'বাস্তবায়ন চলমান', 'বাস্তবায়ন সম্পন্ন'],
--   'সিপিপিসি': ['কাজ শুরু হয়নি', 'প্রকল্পপত্র প্রেরণ সম্পন্ন', '১ম বিল দাখিলকৃত', '১ম কিস্তি ছাড় সম্পন্ন',
--                '২য় বিল দাখিলকৃত', '২য় কিস্তি ছাড় সম্পন্ন', 'প্রকল্প বাস্তবায়িত'],
--   'আরএফকিউ': ['কাজ শুরু হয়নি', 'কোটেশন আহ্বান সম্পন্ন', 'বিল দাখিলকৃত', 'কিস্তি ছাড় সম্পন্ন', 'প্রকল্প বাস্তবায়িত'],
-- };
