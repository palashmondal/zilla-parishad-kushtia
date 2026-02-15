/**
 * Authentication Configuration
 * JWT settings for ZP Kushtia admin authentication
 */

module.exports = {
    // JWT secret key - MUST be set in .env for production
    jwtSecret: process.env.JWT_SECRET || 'zpk-dev-secret-change-in-production',

    // Token expiry time (24 hours)
    jwtExpiry: '24h',

    // Bcrypt salt rounds for password hashing
    bcryptSaltRounds: 10,

    // Token cookie name (if using cookies instead of localStorage)
    tokenCookieName: 'zpk_auth_token',

    // Refresh token expiry (7 days - for future implementation)
    refreshTokenExpiry: '7d'
};
