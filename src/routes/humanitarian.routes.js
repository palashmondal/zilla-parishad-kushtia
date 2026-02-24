const express = require('express');
const router = express.Router();
const humanitarianController = require('../controllers/humanitarian.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/search', searchLimiter, humanitarianController.search);
router.get('/years', humanitarianController.getYears);
router.get('/stats', humanitarianController.getStats);
router.get('/list', humanitarianController.getAll);
router.get('/:id', humanitarianController.getById);

// Protected routes (require authentication + admin role)
router.post('/', requireAuth, requireAdmin, humanitarianController.create);
router.post('/create', requireAuth, requireAdmin, humanitarianController.create); // Keep for backward compatibility
router.put('/:id', requireAuth, requireAdmin, humanitarianController.update);
router.put('/:id/update', requireAuth, requireAdmin, humanitarianController.update); // Keep for backward compatibility
router.delete('/:id', requireAuth, requireAdmin, humanitarianController.delete);
router.delete('/:id/delete', requireAuth, requireAdmin, humanitarianController.delete); // Keep for backward compatibility

module.exports = router;
