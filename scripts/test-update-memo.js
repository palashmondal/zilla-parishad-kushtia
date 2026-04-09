#!/usr/bin/env node

/**
 * Test script to simulate updating a memo with file upload
 */

require('dotenv').config();
const http = require('http');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpdateMemo() {
    try {
        // First, get an auth token
        console.log('Getting auth token...\n');

        const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });

        const loginReq = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.token) {
                        console.log('✓ Got token');
                        testUpdateWithToken(parsed.token);
                    } else {
                        console.error('✗ No token in response:', parsed);
                    }
                } catch (e) {
                    console.error('✗ Failed to parse login response:', e.message);
                }
            });
        });

        loginReq.on('error', err => {
            console.error('Login error:', err.message);
        });

        loginReq.write(loginData);
        loginReq.end();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

function testUpdateWithToken(token) {
    console.log('Creating test file...');

    // Create a test PDF file
    const testFile = '/tmp/test-memo.pdf';
    const pdfContent = Buffer.from('%PDF-1.4\n%test', 'utf-8');
    fs.writeFileSync(testFile, pdfContent);
    console.log(`✓ Created test file: ${testFile}\n`);

    console.log('Preparing form data for update...');
    const form = new FormData();
    form.append('memo_type', 'monthly');
    form.append('memo_date', '');
    form.append('memo_number', '');
    form.append('meeting_month', 'এপ্রিল');
    form.append('meeting_date', '2026-04-08');
    form.append('financial_year', '2025-26');
    form.append('total_projects', '3');
    form.append('remarks', 'Test update');
    form.append('document_file', fs.createReadStream(testFile), 'test-memo.pdf');

    console.log('Form fields:');
    console.log('  memo_type: monthly');
    console.log('  memo_date: (empty)');
    console.log('  memo_number: (empty)');
    console.log('  meeting_month: এপ্রিল');
    console.log('  meeting_date: 2026-04-08');
    console.log('  document_file: test-memo.pdf\n');

    console.log('Sending PUT request to /api/approval-memos/15...\n');

    const updateReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/approval-memos/15',
        method: 'PUT',
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let data = '';

        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            console.log(`Response status: ${res.statusCode}`);
            console.log('Response:', data);

            // Clean up
            fs.unlinkSync(testFile);
            console.log('\n✓ Test file cleaned up');
        });
    });

    updateReq.on('error', err => {
        console.error('✗ Request error:', err.message);
        fs.unlinkSync(testFile);
    });

    form.pipe(updateReq);
}

testUpdateMemo();
