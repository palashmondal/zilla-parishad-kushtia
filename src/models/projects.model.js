const pool = require('../../config/database');
const { calcProgress } = require('../utils/progressCalc');

const PROJECT_FIELDS = `
    id, project_id, project_name, allocation_amount, released_amount, fund_type,
    financial_year, project_approval_date, approval_memo_number, implementation_method,
    upazila, project_type, current_status, progress_percentage,
    is_completed, is_delayed, performance_score,
    start_date, expected_end_date, actual_end_date, lat_lng, remarks,
    created_at, updated_at
`;

const projectsModel = {
    async search(searchQuery, yearFilter) {
        if (!searchQuery || searchQuery.trim().length < 2) {
            return [];
        }

        const keywords = searchQuery.trim().split(/\s+/).filter(k => k.length >= 2);
        if (keywords.length === 0) return [];

        let selectClause = `SELECT ${PROJECT_FIELDS}, (`;
        const queryParams = [];
        const scoreParts = [];
        const whereParts = [];

        keywords.forEach((keyword) => {
            const searchTerm = `%${keyword}%`;

            scoreParts.push(`
                (CASE WHEN project_name LIKE ? THEN 10 ELSE 0 END) +
                (CASE WHEN id LIKE ? THEN 3 ELSE 0 END) +
                (CASE WHEN upazila LIKE ? THEN 5 ELSE 0 END) +
                (CASE WHEN project_type LIKE ? THEN 3 ELSE 0 END) +
                (CASE WHEN current_status LIKE ? THEN 2 ELSE 0 END) +
                (CASE WHEN implementation_method LIKE ? THEN 2 ELSE 0 END) +
                (CASE WHEN fund_type LIKE ? THEN 1 ELSE 0 END) +
                (CASE WHEN remarks LIKE ? THEN 1 ELSE 0 END)
            `);

            for (let i = 0; i < 8; i++) queryParams.push(searchTerm);

            whereParts.push(`(
                project_name LIKE ? OR id LIKE ? OR upazila LIKE ? OR
                project_type LIKE ? OR current_status LIKE ? OR
                implementation_method LIKE ? OR fund_type LIKE ? OR remarks LIKE ?
            )`);

            for (let i = 0; i < 8; i++) queryParams.push(searchTerm);
        });

        selectClause += scoreParts.join(' + ') + `) AS relevance_score
            FROM projects WHERE (` + whereParts.join(' OR ') + `)`;

        if (yearFilter && yearFilter !== 'all') {
            selectClause += ' AND financial_year = ?';
            queryParams.push(yearFilter);
        }

        selectClause += ' ORDER BY relevance_score DESC, project_name ASC LIMIT 10';

        const [results] = await pool.execute(selectClause, queryParams);
        return results.map(({ relevance_score, ...rest }) => rest);
    },

    async findById(id) {
        // Support both integer id and string project_id lookup
        // If id is numeric, query by id column; otherwise query by project_id column
        const isNumeric = /^\d+$/.test(String(id).trim());
        const column = isNumeric ? 'id' : 'project_id';

        const [results] = await pool.execute(
            `SELECT ${PROJECT_FIELDS} FROM projects WHERE ${column} = ?`,
            [id]
        );
        return results[0] || null;
    },

    async getYears() {
        const [results] = await pool.execute(
            `SELECT DISTINCT financial_year FROM projects
             WHERE financial_year IS NOT NULL ORDER BY financial_year DESC`
        );
        return results.map(r => r.financial_year);
    },

    async getStats() {
        const [totalResult] = await pool.execute(
            `SELECT COUNT(*) as total_count,
                    COALESCE(SUM(allocation_amount), 0) as total_allocation,
                    COALESCE(SUM(released_amount), 0) as total_released,
                    SUM(is_completed) as completed_count,
                    SUM(is_delayed) as delayed_count,
                    ROUND(AVG(progress_percentage), 1) as avg_progress
             FROM projects`
        );
        const [typeResult] = await pool.execute(
            `SELECT project_type, COUNT(*) as count,
                    COALESCE(SUM(allocation_amount),0) as total_allocation,
                    COALESCE(SUM(released_amount),0) as total_released,
                    ROUND(AVG(progress_percentage),1) as avg_progress
             FROM projects GROUP BY project_type ORDER BY count DESC`
        );
        const [yearResult] = await pool.execute(
            `SELECT financial_year, COUNT(*) as count,
                    COALESCE(SUM(allocation_amount),0) as total_allocation,
                    COALESCE(SUM(released_amount),0) as total_released,
                    SUM(is_completed) as completed_count,
                    ROUND(AVG(progress_percentage),1) as avg_progress
             FROM projects GROUP BY financial_year ORDER BY financial_year ASC`
        );
        const [methodResult] = await pool.execute(
            `SELECT implementation_method, COUNT(*) as count,
                    COALESCE(SUM(allocation_amount),0) as total_allocation,
                    ROUND(AVG(progress_percentage),1) as avg_progress
             FROM projects WHERE implementation_method IS NOT NULL AND implementation_method != ''
             GROUP BY implementation_method ORDER BY count DESC`
        );
        const [fundTypeResult] = await pool.execute(
            `SELECT fund_type, COUNT(*) as count,
                    COALESCE(SUM(allocation_amount),0) as total_allocation
             FROM projects WHERE fund_type IS NOT NULL AND fund_type != ''
             GROUP BY fund_type ORDER BY count DESC LIMIT 12`
        );
        const [statusResult] = await pool.execute(
            `SELECT current_status, COUNT(*) as count
             FROM projects WHERE current_status IS NOT NULL AND current_status != ''
             GROUP BY current_status ORDER BY count DESC LIMIT 10`
        );
        const [yearProgressResult] = await pool.execute(
            `SELECT financial_year, implementation_method,
                    ROUND(AVG(progress_percentage),1) as avg_progress,
                    COUNT(*) as count
             FROM projects
             WHERE financial_year IS NOT NULL
             GROUP BY financial_year, implementation_method
             ORDER BY financial_year ASC, implementation_method ASC`
        );
        return {
            total_count: totalResult[0].total_count,
            total_allocation: totalResult[0].total_allocation,
            total_released: totalResult[0].total_released,
            completed_count: totalResult[0].completed_count,
            delayed_count: totalResult[0].delayed_count,
            avg_progress: totalResult[0].avg_progress,
            byType: typeResult,
            byYear: yearResult,
            byMethod: methodResult,
            byFundType: fundTypeResult,
            byStatus: statusResult,
            byYearAndMethod: yearProgressResult
        };
    },

    async create(data) {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO projects (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.execute(sql, Object.values(data));
        return result.insertId;
    },

    async update(id, data) {
        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE projects SET ${setClauses} WHERE id = ?`;
        const [result] = await pool.execute(sql, [...Object.values(data), id]);
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getAll(page = 1, limit = 20, search = '', year = '') {
        const safeLimit = parseInt(limit, 10) || 20;
        const safePage = parseInt(page, 10) || 1;
        const offset = (safePage - 1) * safeLimit;

        let sql = `SELECT ${PROJECT_FIELDS} FROM projects`;
        let countSql = 'SELECT COUNT(*) as total FROM projects';
        const params = [];
        const countParams = [];
        const conditions = [];

        if (search && search.trim().length >= 2) {
            const searchTerm = `%${search.trim()}%`;
            conditions.push('(project_name LIKE ? OR upazila LIKE ? OR project_type LIKE ? OR current_status LIKE ? OR id LIKE ?)');
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

        sql += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;

        const [results] = await pool.execute(sql, params);
        const [countResult] = await pool.execute(countSql, countParams);

        return {
            data: results,
            total: countResult[0].total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(countResult[0].total / safeLimit)
        };
    },

    // ── Progress log ───────────────────────────────────────────
    async getProgressLog(projectId) {
        const [results] = await pool.execute(
            `SELECT id, progress_percentage, released_amount, current_status,
                    is_completed, is_delayed, note, logged_at
             FROM project_progress_log
             WHERE project_id = ?
             ORDER BY logged_at ASC`,
            [projectId]
        );
        return results;
    },

    async addProgressLog(projectId, data, loggedBy) {
        const {
            released_amount,
            current_status,
            is_completed = 0,
            is_delayed   = 0,
            note         = null
        } = data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Fetch current project fields needed for the formula (single query)
            const [rows] = await conn.execute(
                `SELECT allocation_amount, released_amount, implementation_method FROM projects WHERE id = ?`,
                [projectId]
            );
            if (!rows || rows.length === 0) throw new Error('Project not found: ' + projectId);
            const project = rows[0];

            // Determine effective released_amount:
            // If a new release was provided use it; otherwise keep the existing DB value
            const effectiveReleased = (released_amount !== null && released_amount !== undefined)
                ? parseFloat(released_amount)
                : parseFloat(project.released_amount || 0);

            // Auto-calculate progress using the formula
            const progress_percentage = calcProgress({
                current_status,
                implementation_method: project.implementation_method,
                allocation_amount:     project.allocation_amount,
                released_amount:       effectiveReleased,
                is_completed,
                is_delayed
            });

            // 1. Insert snapshot into progress log
            await conn.execute(
                `INSERT INTO project_progress_log
                    (project_id, progress_percentage, released_amount,
                     current_status, is_completed, is_delayed, note, logged_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [projectId, progress_percentage, effectiveReleased,
                 current_status, is_completed ? 1 : 0, is_delayed ? 1 : 0,
                 note || null, loggedBy || null]
            );

            // 2. Update the live project row
            await conn.execute(
                `UPDATE projects SET
                    progress_percentage = ?, released_amount = ?,
                    current_status = ?, is_completed = ?, is_delayed = ?
                 WHERE id = ?`,
                [progress_percentage, effectiveReleased, current_status,
                 is_completed ? 1 : 0, is_delayed ? 1 : 0, projectId]
            );

            await conn.commit();
            return progress_percentage;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    // ── Image records ──────────────────────────────────────────
    async getImages(projectId) {
        const [results] = await pool.execute(
            `SELECT id, photo_path, photo_type, caption, display_order, uploaded_at
             FROM project_images
             WHERE project_id = ?
             ORDER BY display_order ASC, uploaded_at ASC`,
            [projectId]
        );
        return results;
    },

    async addImages(projectId, images, uploadedBy) {
        // images = [{ photo_path, photo_type, caption, file_size_bytes }, ...]
        for (const img of images) {
            await pool.execute(
                `INSERT INTO project_images
                    (project_id, photo_path, photo_type, caption,
                     file_size_bytes, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [projectId, img.photo_path, img.photo_type || 'general',
                 img.caption || null, img.file_size_bytes || null,
                 uploadedBy || null]
            );
        }
    },

    async deleteImage(imageId, projectId) {
        // Returns the photo_path so the caller can optionally delete the file from disk.
        // We validate project ownership to prevent cross-project deletion.
        const [[row]] = await pool.execute(
            `SELECT id, photo_path FROM project_images WHERE id = ? AND project_id = ?`,
            [imageId, projectId]
        );
        if (!row) return null;

        await pool.execute(`DELETE FROM project_images WHERE id = ?`, [imageId]);
        return row.photo_path;
    }
};

module.exports = projectsModel;
