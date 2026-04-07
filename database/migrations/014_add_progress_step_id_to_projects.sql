-- Add progress_step_id field to projects table for tracking selected progress step
ALTER TABLE projects ADD COLUMN progress_step_id INT DEFAULT NULL COMMENT 'FK to progress_step_definitions.id — selected progress step' AFTER progress_percentage;

-- Add foreign key constraint
ALTER TABLE projects ADD CONSTRAINT fk_projects_progress_step_id
  FOREIGN KEY (progress_step_id) REFERENCES progress_step_definitions(id) ON DELETE SET NULL;

-- Add index for faster lookups
ALTER TABLE projects ADD INDEX idx_progress_step_id (progress_step_id);
