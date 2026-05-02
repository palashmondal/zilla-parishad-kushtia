const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const parse = require('csv-parse');

// Parse CSV and import honors scholarships
async function importHonorsScholarships() {
    const filePath = path.join(__dirname, '../scholarship_honors.csv');

    if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        process.exit(1);
    }

    console.log('🚀 Starting honors scholarship import...\n');

    let importedCount = 0;
    let errorCount = 0;

    const records = [];

    return new Promise((resolve, reject) => {
        const parser = parse.parse({
            relax_quotes: true,
            skip_empty_lines: true,
            encoding: 'utf-8'
        });

        parser.on('readable', function() {
            let record;
            while ((record = parser.read()) !== null) {
                records.push(record);
            }
        });

        parser.on('error', (err) => {
            console.error('❌ CSV Parse Error:', err.message);
            reject(err);
        });

        parser.on('end', async () => {
            console.log(`📋 Found ${records.length} records in CSV\n`);

            for (let i = 0; i < records.length; i++) {
                try {
                    const parsed = parseRecord(records[i], i + 1);
                    if (parsed) {
                        await insertRecord(parsed);
                        importedCount++;
                        if (importedCount % 100 === 0) {
                            console.log(`✅ Imported ${importedCount} records...`);
                        }
                    }
                } catch (err) {
                    errorCount++;
                    console.error(`❌ Error on record ${i + 1}:`, err.message);
                }
            }

            console.log(`\n✨ Import complete!`);
            console.log(`📊 Imported: ${importedCount} records`);
            console.log(`❌ Errors: ${errorCount}`);

            await pool.end();
            resolve();
        });

        const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
        fileStream.pipe(parser);
    });
}

function parseRecord(csvRow, rowNum) {
    try {
        if (!csvRow || csvRow.length < 4) {
            return null;
        }

        const serial = csvRow[0] ? csvRow[0].trim() : rowNum;
        const personalInfo = csvRow[1] || '';
        const educationInfo = csvRow[2] || '';
        const gradesInfo = csvRow[3] || '';

        // Parse personal info
        const personalLines = personalInfo.split('\n').map(l => l.trim()).filter(l => l);
        let name = '';
        let fatherName = '';
        let motherName = '';
        let phone = '';

        personalLines.forEach((line, idx) => {
            if (line.startsWith('পিতা-')) {
                fatherName = line.replace('পিতা-', '').replace('মৃত', '').trim();
            } else if (line.startsWith('মাতা-') || line.startsWith('মাতাঃ')) {
                motherName = line.replace(/মাতা[:-]/, '').trim();
            } else if (line.startsWith('মোবাঃ') || line.startsWith('মোব:')) {
                phone = line.replace(/মোব[াঃ:]/g, '').trim();
            } else if (idx === 0) {
                name = line;
            }
        });

        // Parse education info
        const eduLines = educationInfo.split('\n').map(l => l.trim()).filter(l => l);
        let school = '';
        let passingYear = '';
        let category = '';

        eduLines.forEach((line, idx) => {
            if (idx === 0 && line.includes('-')) {
                const parts = line.split('-');
                category = parts[0].trim();
                passingYear = parts[1]?.trim() || '';
            } else if (idx === 1) {
                school = line;
            }
        });

        // Parse grades and amount
        const gradesLines = gradesInfo.split('\n').map(l => l.trim()).filter(l => l);
        let gpa = '';
        let amount = 0;

        gradesLines.forEach(line => {
            if (line.includes('টাকা') || line.includes('/') || /[\d,]+/.test(line)) {
                const numMatch = line.match(/[\d,]+/);
                if (numMatch) {
                    amount = parseFloat(numMatch[0].replace(/,/g, ''));
                }
            } else if (line.includes('-')) {
                gpa = line;
            }
        });

        return {
            serial: serial || '',
            name: name || 'Unknown',
            father_name: fatherName || 'Unknown',
            mother_name: motherName || 'Unknown',
            school: school || 'কুষ্টিয়া',
            upazila: 'কুষ্টিয়া সদর',
            zila: 'কুষ্টিয়া',
            phone: phone || '',
            passing_year: passingYear,
            gpa: gpa,
            category: category,
            financial_year: '२०२४-२५',
            amount: amount || 0,
            status: 'disbursed'
        };
    } catch (err) {
        throw new Error(`Parse error on row ${rowNum}: ${err.message}`);
    }
}

async function insertRecord(record) {
    const sql = `
        INSERT INTO scholarship (
            serial, name, father_name, mother_name, school, upazila, zila,
            phone, passing_year, gpa, category, financial_year, amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        record.serial,
        record.name,
        record.father_name,
        record.mother_name,
        record.school,
        record.upazila,
        record.zila,
        record.phone,
        record.passing_year,
        record.gpa,
        record.category,
        record.financial_year,
        record.amount,
        record.status
    ];

    try {
        const [result] = await pool.execute(sql, values);
        return result.insertId;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return null;
        }
        throw err;
    }
}

importHonorsScholarships()
    .then(() => {
        console.log('\n✅ All done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
