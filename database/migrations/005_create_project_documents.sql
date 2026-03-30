-- ============================================================
-- Migration 005: Project Documents Table
-- For storing uploaded files and their extracted metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS `project_documents` (
    `id`                    INT NOT NULL AUTO_INCREMENT,

    -- FK to projects.id (CASCADE delete)
    `project_id`            VARCHAR(50) NOT NULL
                            COMMENT 'FK to projects.id',

    -- File metadata
    `file_path`             VARCHAR(500) NOT NULL
                            COMMENT 'Relative path under /uploads/documents/; e.g. documents/proj-R-25-26-001-1.pdf',

    `original_name`         VARCHAR(255) NOT NULL
                            COMMENT 'Original filename uploaded by user (with extension)',

    `file_type`             VARCHAR(50) NOT NULL
                            COMMENT 'MIME type or extension: pdf, docx, xlsx, jpg, png, txt',

    `file_size_bytes`       INT UNSIGNED DEFAULT NULL
                            COMMENT 'Size in bytes for admin display',

    -- Extraction metadata
    `extraction_status`     ENUM('pending', 'processing', 'success', 'failed', 'unsupported')
                            NOT NULL DEFAULT 'pending'
                            COMMENT 'Status of async text extraction',

    `extraction_error`      VARCHAR(500) DEFAULT NULL
                            COMMENT 'Error message if extraction failed (truncated)',

    `extracted_at`          TIMESTAMP NULL DEFAULT NULL
                            COMMENT 'When extraction completed',

    -- Extracted content for search
    `extracted_text`        LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL
                            COMMENT 'Raw extracted text (Bengali UTF-8MB4)',

    `text_preview`          VARCHAR(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                            COMMENT 'First 500 chars of extracted text for display',

    `keyword_json`          JSON DEFAULT NULL
                            COMMENT 'Top 20 extracted keywords: {"words":["বাংলা","পাঠ"...],"scores":[0.95,0.87...]}',

    -- User metadata
    `caption`               VARCHAR(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                            COMMENT 'User-provided caption (Bengali)',

    `uploaded_by`           INT DEFAULT NULL
                            COMMENT 'FK to admin_users.id',

    `uploaded_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    PRIMARY KEY (`id`),

    CONSTRAINT `fk_pd_project_id`
        FOREIGN KEY (`project_id`)  REFERENCES `projects` (`id`)     ON DELETE CASCADE,

    CONSTRAINT `fk_pd_uploaded_by`
        FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`)  ON DELETE SET NULL,

    -- Search indexes
    KEY `idx_pd_project_id`        (`project_id`),
    KEY `idx_pd_extraction_status` (`extraction_status`),
    KEY `idx_pd_uploaded_at`       (`uploaded_at`),

    -- Full-text search on extracted content
    FULLTEXT KEY `ft_pd_extracted` (`extracted_text`),
    FULLTEXT KEY `ft_pd_keywords`  (`keyword_json`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='প্রকল্প ডকুমেন্ট — Uploaded documents with extracted text for search';
