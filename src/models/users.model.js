const pool = require('../../config/database');

/**
 * Get all users with optional search
 */
exports.getAllUsers = async (searchQuery = null) => {
    let query = `
        SELECT id, username, email, full_name, designation, office_name,
               photo_path, role, is_active, last_login, created_at
        FROM admin_users
    `;

    const params = [];

    if (searchQuery && searchQuery.trim()) {
        query += ` WHERE
            full_name LIKE ? OR
            username LIKE ? OR
            email LIKE ? OR
            designation LIKE ?
        `;
        const searchPattern = `%${searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Get user by ID
 */
exports.getUserById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id, username, email, full_name, designation, office_name,
                photo_path, role, is_active, last_login, created_at
         FROM admin_users
         WHERE id = ?`,
        [id]
    );
    return rows[0];
};

/**
 * Get user by username
 */
exports.getUserByUsername = async (username) => {
    const [rows] = await pool.query(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
    );
    return rows[0];
};

/**
 * Get user by email
 */
exports.getUserByEmail = async (email) => {
    const [rows] = await pool.query(
        'SELECT * FROM admin_users WHERE email = ?',
        [email]
    );
    return rows[0];
};

/**
 * Create new user
 */
exports.createUser = async (userData) => {
    const { username, email, password_hash, full_name, designation, office_name, role, is_active, created_by } = userData;

    const [result] = await pool.query(
        `INSERT INTO admin_users
         (username, email, password_hash, full_name, designation, office_name, role, is_active, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password_hash, full_name, designation, office_name, role, is_active, created_by]
    );

    return result.insertId;
};

/**
 * Update user
 */
exports.updateUser = async (id, userData) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(userData)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    values.push(id);

    await pool.query(
        `UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
};

/**
 * Delete user
 */
exports.deleteUser = async (id) => {
    await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);
};
