const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { createObjectCsvWriter } = require('csv-writer');

async function exportHonorsScholarships() {
    try {
        console.log('📊 Exporting honors scholarships to CSV...\n');

        // Fetch honors scholarships (категория contains "অনার্স" or "Honors")
        const [records] = await pool.execute(
            `SELECT id, serial, name, father_name, mother_name, sang, post, upazila, zila,
                    phone, passing_year, school, gpa, category, financial_year, amount,
                    status, distribution_date, disbursement_method, comment,
                    created_at, updated_at
             FROM scholarship
             WHERE category LIKE '%অনার্স%' OR category LIKE '%Honors%' OR financial_year = '२०२४-२५'
             ORDER BY id ASC`
        );

        console.log(`✅ Found ${records.length} honors scholarship records\n`);

        // Define CSV headers
        const headers = [
            { id: 'id', title: 'ID' },
            { id: 'serial', title: 'Serial' },
            { id: 'name', title: 'Student Name' },
            { id: 'father_name', title: 'Father Name' },
            { id: 'mother_name', title: 'Mother Name' },
            { id: 'sang', title: 'Village' },
            { id: 'post', title: 'Post Office' },
            { id: 'upazila', title: 'Upazila' },
            { id: 'zila', title: 'District' },
            { id: 'phone', title: 'Phone' },
            { id: 'school', title: 'Institution' },
            { id: 'passing_year', title: 'Passing Year' },
            { id: 'gpa', title: 'GPA/Grades' },
            { id: 'category', title: 'Category' },
            { id: 'financial_year', title: 'Financial Year' },
            { id: 'amount', title: 'Amount (৳)' },
            { id: 'status', title: 'Status' },
            { id: 'distribution_date', title: 'Distribution Date' },
            { id: 'disbursement_method', title: 'Disbursement Method' },
            { id: 'comment', title: 'Comment' },
            { id: 'created_at', title: 'Created At' },
            { id: 'updated_at', title: 'Updated At' }
        ];

        // Output path
        const outputPath = path.join(__dirname, '../honors_scholarships.csv');

        const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: headers,
            encoding: 'utf8'
        });

        await csvWriter.writeRecords(records);
        console.log(`✅ Exported to: ${outputPath}`);
        console.log(`📊 Total records: ${records.length}`);

        // Copy to Downloads
        const downloadPath = '/Users/palashmondal/Downloads/honors_scholarships_120.csv';
        fs.copyFileSync(outputPath, downloadPath);
        console.log(`✅ Copied to Downloads: ${downloadPath}\n`);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

exportHonorsScholarships();
