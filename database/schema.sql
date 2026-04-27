-- ============================================
-- Task Management System - Database Schema
-- ============================================
-- This schema creates all necessary tables with proper relationships
-- Execute this in phpMyAdmin SQL tab after creating 'task_manager_db'

-- Set charset for emoji and international character support
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user account information
-- Password will be hashed using PHP password_hash()

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password using bcrypt',
  `full_name` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=suspended',
  
  -- Indexes for faster queries
  INDEX `idx_email` (`email`),
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
-- Predefined and user-created task categories

CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(50) NOT NULL,
  `category_color` VARCHAR(7) DEFAULT '#3498db' COMMENT 'Hex color code',
  `user_id` INT(11) UNSIGNED DEFAULT NULL COMMENT 'NULL for system categories',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Allow same category name for different users
  UNIQUE KEY `unique_category` (`category_name`, `user_id`),
  
  -- Foreign key
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TASKS TABLE
-- ============================================
-- Core table storing all task information

CREATE TABLE IF NOT EXISTS `tasks` (
  `task_id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `category_id` INT(11) UNSIGNED DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  `priority` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  `deadline` DATE DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sort_order` INT(11) DEFAULT 0 COMMENT 'For drag-and-drop ordering',
  
  -- Foreign keys
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Indexes for common queries
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_deadline` (`deadline`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. REMINDERS TABLE
-- ============================================
-- Stores reminder times for tasks

CREATE TABLE IF NOT EXISTS `reminders` (
  `reminder_id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` INT(11) UNSIGNED NOT NULL,
  `reminder_time` DATETIME NOT NULL,
  `is_sent` TINYINT(1) DEFAULT 0 COMMENT '0=pending, 1=sent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Index for reminder queries
  INDEX `idx_reminder_time` (`reminder_time`, `is_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. USER SESSIONS TABLE (Optional - for enhanced security)
-- ============================================
-- Track active user sessions

CREATE TABLE IF NOT EXISTS `user_sessions` (
  `session_id` VARCHAR(128) PRIMARY KEY,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `last_activity` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX `idx_user` (`user_id`),
  INDEX `idx_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
-- System-wide categories available to all users

INSERT INTO `categories` (`category_name`, `category_color`, `user_id`) VALUES
('Work', '#3498db', NULL),
('Personal', '#2ecc71', NULL),
('Urgent', '#e74c3c', NULL),
('Shopping', '#f39c12', NULL),
('Health', '#9b59b6', NULL),
('Learning', '#1abc9c', NULL);

-- ============================================
-- CREATE DEMO USER (for testing)
-- ============================================
-- Password: demo123 (hashed with bcrypt)
-- Use this to test the system before creating your own account

INSERT INTO `users` (`username`, `email`, `password`, `full_name`) VALUES
('demo_user', 'demo@taskmanager.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User');

-- ============================================
-- INSERT SAMPLE TASKS (for demo user)
-- ============================================
-- These help you see how the system works immediately

INSERT INTO `tasks` (`user_id`, `category_id`, `title`, `description`, `status`, `priority`, `deadline`) VALUES
(1, 1, 'Complete project proposal', 'Prepare and submit Q4 project proposal to management', 'In Progress', 'High', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
(1, 2, 'Schedule dentist appointment', 'Annual checkup and cleaning', 'Pending', 'Medium', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
(1, 3, 'Fix production bug', 'Critical bug in payment module needs immediate attention', 'Pending', 'High', CURDATE()),
(1, 4, 'Buy groceries', 'Milk, eggs, bread, vegetables', 'Pending', 'Low', CURDATE()),
(1, 6, 'Finish React course', 'Complete modules 8-10 on Udemy', 'In Progress', 'Medium', DATE_ADD(CURDATE(), INTERVAL 14 DAY));

-- ============================================
-- ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICATION QUERIES (run these to verify setup)
-- ============================================
-- Uncomment and run these one by one to verify your setup

-- SELECT * FROM users;
-- SELECT * FROM categories;
-- SELECT * FROM tasks;
-- SELECT COUNT(*) as total_tasks FROM tasks WHERE user_id = 1;

-- Show tasks with category names
-- SELECT t.task_id, t.title, c.category_name, t.status, t.priority, t.deadline 
-- FROM tasks t 
-- LEFT JOIN categories c ON t.category_id = c.category_id 
-- WHERE t.user_id = 1
-- ORDER BY t.deadline ASC;
