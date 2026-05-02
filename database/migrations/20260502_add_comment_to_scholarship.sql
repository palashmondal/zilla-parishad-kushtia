-- Fix invalid dates and add comment field to scholarship table

-- Step 1: Fix distribution_date column - allow NULL for invalid dates
-- First, modify the column to be VARCHAR temporarily to capture bad data
ALTER TABLE scholarship MODIFY COLUMN distribution_date VARCHAR(20) DEFAULT NULL;

-- Step 2: Convert invalid date strings to NULL
UPDATE scholarship SET distribution_date = NULL WHERE distribution_date = '0000-00-00' OR TRIM(distribution_date) = '' OR distribution_date IS NULL;

-- Step 3: Convert the column back to DATE
ALTER TABLE scholarship MODIFY COLUMN distribution_date DATE DEFAULT NULL;

-- Step 4: Add comment field to scholarship table
ALTER TABLE scholarship ADD COLUMN `comment` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'মন্তব্য — optional comments or notes about the scholarship' AFTER `disbursement_method`;
