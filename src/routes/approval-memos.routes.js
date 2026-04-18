const express = require('express');
const router = express.Router();
const approvalMemosController = require('../controllers/approval-memos.controller');
const { requireAuth, requireModule } = require('../middleware/auth');
const { uploadApprovalMemoDocument } = require('../middleware/upload');

// Public routes
router.get('/list', approvalMemosController.getAll);
router.get('/years', approvalMemosController.getYears);
router.get('/:id/projects', approvalMemosController.getProjectsByMemoId);
router.get('/:id', approvalMemosController.getById);

// Protected routes (require authentication + projects module access)
router.post('/', requireAuth, requireModule('projects'), uploadApprovalMemoDocument.single('document_file'), approvalMemosController.create);
router.put('/:id', requireAuth, requireModule('projects'), uploadApprovalMemoDocument.single('document_file'), approvalMemosController.update);
router.put('/:id/update', requireAuth, requireModule('projects'), uploadApprovalMemoDocument.single('document_file'), approvalMemosController.update);
router.delete('/:id', requireAuth, requireModule('projects'), approvalMemosController.delete);
router.delete('/:id/delete', requireAuth, requireModule('projects'), approvalMemosController.delete);

module.exports = router;
