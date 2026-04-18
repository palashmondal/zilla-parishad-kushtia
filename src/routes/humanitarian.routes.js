const express = require('express');
const router = express.Router();
const humanitarianController = require('../controllers/humanitarian.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireModule } = require('../middleware/auth');

// Public routes
router.get('/search', searchLimiter, humanitarianController.search);
router.get('/years', humanitarianController.getYears);
router.get('/stats', humanitarianController.getStats);
router.get('/list', humanitarianController.getAll);
router.get('/:id', humanitarianController.getById);

// Protected routes (require authentication + humanitarian_aid module access)
router.post('/', requireAuth, requireModule('humanitarian_aid'), humanitarianController.create);
router.post('/create', requireAuth, requireModule('humanitarian_aid'), humanitarianController.create);
router.put('/:id', requireAuth, requireModule('humanitarian_aid'), humanitarianController.update);
router.put('/:id/update', requireAuth, requireModule('humanitarian_aid'), humanitarianController.update);
router.delete('/:id', requireAuth, requireModule('humanitarian_aid'), humanitarianController.delete);
router.delete('/:id/delete', requireAuth, requireModule('humanitarian_aid'), humanitarianController.delete);

module.exports = router;
