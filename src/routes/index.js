const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const scholarshipRoutes = require('./scholarship.routes');
const humanitarianRoutes = require('./humanitarian.routes');
const usersRoutes = require('./users.routes');
const projectsRoutes = require('./projects.routes');
const approvalMemosRoutes = require('./approval-memos.routes');

router.use('/auth', authRoutes);
router.use('/scholarship', scholarshipRoutes);
router.use('/humanitarian', humanitarianRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/approval-memos', approvalMemosRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ZP Kushtia Beneficiary API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
