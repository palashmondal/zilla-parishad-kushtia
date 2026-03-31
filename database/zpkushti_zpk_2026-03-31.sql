# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 9.4.0)
# Database: zpkushti_zpk
# Generation Time: 2026-03-31 05:33:58 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table approval_memos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `approval_memos`;

CREATE TABLE `approval_memos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memo_date` date NOT NULL COMMENT 'à¦¸à§à¦®à¦¾à¦°à¦• à¦¤à¦¾à¦°à¦¿à¦– â€” date of the approval memo',
  `memo_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'à¦¸à§à¦®à¦¾à¦°à¦• à¦¨à¦®à§à¦¬à¦° â€” memo/reference number',
  `total_projects` int NOT NULL DEFAULT '0' COMMENT 'à¦®à§‹à¦Ÿ à¦ªà§à¦°à¦•à¦²à§à¦ª à¦¸à¦‚à¦–à§à¦¯à¦¾ â€” total number of projects covered',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'à¦®à¦¨à§à¦¤à¦¬à§à¦¯ â€” optional notes or remarks',
  `document_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'স্মারক ডকুমেন্ট ফাইল — path to attached PDF or Word document',
  `created_by` int DEFAULT NULL COMMENT 'FK to admin_users.id â€” who created this memo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `memo_number` (`memo_number`),
  KEY `fk_approval_memos_created_by` (`created_by`),
  KEY `idx_memo_date` (`memo_date`),
  KEY `idx_memo_number` (`memo_number`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_approval_memos_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='à¦ªà§à¦°à¦•à¦²à§à¦ª à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¸à§à¦®à¦¾à¦°à¦• â€” Project approval memos with date, number, and project count';

LOCK TABLES `approval_memos` WRITE;
/*!40000 ALTER TABLE `approval_memos` DISABLE KEYS */;

INSERT INTO `approval_memos` (`id`, `memo_date`, `memo_number`, `total_projects`, `remarks`, `document_file`, `created_by`, `created_at`, `updated_at`)
VALUES
	(1,'2026-03-19','00.00.33443.2.2333.223.25',10,NULL,NULL,1,'2026-03-30 23:56:47','2026-03-30 23:56:47'),
	(5,'2026-03-14','00.00.33443.2.2333.223.28',98,'null',NULL,1,'2026-03-31 01:08:18','2026-03-31 01:08:18');

/*!40000 ALTER TABLE `approval_memos` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
