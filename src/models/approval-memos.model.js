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

        // Build query for data with both approved and actual project count.
        // actual_projects = FK-linked count; if that's 0 fall back to unlinked projects
        // whose Bengali financial_year normalises to the same English year as the memo.
        const BN_TO_EN = `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                              p.financial_year,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),
                              '৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9')`;
        const query = `SELECT am.*,
                           COALESCE(
                               NULLIF(SUM(CASE WHEN p.approval_memo_id = am.id THEN 1 ELSE 0 END), 0),
                               SUM(CASE WHEN p.approval_memo_id IS NULL
                                         AND p.financial_year IS NOT NULL
                                         AND am.financial_year IS NOT NULL
                                         AND ${BN_TO_EN} = am.financial_year
                                        THEN 1 ELSE 0 END),
                               0
                           ) AS actual_projects
                       FROM approval_memos am
                       LEFT JOIN projects p ON (
                           p.approval_memo_id = am.id
                           OR (p.approval_memo_id IS NULL
                               AND p.financial_year IS NOT NULL
                               AND am.financial_year IS NOT NULL
                               AND ${BN_TO_EN} = am.financial_year)
                       )
                       WHERE 1=1${whereClause}
                       GROUP BY am.id
                       ORDER BY am.memo_date DESC, am.id DESC
                       LIMIT ${pageSize} OFFSET ${pageOffset}`;
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
            memo_type,
            memo_date,
            financial_year,
            memo_number,
            total_projects,
            remarks,
            document_file,
            meeting_month,
            meeting_date
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO approval_memos (memo_type, memo_date, financial_year, memo_number, total_projects, remarks, document_file, meeting_month, meeting_date, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [memo_type || 'ministry', memo_date || null, financial_year || null, memo_number || null, total_projects || 0, remarks || null, document_file || null, meeting_month || null, meeting_date || null, data.created_by || null]
        );

        return result.insertId;
    },

    async update(id, data) {
        const record = await this.findById(id);
        if (!record) return null;

        const {
            memo_type,
            memo_date,
            financial_year,
            memo_number,
            total_projects,
            remarks,
            document_file,
            meeting_month,
            meeting_date
        } = data;

        await pool.execute(
            `UPDATE approval_memos
             SET memo_type = ?, memo_date = ?, financial_year = ?, memo_number = ?, total_projects = ?, remarks = ?, document_file = ?, meeting_month = ?, meeting_date = ?
             WHERE id = ?`,
            [memo_type !== undefined ? memo_type : record.memo_type, memo_date !== undefined ? memo_date : record.memo_date, financial_year !== undefined ? financial_year : record.financial_year, memo_number !== undefined ? memo_number : record.memo_number, total_projects !== undefined ? total_projects : record.total_projects, remarks !== undefined ? remarks : record.remarks, document_file !== undefined ? document_file : record.document_file, meeting_month !== undefined ? meeting_month : record.meeting_month, meeting_date !== undefined ? meeting_date : record.meeting_date, id]
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
    },

    async getProjectsByMemoId(memoId) {
        const memo = await this.findById(memoId);
        if (!memo) return [];

        // First try FK-linked projects
        const [fkProjects] = await pool.execute(
            `SELECT id, project_id, project_name, allocation_amount, released_amount,
                    current_status, upazila, financial_year, project_approval_date, implementation_method
             FROM projects
             WHERE approval_memo_id = ?
             ORDER BY project_name ASC`,
            [memoId]
        );

        if (fkProjects.length > 0) return fkProjects;

        // Fallback: unlinked projects whose Bengali financial_year matches this memo's year
        if (!memo.financial_year) return [];

        const [yearProjects] = await pool.execute(
            `SELECT id, project_id, project_name, allocation_amount, released_amount,
                    current_status, upazila, financial_year, project_approval_date, implementation_method
             FROM projects
             WHERE approval_memo_id IS NULL
               AND financial_year IS NOT NULL
               AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                       financial_year,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),
                       '৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9') = ?
             ORDER BY project_name ASC`,
            [memo.financial_year]
        );
        return yearProjects || [];
    }
};

module.exports = approvalMemosModel;
