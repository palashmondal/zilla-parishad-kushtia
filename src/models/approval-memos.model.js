const pool = require('../../config/database');

const approvalMemosModel = {
    async getAll(page = 1, limit = 20, search = '', year = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM approval_memos WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (memo_number LIKE ? OR remarks LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (year) {
            query += ' AND YEAR(memo_date) = ?';
            params.push(year);
        }

        query += ' ORDER BY memo_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [results] = await pool.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM approval_memos WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND (memo_number LIKE ? OR remarks LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        if (year) {
            countQuery += ' AND YEAR(memo_date) = ?';
            countParams.push(year);
        }

        const [[{ total }]] = await pool.execute(countQuery, countParams);

        return {
            data: results,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
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
            memo_number,
            total_projects,
            remarks
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO approval_memos (memo_date, memo_number, total_projects, remarks, created_by)
             VALUES (?, ?, ?, ?, ?)`,
            [memo_date, memo_number, total_projects || 0, remarks || null, data.created_by || null]
        );

        return result.insertId;
    },

    async update(id, data) {
        const record = await this.findById(id);
        if (!record) return null;

        const {
            memo_date,
            memo_number,
            total_projects,
            remarks
        } = data;

        await pool.execute(
            `UPDATE approval_memos
             SET memo_date = ?, memo_number = ?, total_projects = ?, remarks = ?
             WHERE id = ?`,
            [memo_date, memo_number, total_projects || 0, remarks || null, id]
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
            'SELECT DISTINCT YEAR(memo_date) as year FROM approval_memos ORDER BY year DESC'
        );
        return results.map(r => r.year);
    }
};

module.exports = approvalMemosModel;
