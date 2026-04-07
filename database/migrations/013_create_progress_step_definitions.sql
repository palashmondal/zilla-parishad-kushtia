-- Create progress_step_definitions table for method-specific progress steps
CREATE TABLE IF NOT EXISTS progress_step_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  implementation_method VARCHAR(50) NOT NULL COMMENT 'cppc, tender, or rfq',
  step_order INT NOT NULL COMMENT 'Order of step within method',
  bengali_description VARCHAR(500) NOT NULL COMMENT 'Bengali description of the step',
  base_percentage INT NOT NULL COMMENT 'Fixed percentage for this step (0-100)',
  is_dynamic_calculation TINYINT(1) DEFAULT 0 COMMENT '1 if percentage varies based on fund disbursement',
  dynamic_min_percentage INT COMMENT 'Minimum percentage for dynamic calculation',
  dynamic_max_percentage INT COMMENT 'Maximum percentage for dynamic calculation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_method_step (implementation_method, step_order),
  INDEX idx_implementation_method (implementation_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data for CPPC method (5 steps)
INSERT INTO progress_step_definitions
(implementation_method, step_order, bengali_description, base_percentage, is_dynamic_calculation, dynamic_min_percentage, dynamic_max_percentage)
VALUES
('cppc', 1, 'সভাপতি বরাবর পত্র প্রেরণ সমাপ্ত', 10, 0, NULL, NULL),
('cppc', 2, 'চুক্তিপত্র ও প্রাক্কলন প্রস্তুতকৃত', 20, 0, NULL, NULL),
('cppc', 3, '১ম কিস্তি বিতরণ সম্পন্ন', 50, 0, NULL, NULL),
('cppc', 4, 'ইউএনও এর প্রতিবেদন পাওয়া গেছে', 80, 0, NULL, NULL),
('cppc', 5, 'চূড়ান্ত বিল প্রদান সমাপ্ত', 100, 0, NULL, NULL);

-- Seed data for Tender method (6 steps)
INSERT INTO progress_step_definitions
(implementation_method, step_order, bengali_description, base_percentage, is_dynamic_calculation, dynamic_min_percentage, dynamic_max_percentage)
VALUES
('tender', 1, 'টেন্ডার ফ্লোটিং সম্পন্ন', 10, 0, NULL, NULL),
('tender', 2, 'টেন্ডার মূল্যায়ন সম্পন্ন', 20, 0, NULL, NULL),
('tender', 3, 'ঠিকাদার নির্বাচিত ও কার্যাদেশ প্রদান সম্পন্ন', 30, 0, NULL, NULL),
('tender', 4, 'কাজ চলমান', 30, 1, 30, 90),
('tender', 5, 'কাজ সম্পন্ন', 90, 0, NULL, NULL),
('tender', 6, 'চূড়ান্ত বিল প্রদান সমাপ্ত', 100, 0, NULL, NULL);

-- Seed data for RFQ method (6 steps - same as Tender)
INSERT INTO progress_step_definitions
(implementation_method, step_order, bengali_description, base_percentage, is_dynamic_calculation, dynamic_min_percentage, dynamic_max_percentage)
VALUES
('rfq', 1, 'টেন্ডার ফ্লোটিং সম্পন্ন', 10, 0, NULL, NULL),
('rfq', 2, 'টেন্ডার মূল্যায়ন সম্পন্ন', 20, 0, NULL, NULL),
('rfq', 3, 'ঠিকাদার নির্বাচিত ও কার্যাদেশ প্রদান সম্পন্ন', 30, 0, NULL, NULL),
('rfq', 4, 'কাজ চলমান', 30, 1, 30, 90),
('rfq', 5, 'কাজ সম্পন্ন', 90, 0, NULL, NULL),
('rfq', 6, 'চূড়ান্ত বিল প্রদান সমাপ্ত', 100, 0, NULL, NULL);
