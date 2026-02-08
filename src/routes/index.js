const express = require('express');
const router = express.Router();

const scholarshipRoutes = require('./scholarship.routes');
const humanitarianRoutes = require('./humanitarian.routes');

router.use('/scholarship', scholarshipRoutes);
router.use('/humanitarian', humanitarianRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ZP Kushtia Beneficiary API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
