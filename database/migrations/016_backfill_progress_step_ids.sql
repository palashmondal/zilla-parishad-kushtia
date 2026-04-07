-- Backfill progress_step_id for existing progress logs
-- Match progress logs to steps based on their progress_percentage and implementation_method

-- For each progress log, find the matching progress step
-- by joining with progress_step_definitions where base_percentage matches exactly
UPDATE project_progress_log ppl
JOIN progress_step_definitions psd ON ppl.progress_percentage = psd.base_percentage
SET ppl.progress_step_id = psd.id
WHERE ppl.progress_step_id IS NULL;

-- For logs where progress_percentage doesn't match exactly,
-- match by finding the closest/highest step <= progress_percentage
-- for the same implementation method
UPDATE project_progress_log ppl
JOIN projects p ON ppl.project_id = p.id
SET ppl.progress_step_id = (
    SELECT psd.id
    FROM progress_step_definitions psd
    WHERE psd.implementation_method = (
        CASE
            WHEN p.implementation_method = 'সিপিপিসি' THEN 'cppc'
            WHEN p.implementation_method = 'টেন্ডার' THEN 'tender'
            WHEN p.implementation_method = 'আরএফকিউ' THEN 'rfq'
            ELSE 'cppc'
        END
    )
    AND psd.base_percentage <= ppl.progress_percentage
    ORDER BY psd.base_percentage DESC
    LIMIT 1
)
WHERE ppl.progress_step_id IS NULL;
