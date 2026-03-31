-- ============================================================
-- Migration 007: Add Document File to Approval Memos
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Table: approval_memos
-- ============================================================

ALTER TABLE `approval_memos`
ADD COLUMN `document_file` VARCHAR(255) DEFAULT NULL
    COMMENT 'স্মারক ডকুমেন্ট ফাইল — path to attached PDF or Word document'
AFTER `remarks`;
