-- ============================================================
-- Migration 006: Project Approval Memos Table
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Table: approval_memos
-- ============================================================

CREATE TABLE IF NOT EXISTS `approval_memos` (
    -- অনুমোদন স্মারক আইডি — auto-increment integer
    `id`                        INT NOT NULL AUTO_INCREMENT,

    -- স্মারক তারিখ — date of the memo/approval
    `memo_date`                 DATE NOT NULL
                                COMMENT 'স্মারক তারিখ — date of the approval memo',

    -- স্মারক নম্বর — unique memo number (e.g., "00.00.334.25.26.001.23.515")
    `memo_number`               VARCHAR(50) NOT NULL UNIQUE
                                COMMENT 'স্মারক নম্বর — memo/reference number',

    -- মোট প্রকল্প সংখ্যা — total number of projects in this memo
    `total_projects`            INT NOT NULL DEFAULT 0
                                COMMENT 'মোট প্রকল্প সংখ্যা — total number of projects covered',

    -- মন্তব্য — optional remarks
    `remarks`                   TEXT COLLATE utf8mb4_unicode_ci
                                COMMENT 'মন্তব্য — optional notes or remarks',

    -- Audit fields
    `created_by`                INT DEFAULT NULL
                                COMMENT 'FK to admin_users.id — who created this memo',
    `created_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (`id`),

    -- Foreign key
    CONSTRAINT `fk_approval_memos_created_by`
        FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,

    -- Indexes
    KEY `idx_memo_date`         (`memo_date`),
    KEY `idx_memo_number`       (`memo_number`),
    KEY `idx_created_at`        (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='প্রকল্প অনুমোদন স্মারক — Project approval memos with date, number, and project count';
