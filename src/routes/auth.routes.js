/**
 * Authentication Routes
 * Login, logout, user management endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const upload = require('../../config/upload');

// Public routes
router.post('/login', loginLimiter, authController.login);

// Protected routes (require authentication)
router.get('/me', requireAuth, authController.getCurrentUser);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/change-password', requireAuth, authController.changePassword);

// Profile picture upload
router.post('/profile/photo', requireAuth, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select an image file'
            });
        }

        // Return the uploaded file path
        const photoPath = `/uploads/profiles/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo_path: photoPath
        });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
});

// Admin-only routes (require authentication + admin role)
router.post('/users', requireAuth, requireAdmin, authController.createUser);
router.get('/users', requireAuth, requireAdmin, authController.listUsers);
router.put('/users/:id', requireAuth, requireAdmin, authController.updateUser);
router.delete('/users/:id', requireAuth, requireAdmin, authController.deactivateUser);

module.exports = router;
