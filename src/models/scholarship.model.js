const pool = require('../../config/database');

const SCHOLARSHIP_FIELDS = `
    id, serial, name, father_name, mother_name,
    sang, post, upazila, zila, phone,
    passing_year, school, gpa, category,
    financial_year, amount, status,
    created_at, updated_at
`;

const scholarshipModel = {
    async search(searchQuery, yearFilter) {
        if (!searchQuery || searchQuery.trim().length < 2) {
            return [];
        }

        const keywords = searchQuery.trim().split(/\s+/).filter(k => k.length >= 2);
        if (keywords.length === 0) return [];

        let selectClause = `SELECT ${SCHOLARSHIP_FIELDS}, (`;
        const queryParams = [];
        const scoreParts = [];
        const whereParts = [];

        keywords.forEach((keyword) => {
            const searchTerm = `%${keyword}%`;

            scoreParts.push(`
                (CASE WHEN name LIKE ? THEN 10 ELSE 0 END) +
                (CASE WHEN father_name LIKE ? THEN 5 ELSE 0 END) +
                (CASE WHEN mother_name LIKE ? THEN 3 ELSE 0 END) +
                (CASE WHEN school LIKE ? THEN 2 ELSE 0 END) +
                (CASE WHEN upazila LIKE ? THEN 1 ELSE 0 END) +
                (CASE WHEN phone LIKE ? THEN 1 ELSE 0 END)
            `);

            for (let i = 0; i < 6; i++) queryParams.push(searchTerm);

            whereParts.push(`(
                name LIKE ? OR father_name LIKE ? OR mother_name LIKE ? OR
                school LIKE ? OR phone LIKE ? OR upazila LIKE ?
            )`);

            for (let i = 0; i < 6; i++) queryParams.push(searchTerm);
        });

        selectClause += scoreParts.join(' + ') + `) AS relevance_score
            FROM scholarship WHERE (` + whereParts.join(' OR ') + `)`;

        if (yearFilter && yearFilter !== 'all') {
            selectClause += ' AND financial_year = ?';
            queryParams.push(yearFilter);
        }

        selectClause += ' ORDER BY relevance_score DESC, name ASC LIMIT 10';

        const [results] = await pool.execute(selectClause, queryParams);
        return results.map(({ relevance_score, ...rest }) => rest);
    },

    async findById(id) {
        const [results] = await pool.execute(
            `SELECT ${SCHOLARSHIP_FIELDS} FROM scholarship WHERE id = ?`,
            [id]
        );
        return results[0] || null;
    },

    async getYears() {
        const [results] = await pool.execute(
            `SELECT DISTINCT financial_year FROM scholarship
             WHERE financial_year IS NOT NULL ORDER BY financial_year DESC`
        );
        return results.map(r => r.financial_year);
    },

    async getStats() {
        const [totalResult] = await pool.execute(
            'SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_amount FROM scholarship'
        );
        const [categoryResult] = await pool.execute(
            'SELECT category, COUNT(*) as count FROM scholarship GROUP BY category'
        );
        const [yearResult] = await pool.execute(
            'SELECT financial_year, COUNT(*) as count FROM scholarship GROUP BY financial_year'
        );
        return {
            total_count: totalResult[0].total_count,
            total_amount: totalResult[0].total_amount,
            byCategory: categoryResult,
            byYear: yearResult
        };
    },

    async create(data) {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO scholarship (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.execute(sql, Object.values(data));
        return result.insertId;
    },

    async update(id, data) {
        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE scholarship SET ${setClauses} WHERE id = ?`;
        const [result] = await pool.execute(sql, [...Object.values(data), id]);
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await pool.execute('DELETE FROM scholarship WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getAll(page = 1, limit = 20, search = '', year = '') {
        const safeLimit = parseInt(limit, 10) || 20;
        const safePage = parseInt(page, 10) || 1;
        const offset = (safePage - 1) * safeLimit;

        let sql = `SELECT ${SCHOLARSHIP_FIELDS} FROM scholarship`;
        let countSql = 'SELECT COUNT(*) as total FROM scholarship';
        const params = [];
        const countParams = [];
        const conditions = [];

        if (search && search.trim().length >= 2) {
            const searchTerm = `%${search.trim()}%`;
            conditions.push('(name LIKE ? OR father_name LIKE ? OR mother_name LIKE ? OR school LIKE ? OR phone LIKE ?)');
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (year && year !== 'all') {
            conditions.push('financial_year = ?');
            params.push(year);
            countParams.push(year);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            sql += whereClause;
            countSql += whereClause;
        }

        sql += ` ORDER BY id DESC LIMIT ${safeLimit} OFFSET ${offset}`;

        const [results] = await pool.execute(sql, params);
        const [countResult] = await pool.execute(countSql, countParams);

        return {
            data: results,
            total: countResult[0].total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(countResult[0].total / safeLimit)
        };
    }
};

module.exports = scholarshipModel;
