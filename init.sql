-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tutor_ss
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `submitted_by` int unsigned DEFAULT NULL,
  `reviewed_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `availabilities`
--

DROP TABLE IF EXISTS `availabilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `availabilities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` int unsigned NOT NULL,
  `available_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `availabilities_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `availabilities`
--

LOCK TABLES `availabilities` WRITE;
/*!40000 ALTER TABLE `availabilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `availabilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `availability_slots`
--

DROP TABLE IF EXISTS `availability_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `availability_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weekday` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_recurring` tinyint(1) DEFAULT '1',
  `tutor_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `availability_slots_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `availability_slots`
--

LOCK TABLES `availability_slots` WRITE;
/*!40000 ALTER TABLE `availability_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `availability_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int unsigned NOT NULL,
  `tutor_id` int unsigned NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` enum('online','offline') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `session_number` int unsigned DEFAULT NULL,
  `total_sessions` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `session_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `tutor_id` (`tutor_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (22,3,2,'Toán cao c?p','2025-10-28','14:00:00','16:00:00','Online - Zoom','online','confirmed','Ch??ng 3: Gi?i h?n và liên t?c',NULL,NULL,'2025-10-26 15:19:49','2025-10-26 15:19:49',19),(23,3,2,'L?p trình C++','2025-10-29','09:00:00','11:00:00','Phòng H1-201','offline','pending','Bài t?p v? con tr? và m?ng',NULL,NULL,'2025-10-26 15:19:49','2025-10-26 15:19:49',20);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tutor_id` int DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('pdf','doc','docx','ppt','video','image') COLLATE utf8mb4_unicode_ci DEFAULT 'pdf',
  `category` enum('lecture','exercise','exam','reference') COLLATE utf8mb4_unicode_ci DEFAULT 'lecture',
  `size` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `upload_date` datetime DEFAULT NULL,
  `downloads` int DEFAULT '0',
  `rating` float DEFAULT '0',
  `access` enum('public','private') COLLATE utf8mb4_unicode_ci DEFAULT 'public',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,'Bài giảng','','Tutor #2',2,'1761661516933-815873635.pdf','pdf','exam','4.29MB','2025-10-28 14:25:16',1,0,'public','approved');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `session_id` int DEFAULT NULL,
  `student_id` int unsigned NOT NULL,
  `tutor_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `student_id` (`student_id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedbacks_ibfk_3` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` bigint DEFAULT NULL,
  `url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `upload_date` date NOT NULL,
  `downloads` int DEFAULT '0',
  `tutor_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` bigint unsigned NOT NULL,
  `tutor_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,3,7,3,'Em chào thầy ạ','2025-10-27 15:10:27'),(2,3,7,3,'Thầy ơi em có 1 vài câu hỏi muốn hỏi thầy ạ','2025-10-27 15:10:45'),(3,3,7,3,'Không biết thầy có đang rảnh không ạ','2025-10-27 15:10:53'),(4,3,2,2,'Chào em','2025-10-27 15:11:18'),(5,3,2,3,'Dạ em chào thầy','2025-10-27 15:12:00'),(6,3,7,7,'Chào em','2025-10-27 15:12:17'),(7,3,7,7,'Em hỏi đi nếu được thầy sẽ giải đáp cho em','2025-10-27 15:12:33'),(8,3,2,3,'hello thầy','2025-10-28 14:25:54'),(9,3,2,2,'chào em','2025-10-28 14:25:59');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` int NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `method` enum('cash','bank_transfer','card','momo','zalopay') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `txn_ref` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(3,'student'),(2,'tutor');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `price_per_hour` int DEFAULT NULL,
  `total_price` int DEFAULT NULL,
  `tutor_id` int unsigned NOT NULL,
  `subject_id` int DEFAULT NULL,
  `created_by_student_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tutor_id` (`tutor_id`),
  KEY `subject_id` (`subject_id`),
  KEY `created_by_student_id` (`created_by_student_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`created_by_student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (15,'2025-10-28 14:00:00','2025-10-28 16:00:00','Online - Zoom','confirmed',150000,NULL,2,1,NULL),(16,'2025-10-29 09:00:00','2025-10-29 11:00:00','Phòng H1-201','pending',120000,NULL,2,2,NULL),(17,'2025-10-28 14:00:00','2025-10-28 16:00:00','Online - Zoom','confirmed',150000,NULL,2,1,NULL),(18,'2025-10-29 09:00:00','2025-10-29 11:00:00','Phòng H1-201','pending',120000,NULL,2,2,NULL),(19,'2025-10-28 14:00:00','2025-10-28 16:00:00','Online - Zoom','confirmed',150000,NULL,2,1,NULL),(20,'2025-10-29 09:00:00','2025-10-29 11:00:00','Phòng H1-201','pending',120000,NULL,2,2,NULL);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `program` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'TOANCC','Toán cao c?p',NULL),(2,'CTDL','C?u trúc d? li?u',NULL);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_availability`
--

DROP TABLE IF EXISTS `tutor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_availability` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` int unsigned NOT NULL,
  `weekday` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_availability`
--

LOCK TABLES `tutor_availability` WRITE;
/*!40000 ALTER TABLE `tutor_availability` DISABLE KEYS */;
INSERT INTO `tutor_availability` VALUES (1,2,'1','14:00:00','18:00:00'),(2,2,'3','09:00:00','12:00:00'),(3,2,'5','14:00:00','17:00:00');
/*!40000 ALTER TABLE `tutor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_feedback`
--

DROP TABLE IF EXISTS `tutor_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_feedback` (
  `feedback_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` int unsigned NOT NULL,
  `student_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `feedback_date` date DEFAULT NULL,
  PRIMARY KEY (`feedback_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_feedback`
--

LOCK TABLES `tutor_feedback` WRITE;
/*!40000 ALTER TABLE `tutor_feedback` DISABLE KEYS */;
INSERT INTO `tutor_feedback` VALUES (1,2,'Nguy?n V?n A','Gi?i tích',5.00,'Tutor gi?ng d? hi?u và t?n tâm!','2025-04-02'),(2,2,'Lê Th? B','Toán cao c?p',4.50,'H? tr? bài t?p r?t chi ti?t.','2025-03-20');
/*!40000 ALTER TABLE `tutor_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_materials`
--

DROP TABLE IF EXISTS `tutor_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_materials` (
  `material_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_mb` decimal(6,2) DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `upload_date` date DEFAULT NULL,
  `downloads` int unsigned DEFAULT '0',
  PRIMARY KEY (`material_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_materials`
--

LOCK TABLES `tutor_materials` WRITE;
/*!40000 ALTER TABLE `tutor_materials` DISABLE KEYS */;
INSERT INTO `tutor_materials` VALUES (1,2,'Gi?i tích Ch??ng 1','PDF',2.35,'https://example.com/docs/giaitich1.pdf','2025-03-10',12),(2,2,'Toán cao c?p - Slide 1','PPT',3.50,'https://example.com/docs/toancaocap1.ppt','2025-02-05',7);
/*!40000 ALTER TABLE `tutor_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_profiles`
--

DROP TABLE IF EXISTS `tutor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `experience` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `rating` float DEFAULT '0',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `total_students` int DEFAULT '0',
  `completed_sessions` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tutor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_profiles`
--

LOCK TABLES `tutor_profiles` WRITE;
/*!40000 ALTER TABLE `tutor_profiles` DISABLE KEYS */;
INSERT INTO `tutor_profiles` VALUES (1,2,'5 n?m',150000.00,4.9,NULL,45,230);
/*!40000 ALTER TABLE `tutor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_subjects`
--

DROP TABLE IF EXISTS `tutor_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_subjects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` int unsigned NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_subjects`
--

LOCK TABLES `tutor_subjects` WRITE;
/*!40000 ALTER TABLE `tutor_subjects` DISABLE KEYS */;
INSERT INTO `tutor_subjects` VALUES (1,2,'Toán cao c?p'),(2,2,'Gi?i tích'),(3,2,'??i s? tuy?n tính');
/*!40000 ALTER TABLE `tutor_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutors`
--

DROP TABLE IF EXISTS `tutors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutors` (
  `tutor_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` text COLLATE utf8mb4_unicode_ci,
  `experience_years` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` int unsigned DEFAULT NULL,
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `total_students` int unsigned DEFAULT '0',
  `completed_sessions` int unsigned DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`tutor_id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tutors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutors`
--

LOCK TABLES `tutors` WRITE;
/*!40000 ALTER TABLE `tutors` DISABLE KEYS */;
INSERT INTO `tutors` VALUES (1,'Nguyễn ','tutor@hcmut.edu.vn','0987654324','Khoa Học và Kỹ Thuật Máy Tính',',Hoá đại cương','1 năm','Cử nhân','Giảng viên với nhiều năm kinh nghiệm giảng dạy các môn toán cơ bản và nâng cao. Chuyên về phương pháp giảng dạy hiệu quả và tương tác.','/uploads/avatars/tutor_2_1761661458685.png',200000,0.00,0,0,'2025-10-26 08:49:48','2025-10-28 14:24:29',2),(2,'Tutor','admin@hcmut.edu.vn','Chưa cập nhật','Chưa cập nhật',NULL,'5','Chưa cập nhật','Chưa có giới thiệu bản thân.',NULL,150000,0.00,0,0,'2025-10-26 08:55:43','2025-10-26 08:56:56',NULL),(3,'Hải Nam','hainam@hcmut.edu.vn',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,0,'2025-10-27 11:14:16','2025-10-27 11:14:16',7),(4,'Hải','nam@hcmut.edu.vn',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,0,'2025-10-28 14:27:25','2025-10-28 14:28:36',8);
/*!40000 ALTER TABLE `tutors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sso_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `external_source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_synced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `role_id` int unsigned NOT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,NULL,'tutor@hcmut.edu.vn','Nguyễn ','$2b$10$9GtHNy/nLKBYEKh9JqqL5e.MpczxRHB/E8BgFGc41tWDLrcZi8R8O','active',NULL,NULL,NULL,NULL,'2025-10-26 08:02:35','2025-10-28 14:24:29',2,NULL),(3,NULL,'student@hcmut.edu.vn','Student','$2b$10$jgo4xY.o25yyZyQj1F899uT049NgAoU21g78b5XfW3L/jVAF5e0dW','active',NULL,NULL,NULL,NULL,'2025-10-26 08:02:35','2025-10-26 10:37:27',3,NULL),(5,NULL,'admin@hcmut.edu.vn','Admin','$2b$10$hYLpWQt5v0X0BH6x7mU/a.XMh.InpzHi8KYzUSxyy4Mee47.fNkdG','active',NULL,NULL,NULL,NULL,'2025-10-26 09:57:56','2025-10-26 10:35:03',1,NULL),(7,NULL,'hainam@hcmut.edu.vn','Hải Nam','$2b$10$qRlaHsyeq4Gf/zY1PovoJO.0A599cIb5aGZ.GaMKketkNthgXOtUC','active',NULL,NULL,NULL,NULL,'2025-10-27 11:14:16','2025-10-27 11:14:16',2,NULL),(8,NULL,'nam@hcmut.edu.vn','Hải','$2b$10$8GG0uiIbUpZ.1PdxEKiR.uOUakfsEoMFLnwZxglnQ41jP6H3A5zJ2','active',NULL,NULL,NULL,NULL,'2025-10-28 14:27:25','2025-10-28 14:28:36',2,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 18:20:33
