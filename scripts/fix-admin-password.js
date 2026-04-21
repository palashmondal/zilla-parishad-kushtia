#!/usr/bin/env node
/**
 * Fix admin user password hash
 * Regenerates the bcrypt hash for the default admin account
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
    try {
        // Generate correct hash for admin123
        const newPasswordHash = await bcrypt.hash('admin123', 10);

        console.log('Generated password hash:', newPasswordHash);

        // Update the admin user
        const result = await db.query(
            'UPDATE admin_users SET password_hash = ? WHERE username = ?',
            [newPasswordHash, 'admin']
        );

        console.log('✓ Admin password hash updated successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nYou can now login. Remember to change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error updating password:', error.message);
        process.exit(1);
    }
}

fixAdminPassword();
