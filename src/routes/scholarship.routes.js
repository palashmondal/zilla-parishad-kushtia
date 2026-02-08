const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarship.controller');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/search', searchLimiter, scholarshipController.search);
router.get('/years', scholarshipController.getYears);
router.get('/stats', scholarshipController.getStats);
router.get('/list', scholarshipController.getAll);
router.get('/:id', scholarshipController.getById);

// Protected routes (auth middleware will be added in Phase 2)
router.post('/create', scholarshipController.create);
router.put('/:id/update', scholarshipController.update);
router.delete('/:id/delete', scholarshipController.delete);

module.exports = router;
