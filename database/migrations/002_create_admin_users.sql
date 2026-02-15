-- Migration: Create admin_users table for authentication
-- Created: 2025-02-15

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    designation VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    office_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    photo_path VARCHAR(500),
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Default username: admin
-- Default password: ZPKushtia@2025 (MUST be changed on first login)
-- Password hash generated with bcryptjs (10 rounds)
INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active)
VALUES (
    'admin',
    '$2b$10$sJ5rJu5FvGknfZRnrJ6Jeuf3bxFWt3NcgCc5mLlRPC0tp0YjwvRla',
    'admin@zpkushtia.info',
    'সিস্টেম প্রশাসক',
    'admin',
    TRUE
)
ON DUPLICATE KEY UPDATE username = username;
