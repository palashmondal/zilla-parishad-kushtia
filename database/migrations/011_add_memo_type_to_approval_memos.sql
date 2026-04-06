-- ============================================================
-- Migration 011: Add Memo Type, Meeting Month, and Meeting Date to Approval Memos
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Table: approval_memos
-- ============================================================

USE zpkushti_zpk;

-- Add memo_type column
ALTER TABLE `approval_memos`
ADD COLUMN `memo_type` ENUM('ministry', 'monthly') DEFAULT 'ministry'
    COMMENT 'মন্ত্রণালয় স্মারক বা মাসিক সভায় অনুমোদন — Type of memo: ministry or monthly meeting approval'
AFTER `financial_year`;

-- Add meeting_month column for monthly type memos
ALTER TABLE `approval_memos`
ADD COLUMN `meeting_month` VARCHAR(20) DEFAULT NULL
    COMMENT 'মাসিক সভার মাস — Bengali month name for monthly type memos (e.g., জানুয়ারি, ফেব্রুয়ারি)'
AFTER `memo_type`;

-- Add meeting_date column for monthly type memos
ALTER TABLE `approval_memos`
ADD COLUMN `meeting_date` DATE DEFAULT NULL
    COMMENT 'মাসিক সভার তারিখ — date of the monthly meeting'
AFTER `meeting_month`;

-- Modify memo_date to be nullable (for monthly type memos)
ALTER TABLE `approval_memos`
MODIFY COLUMN `memo_date` DATE NULL
    COMMENT 'স্মারক তারিখ — date of the approval memo (null for monthly type)';

-- Modify memo_number to be nullable (for monthly type memos)
-- First, we need to drop the UNIQUE constraint and recreate it as a partial unique index
ALTER TABLE `approval_memos`
DROP INDEX `memo_number`;

ALTER TABLE `approval_memos`
MODIFY COLUMN `memo_number` VARCHAR(50) NULL
    COMMENT 'স্মারক নম্বর — memo/reference number (null for monthly type)';

-- Create a unique index that allows multiple NULLs (for monthly type memos without memo_number)
CREATE UNIQUE INDEX `idx_memo_number_unique` ON `approval_memos` (`memo_number`);

-- Create index for memo_type filtering
CREATE INDEX `idx_memo_type` ON `approval_memos` (`memo_type`);
