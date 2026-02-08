# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 9.4.0)
# Database: zpk
# Generation Time: 2026-02-08 19:50:46 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table humanitarian_aid
# ------------------------------------------------------------

CREATE TABLE `humanitarian_aid` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financial_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nid_birth_reg_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profession` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relation_to_beneficiary` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `upazila` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zila` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'কুষ্টিয়া',
  `mobile` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_eng` decimal(10,2) DEFAULT NULL,
  `bank` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_date` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_details` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Delivered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_father_name` (`father_name`),
  KEY `idx_mother_name` (`mother_name`),
  KEY `idx_nid` (`nid_birth_reg_no`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_address` (`address`(100)),
  KEY `idx_financial_year` (`financial_year`),
  KEY `idx_upazila` (`upazila`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=484 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table scholarship
# ------------------------------------------------------------

CREATE TABLE `scholarship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serial` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Serial from CSV',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'আবেদনকারীর নাম',
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'পিতার নাম',
  `mother_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'মাতার নাম',
  `sang` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'সাং',
  `post` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'পোস্ট',
  `upazila` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'উপজেলা',
  `zila` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'কুষ্টিয়া' COMMENT 'জেলা',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'মোবাইল নম্বর',
  `passing_year` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'পাশের সাল',
  `school` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'প্রতিষ্ঠানের নাম',
  `gpa` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'জিপিএ',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Category (SSC/HSC/JSC)',
  `financial_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Delivered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_father` (`father_name`),
  KEY `idx_mother` (`mother_name`),
  KEY `idx_school` (`school`(255)),
  KEY `idx_phone` (`phone`),
  KEY `idx_upazila` (`upazila`),
  FULLTEXT KEY `ft_search` (`name`,`father_name`,`mother_name`,`school`)
) ENGINE=InnoDB AUTO_INCREMENT=388 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
