/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

/**
 * Verify JWT token and attach user to request
 * Usage: router.get('/protected', requireAuth, controller.method)
 */
const requireAuth = (req, res, next) => {
    try {
        // Extract token from Authorization header (Bearer <token>)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Invalid token format'
            });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, jwtSecret);

        // Attach user info to request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            full_name: decoded.full_name
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Authentication failed'
            });
        }

        // Other errors
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Authentication error',
            message: 'An error occurred during authentication'
        });
    }
};

/**
 * Verify user has admin role
 * Must be used AFTER requireAuth middleware
 * Usage: router.delete('/item/:id', requireAuth, requireAdmin, controller.delete)
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'User not authenticated'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }

    next();
};

/**
 * Optional auth - attach user if token exists, but don't require it
 * Useful for endpoints that have different behavior for logged-in users
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            if (token) {
                const decoded = jwt.verify(token, jwtSecret);
                req.user = {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                    role: decoded.role,
                    full_name: decoded.full_name
                };
            }
        }
    } catch (error) {
        // Silently fail - just don't attach user
        req.user = null;
    }

    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    optionalAuth
};
