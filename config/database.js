const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'zpkushti_zpkuser',
    password: process.env.DB_PASSWORD || 'zpkpassword',
    database: process.env.DB_NAME || 'zpkushti_zpk',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
});

// Test connection on startup and set charset
pool.getConnection()
    .then(async connection => {
        try {
            await connection.execute("SET NAMES utf8mb4");
            await connection.execute("SET CHARACTER SET utf8mb4");
            console.log('✓ Database connected successfully (charset: utf8mb4)');
        } catch (err) {
            console.error('✗ Failed to set charset:', err.message);
        } finally {
            connection.release();
        }
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
    });

module.exports = pool;
