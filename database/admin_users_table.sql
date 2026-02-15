-- Create admin_users table with extended fields for user management
-- Includes: username, password, email, designation, office, photo, role, and audit fields

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique username for login',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'User email address',
    full_name VARCHAR(255) NOT NULL COMMENT 'Full name in Bengali or English',
    designation VARCHAR(255) COMMENT 'Job title/designation (e.g., সহকারী প্রকৌশলী)',
    office_name VARCHAR(255) COMMENT 'Office/department name (e.g., জেলা পরিষদ কুষ্টিয়া)',
    photo_path VARCHAR(500) COMMENT 'Relative path to user profile photo',
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user' COMMENT 'Admin = full access, User = limited access',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status - can be deactivated instead of deleted',
    last_login TIMESTAMP NULL COMMENT 'Last successful login timestamp',
    created_by INT COMMENT 'ID of admin who created this user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Admin and user accounts with role-based access control';

-- Seed default admin user
-- Password: admin123 (MUST be changed on first login)
-- Bcrypt hash generated with salt rounds = 10
INSERT INTO admin_users (
    username,
    password_hash,
    email,
    full_name,
    designation,
    office_name,
    role,
    is_active
) VALUES (
    'admin',
    '$2b$10$sLogrkzaGivcYxa9VRmHJeOKp6HytwWGK/H5FQLyVRXZO54s/yiu6',  -- Password: admin123
    'admin@zpkushtia.info',
    'System Administrator',
    'System Admin',
    'জেলা পরিষদ, কুষ্টিয়া',
    'admin',
    TRUE
);

-- Note: The password hash above is a placeholder.
-- Generate the actual hash by running:
-- node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
