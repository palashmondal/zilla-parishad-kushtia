#!/usr/bin/env node

/**
 * Migration Runner for Migration 018
 * Fixes the memo_number UNIQUE constraint conflict that prevents monthly memos from being created
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
    let connection;
    try {
        connection = await pool.getConnection();

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '../database/migrations/018_fix_memo_number_constraint.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');

        // Split by ; to handle multiple statements, remove comments and empty lines
        const statements = sqlContent
            .split(';')
            .map(stmt => {
                // Remove SQL comments (-- style)
                return stmt
                    .split('\n')
                    .map(line => {
                        const commentIdx = line.indexOf('--');
                        return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
                    })
                    .join('\n')
                    .trim();
            })
            .filter(stmt => stmt && stmt !== 'USE zpkushti_zpk');

        console.log(`Running Migration 018: Fix memo_number constraint...`);
        console.log(`Found ${statements.length} SQL statement(s) to execute\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}:`);
            console.log(`${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);

            try {
                await connection.query(statement);
                console.log(`✓ Statement ${i + 1} completed successfully\n`);
            } catch (error) {
                // ER_DUP_KEYNAME (1061) means the index already exists, which is fine
                if (error.code === 'ER_DUP_KEYNAME' || error.errno === 1061) {
                    console.log(`⚠ Statement ${i + 1}: Index already exists (this is OK)\n`);
                } else if (error.code === 'ER_DUP_KEY_NAME') {
                    console.log(`⚠ Statement ${i + 1}: Index already exists (this is OK)\n`);
                } else if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                    console.log(`⚠ Statement ${i + 1}: Field/constraint doesn't exist (this is OK)\n`);
                } else if (error.code === 'ER_PARSE_ERROR' && statement.includes('IF EXISTS')) {
                    console.log(`⚠ Statement ${i + 1}: IF EXISTS not supported (this is OK)\n`);
                } else {
                    throw error;
                }
            }
        }

        // Verify the constraint state using SHOW INDEXES
        console.log('Verifying constraint state...');
        const [indices] = await connection.query(`
            SHOW INDEXES FROM approval_memos WHERE Column_name = 'memo_number'
        `);

        console.log('\nCurrent indices on approval_memos.memo_number:');
        if (indices.length === 0) {
            console.log('No indices found on memo_number');
        } else {
            indices.forEach(idx => {
                console.log(`  - Index: ${idx.Key_name}, Non_unique: ${idx.Non_unique}, Null: ${idx.Null}`);
            });
        }

        // Try to insert a test monthly memo to verify the fix works
        console.log('\n--- Testing Fix ---');
        console.log('Attempting to insert a test monthly memo...');

        try {
            const testInsert = await connection.query(`
                INSERT INTO approval_memos
                (memo_type, memo_date, memo_number, total_projects, remarks, created_by, meeting_month, meeting_date)
                VALUES ('monthly', NULL, NULL, 0, 'Test monthly memo for verification', NULL, 'January', NOW())
            `);

            console.log('✓ Test insert successful! Monthly memo inserted with ID:', testInsert[0].insertId);

            // Clean up the test record
            await connection.query(`DELETE FROM approval_memos WHERE id = ?`, [testInsert[0].insertId]);
            console.log('✓ Test record cleaned up');

        } catch (error) {
            console.error('✗ Test insert failed:', error.message);
            console.error('  This suggests the constraint issue is not fully resolved');
            throw error;
        }

        console.log('\n✓ Migration 018 completed successfully!');
        console.log('Monthly memo file uploads should now work correctly.');

    } catch (error) {
        console.error('\n✗ Migration failed:', error.message);
        console.error('\nFull error:');
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.release();
        }
        await pool.end();
    }
}

// Run the migration
runMigration().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
