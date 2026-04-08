#!/usr/bin/env node

/**
 * Migration Runner for Migration 019
 * Backfills approval memo documents to projects that don't have them yet
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
    let connection;
    try {
        connection = await pool.getConnection();

        console.log('Running Migration 019: Backfill approval memo documents to projects...\n');

        // First, check how many projects need backfilling
        const [checkResults] = await connection.query(`
            SELECT COUNT(*) as count
            FROM projects p
            JOIN approval_memos am ON p.approval_memo_id = am.id
            WHERE am.document_file IS NOT NULL
              AND am.document_file != ''
              AND NOT EXISTS (
                SELECT 1 FROM project_documents pd
                WHERE pd.project_id = p.id
                AND pd.file_path = am.document_file
              )
        `);

        const projectsToFix = checkResults[0].count;
        console.log(`Found ${projectsToFix} projects that need approval memo documents\n`);

        if (projectsToFix === 0) {
            console.log('✓ All projects already have their approval memo documents!');
            return;
        }

        // Run the backfill query
        console.log('Adding approval memo documents to projects...');

        const [insertResults] = await connection.query(`
            INSERT INTO project_documents (project_id, file_path, original_name, file_type, uploaded_by)
            SELECT
                p.id,
                am.document_file,
                CONCAT('অনুমোদন স্মারক (',
                       IF(am.memo_type = 'monthly', 'মাসিক সভা', 'মন্ত্রণালয়ের স্মারক'),
                       ')'),
                LOWER(SUBSTRING(am.document_file, POSITION('.' IN am.document_file) + 1)),
                NULL
            FROM projects p
            JOIN approval_memos am ON p.approval_memo_id = am.id
            WHERE am.document_file IS NOT NULL
              AND am.document_file != ''
              AND NOT EXISTS (
                SELECT 1 FROM project_documents pd
                WHERE pd.project_id = p.id
                AND pd.file_path = am.document_file
              )
            ON DUPLICATE KEY UPDATE file_path = VALUES(file_path)
        `);

        console.log(`✓ Added ${insertResults.affectedRows} approval memo documents to projects\n`);

        // Verify the backfill worked
        const [verifyResults] = await connection.query(`
            SELECT COUNT(*) as count
            FROM projects p
            JOIN approval_memos am ON p.approval_memo_id = am.id
            WHERE am.document_file IS NOT NULL
              AND am.document_file != ''
              AND NOT EXISTS (
                SELECT 1 FROM project_documents pd
                WHERE pd.project_id = p.id
                AND pd.file_path = am.document_file
              )
        `);

        const remaining = verifyResults[0].count;
        if (remaining === 0) {
            console.log('✓ Verification passed: All projects now have their approval memo documents!');
        } else {
            console.log(`⚠ Warning: ${remaining} projects still missing approval memo documents`);
        }

        console.log('\n✓ Migration 019 completed successfully!');

    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        console.error('Code:', error.code);
        process.exit(1);
    } finally {
        if (connection) await connection.release();
        await pool.end();
    }
}

runMigration().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
