const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadProjectImages } = require('../middleware/upload');

// Public routes
router.get('/search', searchLimiter, projectsController.search);
router.get('/years', projectsController.getYears);
router.get('/available-memos/:financialYear', projectsController.getAvailableMemos);
router.get('/upazilas', projectsController.getUpazilas);
router.get('/stats', projectsController.getStats);
router.get('/list', projectsController.getAll);
router.get('/:id/progress', projectsController.getProgressLog);
router.get('/:id/images', projectsController.getImages);
router.get('/:id/documents', projectsController.getDocuments);
router.get('/:id', projectsController.getById);

// Protected routes (require authentication + admin role)
router.post('/check-duplicates', requireAuth, requireAdmin, projectsController.checkDuplicates);
router.post('/', requireAuth, requireAdmin, projectsController.create);
router.put('/:id', requireAuth, requireAdmin, projectsController.update);
router.put('/:id/update', requireAuth, requireAdmin, projectsController.update);
router.delete('/:id', requireAuth, requireAdmin, projectsController.delete);
router.delete('/:id/delete', requireAuth, requireAdmin, projectsController.delete);

// Progress & image upload routes
router.post('/:id/progress', requireAuth, requireAdmin, projectsController.addProgress);
router.post('/:id/images', requireAuth, requireAdmin, uploadProjectImages.array('images', 10), projectsController.addImages);
router.delete('/:id/images/:imageId', requireAuth, requireAdmin, projectsController.deleteImage);

module.exports = router;
