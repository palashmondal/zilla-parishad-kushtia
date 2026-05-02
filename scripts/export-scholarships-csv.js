const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { createObjectCsvWriter } = require('csv-writer');

async function exportScholarships() {
    try {
        console.log('📊 Exporting scholarships to CSV...\n');

        // Fetch all scholarships
        const [records] = await pool.execute(
            `SELECT id, serial, name, father_name, mother_name, sang, post, upazila, zila,
                    phone, passing_year, school, gpa, category, financial_year, amount,
                    status, distribution_date, disbursement_method, comment,
                    created_at, updated_at
             FROM scholarship ORDER BY financial_year DESC, id ASC`
        );

        console.log(`✅ Found ${records.length} scholarship records\n`);

        // Define CSV headers
        const headers = [
            { id: 'id', title: 'ID' },
            { id: 'serial', title: 'Serial No.' },
            { id: 'name', title: 'Student Name' },
            { id: 'father_name', title: 'Father Name' },
            { id: 'mother_name', title: 'Mother Name' },
            { id: 'sang', title: 'Sang/Village' },
            { id: 'post', title: 'Post Office' },
            { id: 'upazila', title: 'Upazila' },
            { id: 'zila', title: 'District' },
            { id: 'phone', title: 'Phone Number' },
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

        // Output directory
        const outputDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Export all records
        const allFilePath = path.join(outputDir, `scholarships_all_${new Date().toISOString().split('T')[0]}.csv`);
        const csvWriter = createObjectCsvWriter({
            path: allFilePath,
            header: headers,
            encoding: 'utf8'
        });

        await csvWriter.writeRecords(records);
        console.log(`✅ Exported all scholarships to: ${allFilePath}`);

        // Export by financial year
        const yearGroups = {};
        records.forEach(record => {
            const year = record.financial_year || 'Unknown';
            if (!yearGroups[year]) {
                yearGroups[year] = [];
            }
            yearGroups[year].push(record);
        });

        for (const [year, yearRecords] of Object.entries(yearGroups)) {
            const yearFilePath = path.join(outputDir, `scholarships_${year.replace(/[^0-9-]/g, '')}.csv`);
            const yearCsvWriter = createObjectCsvWriter({
                path: yearFilePath,
                header: headers,
                encoding: 'utf8'
            });
            await yearCsvWriter.writeRecords(yearRecords);
            console.log(`✅ Exported ${yearRecords.length} scholarships for ${year} to: ${yearFilePath}`);
        }

        console.log(`\n✨ Export complete!\n`);
        console.log(`📁 Files saved to: ${outputDir}`);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

exportScholarships();
