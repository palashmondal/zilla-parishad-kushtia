const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarship.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireModule } = require('../middleware/auth');

// Public routes
router.get('/search', searchLimiter, scholarshipController.search);
router.get('/years', scholarshipController.getYears);
router.get('/stats', scholarshipController.getStats);
router.get('/list', scholarshipController.getAll);
router.get('/:id', scholarshipController.getById);

// Protected routes (require authentication + scholarship module access)
router.post('/', requireAuth, requireModule('scholarship'), scholarshipController.create);
router.post('/create', requireAuth, requireModule('scholarship'), scholarshipController.create);
router.put('/:id', requireAuth, requireModule('scholarship'), scholarshipController.update);
router.put('/:id/update', requireAuth, requireModule('scholarship'), scholarshipController.update);
router.delete('/:id', requireAuth, requireModule('scholarship'), scholarshipController.delete);
router.delete('/:id/delete', requireAuth, requireModule('scholarship'), scholarshipController.delete);

module.exports = router;
