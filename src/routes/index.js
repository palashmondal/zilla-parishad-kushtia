const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const scholarshipRoutes = require('./scholarship.routes');
const humanitarianRoutes = require('./humanitarian.routes');
const usersRoutes = require('./users.routes');
const projectsRoutes = require('./projects.routes');

router.use('/auth', authRoutes);
router.use('/scholarship', scholarshipRoutes);
router.use('/humanitarian', humanitarianRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ZP Kushtia Beneficiary API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
