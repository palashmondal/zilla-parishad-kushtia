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
    : ['http://localhost:3000', 'http://localhost:3443', 'https://zpkushtia.org'];

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

// JSON and URL-encoded parsers (skip multipart/form-data for file uploads)
app.use((req, res, next) => {
    const contentType = req.get('content-type') || '';
    console.log(`[${req.method}] ${req.url} - Content-Type: ${contentType}`);
    if (contentType.includes('multipart/form-data')) {
        console.log('  -> Skipping JSON parser (multipart detected)');
        return next();
    }
    express.json({ limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
    const contentType = req.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
        return next();
    }
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
});

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

// Redirect root to projects
app.get('/', (req, res) => {
    res.redirect('/projects.html');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Sync projects with their latest progress logs on startup
async function syncProjectProgressOnStartup() {
    try {
        const pool = require('../config/database');
        const conn = await pool.getConnection();
        const [projects] = await conn.execute(`
            SELECT DISTINCT p.id, p.project_name, p.progress_percentage, p.allocation_amount
            FROM projects p
            INNER JOIN project_progress_log ppl ON p.id = ppl.project_id
            WHERE p.progress_percentage != ppl.progress_percentage
            OR p.released_amount != ppl.released_amount
            LIMIT 100
        `);

        if (projects.length > 0) {
            console.log(`[STARTUP] Syncing ${projects.length} projects with out-of-sync progress data...`);
            for (const proj of projects) {
                const [[latestLog]] = await conn.execute(`
                    SELECT progress_percentage, released_amount
                    FROM project_progress_log
                    WHERE project_id = ?
                    ORDER BY logged_at DESC
                    LIMIT 1
                `, [proj.id]);

                if (latestLog) {
                    // Validate released_amount doesn't exceed constraint (allocation * 1.05)
                    let releasedAmount = parseFloat(latestLog.released_amount);
                    const maxAllowed = parseFloat(proj.allocation_amount) * 1.05;
                    if (releasedAmount > maxAllowed) {
                        console.log(`[STARTUP]   ! Project ${proj.id}: Released amount ${releasedAmount} exceeds max ${maxAllowed}, capping...`);
                        releasedAmount = parseFloat(proj.allocation_amount);
                    }

                    await conn.execute(`
                        UPDATE projects
                        SET progress_percentage = ?, released_amount = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `, [latestLog.progress_percentage, releasedAmount, proj.id]);
                    console.log(`[STARTUP]   ✓ Synced project ${proj.id}: ${proj.project_name}`);
                }
            }
            console.log(`[STARTUP] Project sync complete`);
        }
        conn.release();
    } catch (error) {
        console.error('[STARTUP] Error syncing projects:', error.message);
    }
}

// Start HTTP server
const httpServer = http.createServer(app);

// Sync projects on startup, then start server
syncProjectProgressOnStartup().then(() => {
    httpServer.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(`✓ HTTP Server running on port ${PORT}`);
        console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
        console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
        console.log('='.repeat(60));
    });
}).catch(error => {
    console.error('[STARTUP] Critical error during sync:', error);
    httpServer.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(`✓ HTTP Server running on port ${PORT} (sync failed but server started)`);
        console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
        console.log('='.repeat(60));
    });
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
