const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Ensure database connects on startup
require('../config/database');

const apiRoutes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3443', 'https://zpkushtia.info'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200
};

// Trust proxy (Nginx forwards requests)
app.set('trust proxy', 1);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Static files (no rate limiting on static assets)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/favicon', express.static(path.join(__dirname, '..', 'favicon')));

// API routes (rate limiting applied only to API endpoints)
// Conditionally apply rate limiting - disabled in development
if (isProduction) {
    app.use('/api', generalLimiter, apiRoutes);
} else {
    app.use('/api', apiRoutes);
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`✓ HTTP Server running on port ${PORT}`);
    console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
});

// Start HTTPS server if enabled
let httpsServer;
if (USE_HTTPS) {
    try {
        const sslOptions = {
            key: fs.readFileSync(process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'ssl', 'private.key')),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'ssl', 'certificate.crt')),
        };

        httpsServer = https.createServer(sslOptions, app);
        httpsServer.listen(HTTPS_PORT, () => {
            console.log('='.repeat(60));
            console.log(`✓ HTTPS Server running on port ${HTTPS_PORT}`);
            console.log(`✓ API endpoint: https://localhost:${HTTPS_PORT}/api`);
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('✗ HTTPS Server failed to start:', error.message);
        console.error('  Continuing with HTTP only...');
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing servers');
    httpServer.close(() => console.log('HTTP server closed'));
    if (httpsServer) {
        httpsServer.close(() => console.log('HTTPS server closed'));
    }
    require('../config/database').end();
});
