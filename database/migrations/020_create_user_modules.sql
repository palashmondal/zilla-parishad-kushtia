-- Migration 020: Per-user module access control
-- Each row grants a user access to one module.
-- Admin role bypasses this table entirely (checked in middleware).
-- No row = no access for non-admin users.

CREATE TABLE IF NOT EXISTS user_modules (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    module_name VARCHAR(50) NOT NULL,
    granted_by  INT NOT NULL,
    granted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_module (user_id, module_name),
    INDEX idx_user_id (user_id),

    FOREIGN KEY (user_id)    REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
