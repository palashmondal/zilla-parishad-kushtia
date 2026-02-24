-- ============================================================
-- Migration 004: Add reference field to projects table
-- Track who recommended the project
-- ============================================================

ALTER TABLE `projects`
    ADD COLUMN `reference` VARCHAR(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
        COMMENT 'সুপারিশকারী — who recommended/referred the project, e.g., minister/official name'
        AFTER `remarks`;
