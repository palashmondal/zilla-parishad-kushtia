const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All user routes require admin privileges
router.use(requireAuth, requireAdmin);

// Get all users (with optional search)
router.get('/', usersController.getAllUsers);

// Get user by ID
router.get('/:id', usersController.getUserById);

// Create new user
router.post('/', usersController.createUser);

// Update user
router.put('/:id', usersController.updateUser);

// Delete user
router.delete('/:id', usersController.deleteUser);

module.exports = router;
