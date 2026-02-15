const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarship.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/search', searchLimiter, scholarshipController.search);
router.get('/years', scholarshipController.getYears);
router.get('/stats', scholarshipController.getStats);
router.get('/list', scholarshipController.getAll);
router.get('/:id', scholarshipController.getById);

// Protected routes (require authentication + admin role)
router.post('/', requireAuth, requireAdmin, scholarshipController.create);
router.post('/create', requireAuth, requireAdmin, scholarshipController.create); // Keep for backward compatibility
router.put('/:id', requireAuth, requireAdmin, scholarshipController.update);
router.put('/:id/update', requireAuth, requireAdmin, scholarshipController.update); // Keep for backward compatibility
router.delete('/:id', requireAuth, requireAdmin, scholarshipController.delete);
router.delete('/:id/delete', requireAuth, requireAdmin, scholarshipController.delete); // Keep for backward compatibility

module.exports = router;
