-- Add distribution date and disbursement method to scholarship table
ALTER TABLE `scholarship`
ADD COLUMN `distribution_date` DATE DEFAULT NULL COMMENT 'অর্থ বিতরণের তারিখ',
ADD COLUMN `disbursement_method` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'বিতরণ পদ্ধতি (বিকাশ/নগদ/রকেট/সরাসরি)';
