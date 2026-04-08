-- ============================================================
-- Migration 019: Backfill approval memo documents to projects
-- ZP Kushtia (জেলা পরিষদ, কুষ্টিয়া)
-- ============================================================
--
-- Problem: Projects that have an approval_memo_id but were created
-- before the auto-attachment feature was implemented don't have the
-- approval memo document in their project_documents table.
--
-- Solution: Find all projects with approval_memo_id and add their
-- documents to project_documents if not already present.
-- ============================================================

USE zpkushti_zpk;

-- Add approval memo documents to project_documents for all projects
-- that have an approval_memo_id but don't have the memo document yet
INSERT INTO project_documents (project_id, file_path, original_name, file_type, uploaded_by)
SELECT
    p.id,
    am.document_file,
    CONCAT('অনুমোদন স্মারক (',
           IF(am.memo_type = 'monthly', 'মাসিক সভা', 'মন্ত্রণালয়ের স্মারক'),
           ')'),
    LOWER(SUBSTRING(am.document_file, POSITION('.' IN am.document_file) + 1)),
    NULL
FROM projects p
JOIN approval_memos am ON p.approval_memo_id = am.id
WHERE am.document_file IS NOT NULL
  AND am.document_file != ''
  AND NOT EXISTS (
    SELECT 1 FROM project_documents pd
    WHERE pd.project_id = p.id
    AND pd.file_path = am.document_file
  )
ON DUPLICATE KEY UPDATE file_path = VALUES(file_path);
