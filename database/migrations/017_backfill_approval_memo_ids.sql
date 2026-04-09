-- ============================================================
-- Migration 017: Backfill approval_memo_id for existing projects
-- Purpose: Link existing projects to their approval_memos by matching memo number and date
-- ============================================================

USE zpkushti_zpk;

-- Update projects by matching approval_memo_number with memo_number and project_approval_date with memo_date
UPDATE projects p
LEFT JOIN approval_memos am ON (
    p.approval_memo_number = am.memo_number
    AND DATE(p.project_approval_date) = DATE(am.memo_date)
)
SET p.approval_memo_id = am.id
WHERE p.approval_memo_id IS NULL
  AND p.approval_memo_number IS NOT NULL
  AND p.project_approval_date IS NOT NULL
  AND am.id IS NOT NULL;

-- Update projects by matching approval_memo_number with meeting_month and project_approval_date with meeting_date (for monthly type)
UPDATE projects p
LEFT JOIN approval_memos am ON (
    p.approval_memo_number = am.meeting_month
    AND DATE(p.project_approval_date) = DATE(am.meeting_date)
)
SET p.approval_memo_id = am.id
WHERE p.approval_memo_id IS NULL
  AND p.approval_memo_number IS NOT NULL
  AND p.project_approval_date IS NOT NULL
  AND am.id IS NOT NULL;

-- Verify the update
SELECT COUNT(*) as total_projects,
       SUM(CASE WHEN approval_memo_id IS NOT NULL THEN 1 ELSE 0 END) as linked_projects,
       SUM(CASE WHEN approval_memo_id IS NULL THEN 1 ELSE 0 END) as unlinked_projects
FROM projects;
