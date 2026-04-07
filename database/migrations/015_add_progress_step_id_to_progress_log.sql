-- Add progress_step_id field to project_progress_log table
-- This allows tracking which progress step was selected for each log entry
-- Essential for preventing duplicate progress step selection

ALTER TABLE project_progress_log
ADD COLUMN progress_step_id INT DEFAULT NULL
COMMENT 'FK to progress_step_definitions.id — progress step selected for this log entry'
AFTER logged_by;

-- Add foreign key constraint
ALTER TABLE project_progress_log
ADD CONSTRAINT fk_ppl_progress_step_id
FOREIGN KEY (progress_step_id) REFERENCES progress_step_definitions(id) ON DELETE SET NULL;

-- Add index for faster lookups
ALTER TABLE project_progress_log
ADD INDEX idx_ppl_progress_step_id (progress_step_id);
