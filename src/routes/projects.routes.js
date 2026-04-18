const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { searchLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requireModule } = require('../middleware/auth');
const { uploadProjectImages, uploadProjectDocuments } = require('../middleware/upload');

// Public routes
router.get('/search', searchLimiter, projectsController.search);
router.get('/years', projectsController.getYears);
router.get('/progress-steps', projectsController.getProgressSteps);
router.get('/available-memos/:financialYear', projectsController.getAvailableMemos);
router.get('/upazilas', projectsController.getUpazilas);
router.get('/stats', projectsController.getStats);
router.get('/map-data', projectsController.getMapData);
router.get('/list', projectsController.getAll);
router.get('/:id/progress', projectsController.getProgressLog);
router.get('/:id/images', projectsController.getImages);
router.get('/:id/documents', projectsController.getDocuments);
router.get('/:id', projectsController.getById);

// Protected routes (require authentication + projects module access)
router.post('/check-duplicates', requireAuth, requireModule('projects'), projectsController.checkDuplicates);
router.post('/', requireAuth, requireModule('projects'), projectsController.create);
router.put('/:id', requireAuth, requireModule('projects'), projectsController.update);
router.put('/:id/update', requireAuth, requireModule('projects'), projectsController.update);
router.delete('/:id', requireAuth, requireModule('projects'), projectsController.delete);
router.delete('/:id/delete', requireAuth, requireModule('projects'), projectsController.delete);

// Progress & media upload routes
router.post('/:id/progress', requireAuth, requireModule('projects'), projectsController.addProgress);
router.delete('/:id/progress/:logId', requireAuth, requireModule('projects'), projectsController.deleteProgressLog);
router.post('/:id/images', requireAuth, requireModule('projects'), uploadProjectImages.array('images', 10), projectsController.addImages);
router.delete('/:id/images/:imageId', requireAuth, requireModule('projects'), projectsController.deleteImage);
router.post('/:id/documents', requireAuth, requireModule('projects'), uploadProjectDocuments.array('documents', 10), projectsController.addDocuments);
router.delete('/:id/documents/:docId', requireAuth, requireModule('projects'), projectsController.deleteDocument);

module.exports = router;
