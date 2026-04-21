# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 9.4.0)
# Database: zpkushti_zpk
# Generation Time: 2026-04-20 23:55:22 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table progress_step_definitions
# ------------------------------------------------------------

CREATE TABLE `progress_step_definitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `implementation_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'cppc, tender, or rfq',
  `step_order` int NOT NULL COMMENT 'Order of step within method',
  `bengali_description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bengali description of the step',
  `base_percentage` int NOT NULL COMMENT 'Fixed percentage for this step (0-100)',
  `is_dynamic_calculation` tinyint(1) DEFAULT '0' COMMENT '1 if percentage varies based on fund disbursement',
  `dynamic_min_percentage` int DEFAULT NULL COMMENT 'Minimum percentage for dynamic calculation',
  `dynamic_max_percentage` int DEFAULT NULL COMMENT 'Maximum percentage for dynamic calculation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_method_step` (`implementation_method`,`step_order`),
  KEY `idx_implementation_method` (`implementation_method`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `progress_step_definitions` WRITE;
/*!40000 ALTER TABLE `progress_step_definitions` DISABLE KEYS */;

INSERT INTO `progress_step_definitions` (`id`, `implementation_method`, `step_order`, `bengali_description`, `base_percentage`, `is_dynamic_calculation`, `dynamic_min_percentage`, `dynamic_max_percentage`, `created_at`)
VALUES
	(1,'cppc',1,'সভাপতি বরাবর পত্র প্রেরণ সমাপ্ত',10,0,NULL,NULL,'2026-04-07 13:12:14'),
	(2,'cppc',2,'চুক্তিপত্র ও প্রাক্কলন প্রস্তুতকৃত',20,0,NULL,NULL,'2026-04-07 13:12:14'),
	(3,'cppc',3,'১ম কিস্তি বিতরণ সম্পন্ন',50,0,NULL,NULL,'2026-04-07 13:12:14'),
	(4,'cppc',4,'ইউএনও এর প্রতিবেদন পাওয়া গেছে',80,0,NULL,NULL,'2026-04-07 13:12:14'),
	(5,'cppc',5,'চূড়ান্ত বিল প্রদান সমাপ্ত',100,0,NULL,NULL,'2026-04-07 13:12:14'),
	(6,'tender',1,'টেন্ডার ফ্লোটিং সম্পন্ন',10,0,NULL,NULL,'2026-04-07 13:12:14'),
	(7,'tender',2,'টেন্ডার মূল্যায়ন সম্পন্ন',20,0,NULL,NULL,'2026-04-07 13:12:14'),
	(8,'tender',3,'ঠিকাদার নির্বাচিত ও কার্যাদেশ প্রদান সম্পন্ন',30,0,NULL,NULL,'2026-04-07 13:12:14'),
	(9,'tender',4,'কাজ চলমান',30,1,30,90,'2026-04-07 13:12:14'),
	(10,'tender',6,'কাজ সম্পন্ন',90,0,NULL,NULL,'2026-04-07 13:12:14'),
	(11,'tender',7,'চূড়ান্ত বিল প্রদান সমাপ্ত',100,0,NULL,NULL,'2026-04-07 13:12:14'),
	(12,'rfq',1,'টেন্ডার ফ্লোটিং সম্পন্ন',10,0,NULL,NULL,'2026-04-07 13:12:14'),
	(13,'rfq',2,'টেন্ডার মূল্যায়ন সম্পন্ন',20,0,NULL,NULL,'2026-04-07 13:12:14'),
	(14,'rfq',3,'ঠিকাদার নির্বাচিত ও কার্যাদেশ প্রদান সম্পন্ন',30,0,NULL,NULL,'2026-04-07 13:12:14'),
	(15,'rfq',4,'কাজ চলমান',30,1,30,90,'2026-04-07 13:12:14'),
	(16,'rfq',5,'কাজ সম্পন্ন',90,0,NULL,NULL,'2026-04-07 13:12:14'),
	(17,'rfq',6,'চূড়ান্ত বিল প্রদান সমাপ্ত',100,0,NULL,NULL,'2026-04-07 13:12:14'),
	(19,'tender',5,'রানিং বিল প্রদান',30,1,NULL,NULL,'2026-04-08 03:03:48');

/*!40000 ALTER TABLE `progress_step_definitions` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
