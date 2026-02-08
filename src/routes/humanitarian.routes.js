const express = require('express');
const router = express.Router();
const humanitarianController = require('../controllers/humanitarian.controller');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/search', searchLimiter, humanitarianController.search);
router.get('/years', humanitarianController.getYears);
router.get('/stats', humanitarianController.getStats);
router.get('/list', humanitarianController.getAll);
router.get('/:id', humanitarianController.getById);

// Protected routes (auth middleware will be added in Phase 2)
router.post('/create', humanitarianController.create);
router.put('/:id/update', humanitarianController.update);
router.delete('/:id/delete', humanitarianController.delete);

module.exports = router;
