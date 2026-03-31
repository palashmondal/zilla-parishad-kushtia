-- ============================================================
-- Migration 008: Add Financial Year to Approval Memos
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Table: approval_memos
-- ============================================================

ALTER TABLE `approval_memos`
ADD COLUMN `financial_year` VARCHAR(9) DEFAULT NULL
    COMMENT 'আর্থিক বছর — Format: 2024-2025'
AFTER `memo_date`;

-- Create index for financial year filtering
CREATE INDEX `idx_financial_year` ON `approval_memos` (`financial_year`);
