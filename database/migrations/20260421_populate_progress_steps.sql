-- Populate progress_step_definitions with CPPC, Tender, and RFQ workflows
USE zpk;

-- Clear existing data if any (safe truncate without foreign key issues)
DELETE FROM progress_step_definitions WHERE 1=1;
ALTER TABLE progress_step_definitions AUTO_INCREMENT = 1;

INSERT INTO progress_step_definitions (implementation_method, step_order, bengali_description, base_percentage, is_dynamic_calculation, dynamic_min_percentage, dynamic_max_percentage) VALUES
-- CPPC Steps
('cppc', 1, 'অনুমোদন প্রদান', 0, 0, NULL, NULL),
('cppc', 2, 'কাজের দরদাম নির্ধারণ', 10, 0, NULL, NULL),
('cppc', 3, 'চুক্তি স্বাক্ষর', 10, 0, NULL, NULL),
('cppc', 4, 'কাজ চলমান', 50, 1, 40, 70),
('cppc', 5, 'কাজ সম্পন্ন', 85, 0, NULL, NULL),
('cppc', 6, 'চূড়ান্ত বিল প্রদান', 100, 0, NULL, NULL),

-- Tender Steps
('tender', 1, 'অনুমোদন প্রদান', 0, 0, NULL, NULL),
('tender', 2, 'নিবিদা বিজ্ঞপ্তি প্রকাশ', 5, 0, NULL, NULL),
('tender', 3, 'নিবিদা মূল্যায়ন', 10, 0, NULL, NULL),
('tender', 4, 'চুক্তি স্বাক্ষর', 15, 0, NULL, NULL),
('tender', 5, 'চলমান বিল', 50, 1, 40, 70),
('tender', 6, 'কাজ সম্পন্ন', 85, 0, NULL, NULL),
('tender', 7, 'চূড়ান্ত বিল প্রদান', 100, 0, NULL, NULL),

-- RFQ Steps
('rfq', 1, 'অনুমোদন প্রদান', 0, 0, NULL, NULL),
('rfq', 2, 'কোটেশন আমন্ত্রণ', 5, 0, NULL, NULL),
('rfq', 3, 'কোটেশন মূল্যায়ন', 10, 0, NULL, NULL),
('rfq', 4, 'চুক্তি স্বাক্ষর', 15, 0, NULL, NULL),
('rfq', 5, 'চলমান বিল', 50, 1, 40, 70),
('rfq', 6, 'কাজ সম্পন্ন', 85, 0, NULL, NULL),
('rfq', 7, 'চূড়ান্ত বিল প্রদান', 100, 0, NULL, NULL);
