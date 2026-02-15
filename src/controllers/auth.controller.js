/**
 * Authentication Controller
 * Handles login, logout, user management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const { jwtSecret, jwtExpiry, bcryptSaltRounds } = require('../../config/auth');

const isProduction = process.env.NODE_ENV === 'production';

const authController = {
    /**
     * Login - authenticate user and return JWT token
     * POST /api/auth/login
     * Body: { username, password }
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Username and password are required'
                });
            }

            // Find user by username
            const [users] = await db.query(
                'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
                [username]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid username or password'
                });
            }

            const user = users[0];

            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid username or password'
                });
            }

            // Update last_login timestamp
            await db.query(
                'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
                [user.id]
            );

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name
                },
                jwtSecret,
                { expiresIn: jwtExpiry }
            );

            // Return token and user info (exclude password_hash)
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    designation: user.designation,
                    office_name: user.office_name,
                    photo_path: user.photo_path,
                    role: user.role,
                    last_login: user.last_login
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Get current user info
     * GET /api/auth/me
     * Requires: Authorization header with Bearer token
     */
    async getCurrentUser(req, res) {
        try {
            const userId = req.user.id;

            const [users] = await db.query(
                `SELECT id, username, email, full_name, designation, office_name,
                        photo_path, role, last_login, created_at
                 FROM admin_users
                 WHERE id = ? AND is_active = TRUE`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User account may have been deactivated'
                });
            }

            res.json(users[0]);
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                error: 'Failed to fetch user',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Create new user (admin only)
     * POST /api/auth/users
     * Body: { username, password, email, full_name, designation, office_name, photo_path, role }
     */
    async createUser(req, res) {
        try {
            const {
                username,
                password,
                email,
                full_name,
                designation,
                office_name,
                photo_path,
                role
            } = req.body;

            // Validation
            if (!username || !password || !email || !full_name) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Username, password, email, and full name are required'
                });
            }

            // Check if username already exists
            const [existingUsers] = await db.query(
                'SELECT id FROM admin_users WHERE username = ?',
                [username]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Username already exists'
                });
            }

            // Check if email already exists
            const [existingEmails] = await db.query(
                'SELECT id FROM admin_users WHERE email = ?',
                [email]
            );

            if (existingEmails.length > 0) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Email already exists'
                });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, bcryptSaltRounds);

            // Insert new user
            const [result] = await db.query(
                `INSERT INTO admin_users
                (username, password_hash, email, full_name, designation,
                 office_name, photo_path, role, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username,
                    password_hash,
                    email,
                    full_name,
                    designation || null,
                    office_name || null,
                    photo_path || null,
                    role || 'user',
                    req.user.id  // created_by = current admin
                ]
            );

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                userId: result.insertId
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                error: 'Failed to create user',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * List all users (admin only)
     * GET /api/auth/users
     */
    async listUsers(req, res) {
        try {
            const [users] = await db.query(
                `SELECT id, username, email, full_name, designation, office_name,
                        photo_path, role, is_active, last_login, created_at
                 FROM admin_users
                 ORDER BY created_at DESC`
            );

            res.json(users);
        } catch (error) {
            console.error('List users error:', error);
            res.status(500).json({
                error: 'Failed to fetch users',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Update user (admin only)
     * PUT /api/auth/users/:id
     * Body: { email, full_name, designation, office_name, photo_path, role, is_active }
     */
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            const {
                email,
                full_name,
                designation,
                office_name,
                photo_path,
                role,
                is_active
            } = req.body;

            // Build dynamic update query
            const updates = [];
            const values = [];

            if (email !== undefined) {
                updates.push('email = ?');
                values.push(email);
            }
            if (full_name !== undefined) {
                updates.push('full_name = ?');
                values.push(full_name);
            }
            if (designation !== undefined) {
                updates.push('designation = ?');
                values.push(designation);
            }
            if (office_name !== undefined) {
                updates.push('office_name = ?');
                values.push(office_name);
            }
            if (photo_path !== undefined) {
                updates.push('photo_path = ?');
                values.push(photo_path);
            }
            if (role !== undefined) {
                updates.push('role = ?');
                values.push(role);
            }
            if (is_active !== undefined) {
                updates.push('is_active = ?');
                values.push(is_active ? 1 : 0);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    error: 'No fields to update',
                    message: 'Provide at least one field to update'
                });
            }

            values.push(userId);

            const [result] = await db.query(
                `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User updated successfully'
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                error: 'Failed to update user',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Deactivate user (admin only) - soft delete
     * DELETE /api/auth/users/:id
     */
    async deactivateUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Prevent deactivating self
            if (userId === req.user.id) {
                return res.status(400).json({
                    error: 'Cannot deactivate self',
                    message: 'You cannot deactivate your own account'
                });
            }

            const [result] = await db.query(
                'UPDATE admin_users SET is_active = FALSE WHERE id = ?',
                [userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User deactivated successfully'
            });
        } catch (error) {
            console.error('Deactivate user error:', error);
            res.status(500).json({
                error: 'Failed to deactivate user',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Change password
     * PUT /api/auth/change-password
     * Body: { current_password, new_password }
     */
    async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;

            if (!current_password || !new_password) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Current and new passwords are required'
                });
            }

            if (new_password.length < 6) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'New password must be at least 6 characters'
                });
            }

            // Get current user's password hash
            const [users] = await db.query(
                'SELECT password_hash FROM admin_users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const passwordMatch = await bcrypt.compare(current_password, users[0].password_hash);

            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const new_password_hash = await bcrypt.hash(new_password, bcryptSaltRounds);

            // Update password
            await db.query(
                'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                [new_password_hash, req.user.id]
            );

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                error: 'Failed to change password',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    /**
     * Update current user's profile
     * PUT /api/auth/profile
     * Body: { email, full_name, designation, office_name, photo_path }
     */
    async updateProfile(req, res) {
        try {
            const {
                email,
                full_name,
                designation,
                office_name,
                photo_path
            } = req.body;

            // Build dynamic update query
            const updates = [];
            const values = [];

            if (email !== undefined) {
                // Check if email already exists for another user
                const [existingEmails] = await db.query(
                    'SELECT id FROM admin_users WHERE email = ? AND id != ?',
                    [email, req.user.id]
                );

                if (existingEmails.length > 0) {
                    return res.status(409).json({
                        error: 'Conflict',
                        message: 'Email already exists'
                    });
                }

                updates.push('email = ?');
                values.push(email);
            }

            if (full_name !== undefined) {
                updates.push('full_name = ?');
                values.push(full_name);
            }

            if (designation !== undefined) {
                updates.push('designation = ?');
                values.push(designation);
            }

            if (office_name !== undefined) {
                updates.push('office_name = ?');
                values.push(office_name);
            }

            if (photo_path !== undefined) {
                updates.push('photo_path = ?');
                values.push(photo_path);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    error: 'No fields to update',
                    message: 'Provide at least one field to update'
                });
            }

            values.push(req.user.id);

            const [result] = await db.query(
                `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch updated user data
            const [users] = await db.query(
                `SELECT id, username, email, full_name, designation, office_name,
                        photo_path, role, last_login, created_at
                 FROM admin_users
                 WHERE id = ?`,
                [req.user.id]
            );

            // Generate new JWT token with updated information
            const token = jwt.sign(
                {
                    id: users[0].id,
                    username: users[0].username,
                    email: users[0].email,
                    role: users[0].role,
                    full_name: users[0].full_name
                },
                jwtSecret,
                { expiresIn: jwtExpiry }
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                token,
                user: users[0]
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                error: 'Failed to update profile',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = authController;
