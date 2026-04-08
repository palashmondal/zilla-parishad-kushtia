-- ============================================================
-- Migration 018: Fix memo_number UNIQUE constraint conflict
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- Table: approval_memos
-- ============================================================
--
-- Problem: Migration 011 attempted to make memo_number nullable,
-- but the original UNIQUE constraint was not properly removed.
-- This left the table with conflicting constraints that prevent
-- monthly memos (which set memo_number = NULL) from being inserted.
--
-- Solution: Properly drop the UNIQUE constraint and ensure only
-- the new unique index exists.
-- ============================================================

USE zpkushti_zpk;

-- Drop the old memo_number index/constraint if it exists
-- This removes the UNIQUE constraint that was preventing monthly memos from being inserted
ALTER TABLE `approval_memos`
DROP INDEX `memo_number`;

-- Recreate the unique index to allow multiple NULLs (for monthly memos)
CREATE UNIQUE INDEX `idx_memo_number_unique` ON `approval_memos` (`memo_number`);

-- ============================================================
-- Verification (can be run separately to check the index state):
-- SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX, IS_UNIQUE
-- FROM INFORMATION_SCHEMA.STATISTICS
-- WHERE TABLE_SCHEMA = 'zpkushti_zpk'
--   AND TABLE_NAME = 'approval_memos'
--   AND COLUMN_NAME = 'memo_number'
-- ORDER BY INDEX_NAME;
-- ============================================================
