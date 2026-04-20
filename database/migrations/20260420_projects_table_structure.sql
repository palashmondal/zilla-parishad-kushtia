-- Projects table baseline migration.
-- CREATE TABLE IF NOT EXISTS handles fresh installs.
-- ALTER TABLE ... IF NOT EXISTS statements add columns that may be absent
-- in older production instances. migrate.js ignores "already exists" errors.

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'প্রকল্পের নাম',
  `project_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রকল্পের আইডি',
  `allocation_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'বরাদ্দ',
  `released_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'ছাড়কৃত অর্থ',
  `fund_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'তহবিলের ধরণ',
  `financial_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'অর্থবছর',
  `project_approval_date` date DEFAULT NULL,
  `progress_step_id` int DEFAULT NULL,
  `approval_memo_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_memo_id` int DEFAULT NULL,
  `implementation_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'বাস্তবায়ন পদ্ধতি',
  `upazila` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'উপজেলা',
  `project_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'প্রকল্পের ধরণ',
  `current_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'কাজ শুরু হয়নি' COMMENT 'বর্তমান অবস্থা',
  `progress_percentage` tinyint unsigned NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `is_delayed` tinyint(1) NOT NULL DEFAULT '0',
  `performance_score` decimal(5,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `lat_lng` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সুপারিশকারী',
  `cppc_president` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রকল্প সভাপতি',
  `cppc_president_mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সভাপতির মোবাইল নম্বর',
  `priority` enum('general','medium','top_priority') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `created_by` int DEFAULT NULL,
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
  KEY `idx_progress_step_id` (`progress_step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='প্রকল্প — Government development projects managed by Zilla Parishad Kushtia';

-- Add columns introduced after the initial table creation.
-- Each statement is safe to re-run: migrate.js ignores "already exists" errors.

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `project_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রকল্পের আইডি' AFTER `project_name`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `project_approval_date` date DEFAULT NULL COMMENT 'Approval date from the approval memo' AFTER `financial_year`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `progress_step_id` int DEFAULT NULL COMMENT 'FK to progress_step_definitions.id' AFTER `project_approval_date`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `approval_memo_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reference number from the approval memo' AFTER `progress_step_id`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `approval_memo_id` int DEFAULT NULL COMMENT 'FK to approval_memos.id' AFTER `approval_memo_number`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `cppc_president` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রকল্প সভাপতি' AFTER `reference`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `cppc_president_mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সভাপতির মোবাইল নম্বর' AFTER `cppc_president`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `priority` enum('general','medium','top_priority') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general' AFTER `cppc_president_mobile`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `performance_score` decimal(5,2) DEFAULT NULL COMMENT 'Performance Score 0-100.00' AFTER `is_delayed`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `actual_end_date` date DEFAULT NULL COMMENT 'প্রকৃত শেষ তারিখ' AFTER `expected_end_date`;

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `lat_lng` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `actual_end_date`;

-- Indexes (ignored if already exist via migrate.js error handling)

ALTER TABLE `projects`
  ADD KEY `idx_approval_memo_id` (`approval_memo_id`);

ALTER TABLE `projects`
  ADD KEY `idx_progress_step_id` (`progress_step_id`);

-- Foreign keys (ignored if already exist)

ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_approval_memo` FOREIGN KEY (`approval_memo_id`) REFERENCES `approval_memos` (`id`) ON DELETE SET NULL;

ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_progress_step` FOREIGN KEY (`progress_step_id`) REFERENCES `progress_step_definitions` (`id`) ON DELETE SET NULL;
