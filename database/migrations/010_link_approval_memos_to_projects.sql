-- Migration 010: Link Approval Memos to Projects
-- Purpose: Add approval_memo_id foreign key to create relationship between projects and approval_memos
-- Note: project_approval_date and approval_memo_number are kept for backward compatibility

USE zpkushti_zpk;

-- Add new column for approval memo foreign key (if it doesn't exist)
-- Check if column exists first using a conditional approach
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'projects'
    AND TABLE_SCHEMA = 'zpkushti_zpk'
    AND COLUMN_NAME = 'approval_memo_id'
);

-- Only add column if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE projects ADD COLUMN approval_memo_id INT NULL AFTER approval_memo_number',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @index_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_NAME = 'projects'
    AND TABLE_SCHEMA = 'zpkushti_zpk'
    AND INDEX_NAME = 'idx_approval_memo_id'
);

SET @index_sql = IF(@index_exists = 0,
    'ALTER TABLE projects ADD INDEX idx_approval_memo_id (approval_memo_id)',
    'SELECT 1'
);
PREPARE idx_stmt FROM @index_sql;
EXECUTE idx_stmt;
DEALLOCATE PREPARE idx_stmt;

-- Add foreign key constraint if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_NAME = 'projects'
    AND TABLE_SCHEMA = 'zpkushti_zpk'
    AND CONSTRAINT_NAME = 'fk_projects_approval_memo'
);

SET @fk_sql = IF(@fk_exists = 0,
    'ALTER TABLE projects ADD CONSTRAINT fk_projects_approval_memo FOREIGN KEY (approval_memo_id) REFERENCES approval_memos(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Update column comments
ALTER TABLE projects
  MODIFY COLUMN project_approval_date DATE NULL
    COMMENT 'Approval date from the approval memo',
  MODIFY COLUMN approval_memo_number VARCHAR(100) NULL
    COMMENT 'Reference number from the approval memo',
  MODIFY COLUMN approval_memo_id INT NULL
    COMMENT 'Foreign key to approval_memos.id - links project to its approval memo';
