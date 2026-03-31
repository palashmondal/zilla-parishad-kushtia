const pool = require('../../config/database');

const approvalMemosModel = {
    async getAll(page = 1, limit = 20, search = '', year = '', financialYear = '') {
        const pageNum = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 20;
        const pageOffset = (pageNum - 1) * pageSize;

        let whereClause = '';
        const params = [];

        if (search) {
            whereClause += ' AND (memo_number LIKE ? OR remarks LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (year) {
            whereClause += ' AND YEAR(memo_date) = ?';
            params.push(parseInt(year, 10));
        }

        if (financialYear) {
            whereClause += ' AND financial_year = ?';
            params.push(financialYear);
        }

        // Build query for data
        const query = `SELECT * FROM approval_memos WHERE 1=1${whereClause} ORDER BY memo_date DESC LIMIT ${pageSize} OFFSET ${pageOffset}`;
        const [results] = await pool.query(query, params);

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM approval_memos WHERE 1=1${whereClause}`;
        const [[{ total }]] = await pool.query(countQuery, params);

        return {
            data: results,
            total,
            page: pageNum,
            limit: pageSize,
            pages: Math.ceil(total / pageSize)
        };
    },

    async findById(id) {
        const [[row]] = await pool.execute(
            'SELECT * FROM approval_memos WHERE id = ?',
            [id]
        );
        return row || null;
    },

    async create(data) {
        const {
            memo_date,
            financial_year,
            memo_number,
            total_projects,
            remarks,
            document_file
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO approval_memos (memo_date, financial_year, memo_number, total_projects, remarks, document_file, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [memo_date, financial_year || null, memo_number, total_projects || 0, remarks || null, document_file || null, data.created_by || null]
        );

        return result.insertId;
    },

    async update(id, data) {
        const record = await this.findById(id);
        if (!record) return null;

        const {
            memo_date,
            financial_year,
            memo_number,
            total_projects,
            remarks,
            document_file
        } = data;

        await pool.execute(
            `UPDATE approval_memos
             SET memo_date = ?, financial_year = ?, memo_number = ?, total_projects = ?, remarks = ?, document_file = ?
             WHERE id = ?`,
            [memo_date, financial_year || null, memo_number, total_projects || 0, remarks || null, document_file !== undefined ? document_file : record.document_file, id]
        );

        return true;
    },

    async delete(id) {
        const record = await this.findById(id);
        if (!record) return null;

        await pool.execute('DELETE FROM approval_memos WHERE id = ?', [id]);
        return true;
    },

    async getYears() {
        const [results] = await pool.execute(
            'SELECT DISTINCT financial_year FROM approval_memos WHERE financial_year IS NOT NULL ORDER BY financial_year DESC'
        );
        return results.map(r => r.financial_year).filter(y => y);
    }
};

module.exports = approvalMemosModel;
