# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 9.4.0)
# Database: zpkushti_zpk
# Generation Time: 2026-04-17 15:48:44 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table admin_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `admin_users`;

CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique username for login',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bcrypt hashed password',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User email address',
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full name in Bengali or English',
  `designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Job title/designation (e.g., সহকারী প্রকৌশলী)',
  `office_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Office/department name (e.g., জেলা পরিষদ কুষ্টিয়া)',
  `photo_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Relative path to user profile photo',
  `role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT 'Admin = full access, User = limited access',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Active status - can be deactivated instead of deleted',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Last successful login timestamp',
  `created_by` int DEFAULT NULL COMMENT 'ID of admin who created this user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin and user accounts with role-based access control';



# Dump of table approval_memos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `approval_memos`;

CREATE TABLE `approval_memos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memo_date` date DEFAULT NULL COMMENT 'Date of approval memo (null for monthly type)',
  `financial_year` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'আর্থিক বছর — Format: 2024-2025',
  `memo_type` enum('ministry','monthly') COLLATE utf8mb4_unicode_ci DEFAULT 'ministry' COMMENT 'Type of memo: ministry or monthly',
  `meeting_month` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bengali month name for monthly meetings',
  `meeting_date` date DEFAULT NULL COMMENT 'Date of monthly meeting',
  `memo_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Memo number (null for monthly type)',
  `total_projects` int NOT NULL DEFAULT '0' COMMENT 'à¦®à§‹à¦Ÿ à¦ªà§à¦°à¦•à¦²à§à¦ª à¦¸à¦‚à¦–à§à¦¯à¦¾ â€” total number of projects covered',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'à¦®à¦¨à§à¦¤à¦¬à§à¦¯ â€” optional notes or remarks',
  `document_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'স্মারক ডকুমেন্ট ফাইল — path to attached PDF or Word document',
  `created_by` int DEFAULT NULL COMMENT 'FK to admin_users.id â€” who created this memo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_memo_number_unique` (`memo_number`),
  KEY `fk_approval_memos_created_by` (`created_by`),
  KEY `idx_memo_date` (`memo_date`),
  KEY `idx_memo_number` (`memo_number`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_financial_year` (`financial_year`),
  KEY `idx_memo_type` (`memo_type`),
  CONSTRAINT `fk_approval_memos_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='à¦ªà§à¦°à¦•à¦²à§à¦ª à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¸à§à¦®à¦¾à¦°à¦• â€” Project approval memos with date, number, and project count';



# Dump of table humanitarian_aid
# ------------------------------------------------------------

DROP TABLE IF EXISTS `humanitarian_aid`;

CREATE TABLE `humanitarian_aid` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financial_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `father_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nid_birth_reg_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profession` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relation_to_beneficiary` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `upazila` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zila` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'কুষ্টিয়া',
  `mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_eng` decimal(10,2) DEFAULT NULL,
  `bank` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_date` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Delivered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_father_name` (`father_name`),
  KEY `idx_mother_name` (`mother_name`),
  KEY `idx_nid` (`nid_birth_reg_no`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_address` (`address`(100)),
  KEY `idx_financial_year` (`financial_year`),
  KEY `idx_upazila` (`upazila`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table migrations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table progress_step_definitions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `progress_step_definitions`;

CREATE TABLE `progress_step_definitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `implementation_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'cppc, tender, or rfq',
  `step_order` int NOT NULL COMMENT 'Order of step within method',
  `bengali_description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bengali description of the step',
  `base_percentage` int NOT NULL COMMENT 'Fixed percentage for this step (0-100)',
  `is_dynamic_calculation` tinyint(1) DEFAULT '0' COMMENT '1 if percentage varies based on fund disbursement',
  `dynamic_min_percentage` int DEFAULT NULL COMMENT 'Minimum percentage for dynamic calculation',
  `dynamic_max_percentage` int DEFAULT NULL COMMENT 'Maximum percentage for dynamic calculation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_method_step` (`implementation_method`,`step_order`),
  KEY `idx_implementation_method` (`implementation_method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table project_documents
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project_documents`;

CREATE TABLE `project_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` int unsigned DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_proj_docs_project_id` (`project_id`),
  CONSTRAINT `fk_project_documents_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table project_images
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project_images`;

CREATE TABLE `project_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'FK to projects.id',
  `photo_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Relative path under /uploads/ — e.g. projects/proj-217-1.jpg',
  `photo_type` enum('before','during','after','general') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general' COMMENT 'before=কাজের আগে, during=চলাকালীন, after=সম্পন্নের পরে, general=সাধারণ',
  `caption` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bengali caption for the photo — ছবির বিবরণ',
  `display_order` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Sort order for gallery display — lower number shown first',
  `file_size_bytes` int unsigned DEFAULT NULL COMMENT 'Original file size in bytes',
  `uploaded_by` int DEFAULT NULL COMMENT 'FK to admin_users.id — who uploaded this image',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_project_images_uploaded_by` (`uploaded_by`),
  KEY `idx_pi_project_id` (`project_id`),
  KEY `idx_pi_photo_type` (`photo_type`),
  KEY `idx_pi_project_order` (`project_id`,`display_order`),
  CONSTRAINT `fk_project_images_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_images_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='প্রকল্পের ছবি — Multiple photos per project with before/during/after classification';



# Dump of table project_progress_log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project_progress_log`;

CREATE TABLE `project_progress_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'FK to projects.id',
  `progress_percentage` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'অগ্রগতি snapshot at log time',
  `released_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'ছাড়কৃত অর্থ at log time',
  `current_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'বর্তমান অবস্থা at log time',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `is_delayed` tinyint(1) NOT NULL DEFAULT '0',
  `note` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Update note for this progress snapshot',
  `progress_step_id` int DEFAULT NULL COMMENT 'FK to progress_step_definitions.id - which step was selected for this log',
  `logged_by` int DEFAULT NULL COMMENT 'FK to admin_users.id — who made this update',
  `logged_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this snapshot was captured',
  PRIMARY KEY (`id`),
  KEY `fk_ppl_logged_by` (`logged_by`),
  KEY `idx_ppl_project_id` (`project_id`),
  KEY `idx_ppl_project_timeline` (`project_id`,`logged_at`),
  KEY `idx_ppl_progress_step_id` (`progress_step_id`),
  CONSTRAINT `fk_ppl_logged_by` FOREIGN KEY (`logged_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ppl_progress_step` FOREIGN KEY (`progress_step_id`) REFERENCES `progress_step_definitions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ppl_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ppl_progress` CHECK ((`progress_percentage` between 0 and 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='প্রকল্পের অগ্রগতির ইতিহাস — Time-series snapshots of project progress for charts';



# Dump of table projects
# ------------------------------------------------------------

DROP TABLE IF EXISTS `projects`;

CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'প্রকল্পের নাম — full Bengali project title',
  `project_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রকল্পের  আইডি - identification name of a project',
  `allocation_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'বরাদ্দ — total budget allocation in BDT',
  `released_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'ছাড়কৃত অর্থ — amount released to contractor so far',
  `fund_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'তহবিলের ধরণ — fund source/type in Bengali',
  `financial_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'অর্থবছর — financial year e.g. ২০২৫-২৬',
  `project_approval_date` date DEFAULT NULL COMMENT 'Approval date from the approval memo',
  `progress_step_id` int DEFAULT NULL COMMENT 'FK to progress_step_definitions.id - tracks which step project is on',
  `approval_memo_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reference number from the approval memo',
  `approval_memo_id` int DEFAULT NULL COMMENT 'Foreign key to approval_memos.id - links project to its approval memo',
  `implementation_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'বাস্তবায়ন পদ্ধতি — implementation method e.g. টেন্ডার',
  `upazila` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'উপজেলা — upazila/sub-district location',
  `project_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'প্রকল্পের ধরণ — project category/type',
  `current_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'কাজ শুরু হয়নি' COMMENT 'বর্তমান অবস্থা — current project status',
  `progress_percentage` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'অগ্রগতি — completion percentage 0-100',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Completion Flag — TRUE when project is fully done',
  `is_delayed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Delay Flag — TRUE if project is behind schedule',
  `performance_score` decimal(5,2) DEFAULT NULL COMMENT 'Performance Score 0-100.00 — computed in app, stored for querying',
  `start_date` date DEFAULT NULL COMMENT 'শুরু তারিখ — actual project start date',
  `expected_end_date` date DEFAULT NULL COMMENT 'সম্ভাব্য শেষ তারিখ — expected completion date',
  `actual_end_date` date DEFAULT NULL COMMENT 'প্রকৃত শেষ তারিখ — actual completion date if done',
  `lat_lng` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'মন্তব্য — optional remarks or notes',
  `reference` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সুপারিশকারী — who recommended/referred the project, e.g., minister/official name',
  `priority` enum('general','medium','top_priority') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `created_by` int DEFAULT NULL COMMENT 'FK to admin_users.id — who created this record',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_projects_created_by` (`created_by`),
  KEY `idx_project_name` (`project_name`(100)),
  KEY `idx_financial_year` (`financial_year`),
  KEY `idx_upazila` (`upazila`),
  KEY `idx_project_type` (`project_type`),
  KEY `idx_current_status` (`current_status`),
  KEY `idx_is_completed` (`is_completed`),
  KEY `idx_is_delayed` (`is_delayed`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_expected_end_date` (`expected_end_date`),
  KEY `idx_year_status_active` (`financial_year`,`current_status`),
  KEY `idx_approval_memo_id` (`approval_memo_id`),
  KEY `idx_progress_step_id` (`progress_step_id`),
  CONSTRAINT `fk_projects_approval_memo` FOREIGN KEY (`approval_memo_id`) REFERENCES `approval_memos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_projects_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_projects_progress_step` FOREIGN KEY (`progress_step_id`) REFERENCES `progress_step_definitions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_performance` CHECK (((`performance_score` is null) or (`performance_score` between 0.00 and 100.00))),
  CONSTRAINT `chk_progress` CHECK ((`progress_percentage` between 0 and 100)),
  CONSTRAINT `chk_released_lte_allocation` CHECK ((`released_amount` <= (`allocation_amount` * 1.05)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='প্রকল্প — Government development projects managed by Zilla Parishad Kushtia';



# Dump of table scholarship
# ------------------------------------------------------------

DROP TABLE IF EXISTS `scholarship`;

CREATE TABLE `scholarship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serial` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Serial from CSV',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'আবেদনকারীর নাম',
  `father_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'পিতার নাম',
  `mother_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'মাতার নাম',
  `sang` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সাং',
  `post` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'পোস্ট',
  `upazila` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'উপজেলা',
  `zila` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'কুষ্টিয়া' COMMENT 'জেলা',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'মোবাইল নম্বর',
  `passing_year` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'পাশের সাল',
  `school` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রতিষ্ঠানের নাম',
  `gpa` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'জিপিএ',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Category (SSC/HSC/JSC)',
  `financial_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Delivered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `distribution_date` date DEFAULT NULL COMMENT 'à¦…à¦°à§à¦¥ à¦¬à¦¿à¦¤à¦°à¦£à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦–',
  `disbursement_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'à¦¬à¦¿à¦¤à¦°à¦£ à¦ªà¦¦à§à¦§à¦¤à¦¿ (à¦¬à¦¿à¦•à¦¾à¦¶/à¦¨à¦—à¦¦/à¦°à¦•à§‡à¦Ÿ/à¦¸à¦°à¦¾à¦¸à¦°à¦¿)',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_father` (`father_name`),
  KEY `idx_mother` (`mother_name`),
  KEY `idx_school` (`school`(255)),
  KEY `idx_phone` (`phone`),
  KEY `idx_upazila` (`upazila`),
  FULLTEXT KEY `ft_search` (`name`,`father_name`,`mother_name`,`school`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
