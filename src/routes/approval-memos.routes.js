const express = require('express');
const router = express.Router();
const approvalMemosController = require('../controllers/approval-memos.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadApprovalMemoDocument } = require('../middleware/upload');

// Public routes
router.get('/list', approvalMemosController.getAll);
router.get('/years', approvalMemosController.getYears);
router.get('/:id', approvalMemosController.getById);

// Protected routes (require authentication + admin role)
router.post('/', requireAuth, requireAdmin, uploadApprovalMemoDocument.single('document_file'), approvalMemosController.create);
router.put('/:id', requireAuth, requireAdmin, uploadApprovalMemoDocument.single('document_file'), approvalMemosController.update);
router.put('/:id/update', requireAuth, requireAdmin, uploadApprovalMemoDocument.single('document_file'), approvalMemosController.update);
router.delete('/:id', requireAuth, requireAdmin, approvalMemosController.delete);
router.delete('/:id/delete', requireAuth, requireAdmin, approvalMemosController.delete);

module.exports = router;
