const pool = require('../../config/database');
const { calcProgress, calcProgressFromStep } = require('../utils/progressCalc');
const progressStepsModel = require('./progressSteps.model');
const { autoPopulateLatLng } = require('../utils/locationHelper');

const PROJECT_FIELDS = `
    id, project_id, project_name, allocation_amount, released_amount, fund_type,
    financial_year, approval_memo_id, project_approval_date, approval_memo_number, implementation_method,
    upazila, project_type, current_status, progress_percentage, progress_step_id,
    is_completed, is_delayed, performance_score,
    start_date, expected_end_date, actual_end_date, lat_lng, remarks, priority, reference,
    created_at, updated_at
`;

// DATE columns — empty string must become NULL (MySQL strict mode rejects '')
const DATE_FIELDS = ['project_approval_date', 'start_date', 'expected_end_date', 'actual_end_date'];
// Nullable text columns — send NULL instead of empty string
const NULLABLE_TEXT = ['project_id', 'approval_memo_number', 'lat_lng', 'remarks', 'reference', 'performance_score', 'priority'];
// Nullable integer columns — send NULL instead of empty/invalid values
const NULLABLE_INT = ['approval_memo_id', 'progress_step_id'];

function sanitizeProjectData(data) {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
        if (DATE_FIELDS.includes(k)) {
            out[k] = (v === '' || v === null || v === undefined) ? null : v;
        } else if (NULLABLE_TEXT.includes(k)) {
            out[k] = (v === '' || v === null || v === undefined) ? null : v;
        } else if (NULLABLE_INT.includes(k)) {
            const num = parseInt(v, 10);
            out[k] = (v === '' || v === null || v === undefined || isNaN(num)) ? null : num;
        } else {
            out[k] = v;
        }
    }
    return out;
}

const projectsModel = {
    async search(searchQuery, yearFilter, priorityFilter) {
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

        const validPriorities = ['general', 'medium', 'top_priority'];
        if (priorityFilter && validPriorities.includes(priorityFilter)) {
            selectClause += ' AND priority = ?';
            queryParams.push(priorityFilter);
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

        const result = results[0] || null;

        // If project has approval_memo_id, fetch the memo_type from approval_memos table
        if (result && result.approval_memo_id) {
            const [memoRows] = await pool.execute(
                `SELECT memo_type FROM approval_memos am WHERE am.id = ?`,
                [result.approval_memo_id]
            );

            if (memoRows && memoRows.length > 0 && memoRows[0].memo_type) {
                result.memo_type = memoRows[0].memo_type;
            }
        }

        return result;
    },

    async getYears() {
        const [results] = await pool.execute(
            `SELECT DISTINCT financial_year FROM projects
             WHERE financial_year IS NOT NULL ORDER BY financial_year DESC`
        );
        return results.map(r => r.financial_year);
    },

    async getAvailableMemos(financialYear) {
        const BN_TO_EN = `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                              p.financial_year,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),
                              '৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9')`;
        const [results] = await pool.execute(
            `SELECT am.id, am.memo_type, am.memo_date, am.memo_number, am.meeting_month, am.meeting_date, am.total_projects,
                    COALESCE(
                        NULLIF(SUM(CASE WHEN p.approval_memo_id = am.id THEN 1 ELSE 0 END), 0),
                        SUM(CASE WHEN p.approval_memo_id IS NULL
                                  AND p.financial_year IS NOT NULL
                                  AND ${BN_TO_EN} = am.financial_year
                                 THEN 1 ELSE 0 END),
                        0
                    ) AS actual_projects
             FROM approval_memos am
             LEFT JOIN projects p ON (
                 p.approval_memo_id = am.id
                 OR (p.approval_memo_id IS NULL
                     AND p.financial_year IS NOT NULL
                     AND ${BN_TO_EN} = am.financial_year)
             )
             WHERE am.financial_year = ?
             GROUP BY am.id, am.memo_type, am.memo_date, am.memo_number, am.meeting_month, am.meeting_date, am.total_projects
             ORDER BY COALESCE(am.memo_date, am.meeting_date) DESC`,
            [financialYear]
        );
        return results;
    },

    async getUpazilas() {
        const [results] = await pool.execute(
            `SELECT DISTINCT upazila FROM projects
             WHERE upazila IS NOT NULL AND upazila != '' ORDER BY upazila ASC`
        );
        return results.map(r => r.upazila);
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
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Remove 'id' — it is AUTO_INCREMENT and must not be sent by the client
            const { id: _id, created_at, updated_at, approval_memo_id, ...insertData } = data;
            const sanitized = sanitizeProjectData({ approval_memo_id, ...insertData });

            // Set default priority to 'general' if not provided
            if (!sanitized.priority || sanitized.priority === null) {
                sanitized.priority = 'general';
            }

            // Auto-populate lat_lng from upazila if not provided
            if (sanitized.upazila && (!sanitized.lat_lng || sanitized.lat_lng === null)) {
                sanitized.lat_lng = autoPopulateLatLng(sanitized.upazila, sanitized.lat_lng);
            }

            const fields = Object.keys(sanitized);
            if (fields.length === 0) throw new Error('No data provided for insert');
            const placeholders = fields.map(() => '?').join(', ');
            const sql = `INSERT INTO projects (${fields.join(', ')}) VALUES (${placeholders})`;
            const [result] = await conn.execute(sql, Object.values(sanitized));
            const projectId = result.insertId;

            // If an approval memo is selected, automatically attach its document to the project
            if (approval_memo_id) {
                const [memoRows] = await conn.execute(
                    `SELECT id, document_file, memo_type FROM approval_memos WHERE id = ?`,
                    [approval_memo_id]
                );
                if (memoRows && memoRows.length > 0) {
                    const memo = memoRows[0];
                    if (memo.document_file && memo.document_file.trim()) {
                        // Insert the approval memo document into project_documents
                        const memoType = memo.memo_type === 'monthly' ? 'মাসিক সভা' : 'মন্ত্রণালয়ের স্মারক';
                        const docName = `অনুমোদন স্মারক (${memoType})`;
                        // Detect file type from file extension
                        const fileExt = memo.document_file.substring(memo.document_file.lastIndexOf('.') + 1).toLowerCase();
                        const fileType = ['doc', 'docx'].includes(fileExt) ? fileExt : 'pdf';
                        // Remove /uploads/ prefix to store relative path (like other documents)
                        const relativePath = memo.document_file.replace(/^\/uploads\//, '');
                        await conn.execute(
                            `INSERT INTO project_documents (project_id, file_path, original_name, file_type, uploaded_by)
                             VALUES (?, ?, ?, ?, ?)`,
                            [projectId, relativePath, docName, fileType, null]
                        );
                    }
                }
            }

            await conn.commit();
            return projectId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    async update(id, data) {
        const conn = await pool.getConnection();
        try {
            const sanitized = sanitizeProjectData(data);

            // Auto-populate lat_lng from upazila if not provided
            if (sanitized.upazila && (!sanitized.lat_lng || sanitized.lat_lng === null)) {
                sanitized.lat_lng = autoPopulateLatLng(sanitized.upazila, sanitized.lat_lng);
            }

            const setClauses = Object.keys(sanitized).map(key => `${key} = ?`).join(', ');
            const sql = `UPDATE projects SET ${setClauses} WHERE id = ?`;
            const [result] = await conn.execute(sql, [...Object.values(sanitized), id]);

            if (result.affectedRows === 0) {
                return false;
            }

            // If approval_memo_id is being updated, handle approval memo document
            if (data.approval_memo_id) {
                const [memoRows] = await conn.execute(
                    `SELECT id, document_file, memo_type FROM approval_memos WHERE id = ?`,
                    [data.approval_memo_id]
                );
                if (memoRows && memoRows.length > 0) {
                    const memo = memoRows[0];
                    if (memo.document_file && memo.document_file.trim()) {
                        // Remove /uploads/ prefix to store relative path (like other documents)
                        const relativePath = memo.document_file.replace(/^\/uploads\//, '');

                        // Check if approval memo document is already attached
                        const [existing] = await conn.execute(
                            `SELECT id FROM project_documents WHERE project_id = ? AND file_path = ?`,
                            [id, relativePath]
                        );

                        // Only add if not already attached
                        if (!existing || existing.length === 0) {
                            const memoType = memo.memo_type === 'monthly' ? 'মাসিক সভা' : 'মন্ত্রণালয়ের স্মারক';
                            const docName = `অনুমোদন স্মারক (${memoType})`;
                            // Detect file type from file extension
                            const fileExt = memo.document_file.substring(memo.document_file.lastIndexOf('.') + 1).toLowerCase();
                            const fileType = ['doc', 'docx'].includes(fileExt) ? fileExt : 'pdf';
                            await conn.execute(
                                `INSERT INTO project_documents (project_id, file_path, original_name, file_type, uploaded_by)
                                 VALUES (?, ?, ?, ?, ?)`,
                                [id, relativePath, docName, fileType, null]
                            );
                        }
                    }
                }
            }

            return true;
        } finally {
            conn.release();
        }
    },

    async delete(id) {
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getAll(page = 1, limit = 20, search = '', year = '', priority = '', upazila = '', method = '', status = '') {
        const safeLimit = parseInt(limit, 10) || 20;
        const safePage = parseInt(page, 10) || 1;
        const offset = (safePage - 1) * safeLimit;

        let sql = `SELECT ${PROJECT_FIELDS},
                   (SELECT MAX(logged_at) FROM project_progress_log WHERE project_id = projects.id) as last_logged_at
                   FROM projects`;
        let countSql = 'SELECT COUNT(*) as total FROM projects';
        const params = [];
        const countParams = [];
        const conditions = [];
        let hasSearch = false;

        // Multi-keyword search with relevance scoring (same as search() method)
        if (search && search.trim().length >= 2) {
            hasSearch = true;
            const keywords = search.trim().split(/\s+/).filter(k => k.length >= 2);

            if (keywords.length > 0) {
                const scoreParts = [];
                const whereParts = [];

                keywords.forEach((keyword) => {
                    const searchTerm = `%${keyword}%`;

                    // Score calculation parameters (for SELECT clause only)
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
                    for (let i = 0; i < 8; i++) params.push(searchTerm);

                    // WHERE clause parameters (for both SELECT and COUNT queries)
                    whereParts.push(`(
                        project_name LIKE ? OR id LIKE ? OR upazila LIKE ? OR
                        project_type LIKE ? OR current_status LIKE ? OR
                        implementation_method LIKE ? OR fund_type LIKE ? OR remarks LIKE ?
                    )`);
                    for (let i = 0; i < 8; i++) {
                        params.push(searchTerm);
                        countParams.push(searchTerm);
                    }
                });

                sql = `SELECT ${PROJECT_FIELDS}, (${scoreParts.join(' + ')}) AS relevance_score FROM projects`;
                conditions.push('(' + whereParts.join(' OR ') + ')');
            }
        }

        if (year && year !== 'all') {
            conditions.push('financial_year = ?');
            params.push(year);
            countParams.push(year);
        }

        const validPriorities = ['general', 'medium', 'top_priority'];
        if (priority && validPriorities.includes(priority)) {
            conditions.push('priority = ?');
            params.push(priority);
            countParams.push(priority);
        }

        if (upazila && upazila !== '') {
            conditions.push('upazila = ?');
            params.push(upazila);
            countParams.push(upazila);
        }

        if (method && method !== '') {
            conditions.push('implementation_method = ?');
            params.push(method);
            countParams.push(method);
        }

        if (status && status !== '') {
            // Status filter: completed, delayed, ongoing, pending
            const oneMonthAgoDate = new Date();
            oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
            const oneMonthAgoIso = oneMonthAgoDate.toISOString().split('T')[0];

            const twoMonthsAgoDate = new Date();
            twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
            const twoMonthsAgoIso = twoMonthsAgoDate.toISOString().split('T')[0];

            if (status === 'completed') {
                conditions.push('(is_completed = 1 OR progress_percentage >= 100)');
            } else if (status === 'pending') {
                conditions.push('(progress_percentage = 0 OR progress_percentage IS NULL)');
            } else if (status === 'delayed') {
                // Delayed: created >= 2 months ago AND 0 < progress < 100% AND no progress logged for > 1 month
                // Use COALESCE to handle NULL (projects with no logs are considered delayed)
                conditions.push(`created_at < ? AND progress_percentage > 0 AND progress_percentage < 100 AND COALESCE(
                    (SELECT MAX(logged_at) FROM project_progress_log WHERE project_id = projects.id),
                    '1900-01-01'
                ) < ?`);
                params.push(twoMonthsAgoIso);
                params.push(oneMonthAgoIso);
                countParams.push(twoMonthsAgoIso);
                countParams.push(oneMonthAgoIso);
            } else if (status === 'ongoing') {
                // Ongoing: 0 < progress < 100% (regardless of age)
                conditions.push('(progress_percentage > 0 AND progress_percentage < 100)');
            }
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            sql += whereClause;
            countSql += whereClause;
        }

        // Order by relevance score if search, otherwise by created_at
        if (hasSearch) {
            sql += ` ORDER BY relevance_score DESC, project_name ASC LIMIT ${safeLimit} OFFSET ${offset}`;
        } else {
            sql += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;
        }

        const [results] = await pool.execute(sql, params);
        const [countResult] = await pool.execute(countSql, countParams);

        return {
            data: results.map(({ relevance_score, ...rest }) => rest),
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
                    is_completed, is_delayed, note, progress_step_id, logged_at
             FROM project_progress_log
             WHERE project_id = ?
             ORDER BY logged_at DESC`,
            [projectId]
        );
        return results || [];
    },

    async addProgressLog(projectId, data, loggedBy) {
        const {
            progress_step_id = null,
            released_amount,
            progress_percentage: providedProgressPercentage,
            current_status,
            is_completed = 0,
            is_delayed   = 0,
            note         = null,
            activity_date = null
        } = data;

        // Validate required fields
        if (!current_status || !current_status.trim()) {
            throw new Error('current_status is required');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Fetch current project fields needed for the formula (single query)
            const [rows] = await conn.execute(
                `SELECT allocation_amount, released_amount, implementation_method, start_date FROM projects WHERE id = ?`,
                [projectId]
            );
            if (!rows || rows.length === 0) throw new Error('Project not found: ' + projectId);
            const project = rows[0];

            // Determine effective released_amount:
            // If a new release was provided use it; otherwise keep the existing DB value
            const effectiveReleased = (released_amount !== null && released_amount !== undefined)
                ? parseFloat(released_amount)
                : parseFloat(project.released_amount || 0);

            // Use frontend-calculated progress percentage if provided, otherwise calculate it
            let progress_percentage;
            let finalProgressStepId = progress_step_id;
            let currentStep = null;

            // Fetch step info if provided (needed for final bill check later)
            if (progress_step_id) {
                currentStep = await progressStepsModel.getStepById(progress_step_id);
                if (!currentStep) throw new Error('Invalid progress step: ' + progress_step_id);
            }

            if (providedProgressPercentage !== null && providedProgressPercentage !== undefined) {
                // Use the progress percentage provided by the frontend
                progress_percentage = parseInt(providedProgressPercentage, 10);
            } else if (currentStep) {
                // If progress_step_id is provided, use the step-based calculation
                progress_percentage = calcProgressFromStep({
                    step: currentStep,
                    allocation_amount: project.allocation_amount,
                    released_amount: effectiveReleased,
                    is_completed
                });
            } else {
                // Fall back to legacy calculation if no step provided
                progress_percentage = calcProgress({
                    current_status,
                    implementation_method: project.implementation_method,
                    allocation_amount:     project.allocation_amount,
                    released_amount:       effectiveReleased,
                    is_completed,
                    is_delayed
                });
            }

            // 1. Insert snapshot into progress log
            const logFields = ['project_id', 'progress_percentage', 'released_amount',
                              'current_status', 'is_completed', 'is_delayed', 'note', 'logged_by', 'progress_step_id'];
            const logValues = [projectId, progress_percentage, effectiveReleased,
                              current_status, is_completed ? 1 : 0, is_delayed ? 1 : 0,
                              note || null, loggedBy || null, progress_step_id || null];

            if (activity_date) {
                logFields.push('logged_at');
                logValues.push(activity_date);
            }

            await conn.execute(
                `INSERT INTO project_progress_log (${logFields.join(', ')})
                 VALUES (${logFields.map(() => '?').join(', ')})`,
                logValues
            );

            // 2. Update the live project row
            console.log('Updating project progress and timestamp for projectId:', projectId);
            const updateFields = [
                `progress_percentage = ?`,
                `released_amount = ?`,
                `current_status = ?`,
                `is_completed = ?`,
                `is_delayed = ?`,
                `updated_at = CURRENT_TIMESTAMP`
            ];
            const updateParams = [
                progress_percentage,
                effectiveReleased,
                current_status,
                is_completed ? 1 : 0,
                is_delayed ? 1 : 0
            ];

            // Auto-set actual_end_date when final bill (100%) is marked
            if (currentStep && currentStep.base_percentage === 100) {
                updateFields.push(`actual_end_date = CURDATE()`);
            }

            if (finalProgressStepId) {
                updateFields.push(`progress_step_id = ?`);
                updateParams.push(finalProgressStepId);
            }

            // Auto-set start_date if not already set (first progress log)
            if (!project.start_date) {
                if (activity_date) {
                    updateFields.push(`start_date = ?`);
                    updateParams.push(activity_date);
                } else {
                    updateFields.push(`start_date = CURDATE()`);
                }
            }

            updateParams.push(projectId);

            await conn.execute(
                `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
                updateParams
            );

            // Fetch the latest progress log to ensure project record matches it exactly
            const [latestLogResult] = await conn.execute(
                `SELECT progress_percentage, released_amount FROM project_progress_log
                 WHERE project_id = ? ORDER BY logged_at DESC LIMIT 1`,
                [projectId]
            );

            // If latest log differs from what we just saved, re-update to match it
            if (latestLogResult && latestLogResult.length > 0) {
                const latestLog = latestLogResult[0];
                const savedProgressPct = parseInt(progress_percentage, 10);
                const savedReleasedAmt = parseFloat(effectiveReleased);
                const logProgressPct = parseInt(latestLog.progress_percentage, 10);
                const logReleasedAmt = parseFloat(latestLog.released_amount || 0);

                // Only update if there's a mismatch
                if (savedProgressPct !== logProgressPct || savedReleasedAmt !== logReleasedAmt) {
                    console.log(`Progress mismatch detected. Project: ${savedProgressPct}%, ${savedReleasedAmt}. Latest log: ${logProgressPct}%, ${logReleasedAmt}. Syncing...`);
                    await conn.execute(
                        `UPDATE projects SET progress_percentage = ?, released_amount = ? WHERE id = ?`,
                        [latestLog.progress_percentage, latestLog.released_amount, projectId]
                    );
                }
            }

            await conn.commit();
            return { progress_percentage, progress_step_id: finalProgressStepId };
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
        // Update project's updated_at to move it to the top of the list
        try {
            console.log('Updating project timestamp after image upload, projectId:', projectId);
            const result = await pool.execute(
                `UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [projectId]
            );
            console.log('Timestamp update result:', result);
        } catch (err) {
            console.error('Error updating project timestamp after image upload:', err);
        }
    },

    // ── Document records ───────────────────────────────────────
    async getDocuments(projectId) {
        const [results] = await pool.execute(
            `SELECT id, file_path, original_name, caption, file_type, file_size_bytes, uploaded_at
             FROM project_documents
             WHERE project_id = ?
             ORDER BY uploaded_at ASC`,
            [projectId]
        );
        return results;
    },

    async addDocuments(projectId, docs, uploadedBy) {
        for (const doc of docs) {
            await pool.execute(
                `INSERT INTO project_documents
                    (project_id, file_path, original_name, caption, file_type, file_size_bytes, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [projectId, doc.file_path, doc.original_name, doc.caption || null,
                 doc.file_type || null, doc.file_size_bytes || null, uploadedBy || null]
            );
        }
        // Update project's updated_at to move it to the top of the list
        try {
            console.log('Updating project timestamp after document upload, projectId:', projectId);
            const result = await pool.execute(
                `UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [projectId]
            );
            console.log('Timestamp update result:', result);
        } catch (err) {
            console.error('Error updating project timestamp after document upload:', err);
        }
    },

    async deleteProgressLog(logId, projectId) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Verify the log belongs to this project before deleting
            const [[row]] = await conn.execute(
                `SELECT id FROM project_progress_log WHERE id = ? AND project_id = ?`,
                [logId, projectId]
            );
            if (!row) return null;

            // Check if this is the latest log - only the latest can be deleted
            const [[latestLogRow]] = await conn.execute(
                `SELECT id FROM project_progress_log
                 WHERE project_id = ?
                 ORDER BY logged_at DESC
                 LIMIT 1`,
                [projectId]
            );
            if (latestLogRow && latestLogRow.id !== logId) {
                throw new Error('শুধুমাত্র সর্বশেষ অগ্রগতি লগ মুছে ফেলা যায়। পুরানো লগগুলি সংরক্ষিত থাকে।');
            }

            // Delete the progress log entry
            await conn.execute(`DELETE FROM project_progress_log WHERE id = ?`, [logId]);

            // Get the most recent remaining log for this project
            const [[latestLog]] = await conn.execute(
                `SELECT progress_percentage, released_amount, current_status, is_completed, is_delayed, progress_step_id
                 FROM project_progress_log
                 WHERE project_id = ?
                 ORDER BY logged_at DESC
                 LIMIT 1`,
                [projectId]
            );

            // Get current project allocation and method
            const [[project]] = await conn.execute(
                `SELECT allocation_amount, implementation_method FROM projects WHERE id = ?`,
                [projectId]
            );

            if (!project) throw new Error('Project not found: ' + projectId);

            // Update project with the most recent log's progress, or reset to defaults
            let updateData = latestLog ? {
                progress_percentage: latestLog.progress_percentage,
                released_amount: latestLog.released_amount,
                current_status: latestLog.current_status,
                is_completed: latestLog.is_completed,
                is_delayed: latestLog.is_delayed
            } : {
                progress_percentage: 0,
                released_amount: 0,
                current_status: 'কাজ শুরু হয়নি',
                is_completed: 0,
                is_delayed: 0
            };

            // Validate released_amount doesn't exceed constraint (allocation * 1.05)
            const maxAllowed = parseFloat(project.allocation_amount) * 1.05;
            if (updateData.released_amount > maxAllowed) {
                console.warn(`Released amount ${updateData.released_amount} exceeds max ${maxAllowed}, capping...`);
                updateData.released_amount = parseFloat(project.allocation_amount);
            }

            await conn.execute(
                `UPDATE projects SET progress_percentage = ?, released_amount = ?, current_status = ?, is_completed = ?, is_delayed = ? WHERE id = ?`,
                [updateData.progress_percentage, updateData.released_amount, updateData.current_status, updateData.is_completed, updateData.is_delayed, projectId]
            );

            await conn.commit();
            return true;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    async deleteDocument(docId, projectId) {
        const [[row]] = await pool.execute(
            `SELECT id, file_path FROM project_documents WHERE id = ? AND project_id = ?`,
            [docId, projectId]
        );
        if (!row) return null;
        await pool.execute(`DELETE FROM project_documents WHERE id = ?`, [docId]);
        // Update project's updated_at to move it to the top of the list
        await pool.execute(
            `UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [projectId]
        );
        return row.file_path;
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
        // Update project's updated_at to move it to the top of the list
        await pool.execute(
            `UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [projectId]
        );
        return row.photo_path;
    },

    async getAllForMap(year = '', priority = '', upazila = '', method = '') {
        let sql = `SELECT id, project_name, upazila, lat_lng, implementation_method, priority, progress_percentage, current_status, allocation_amount, financial_year, fund_type FROM projects`;
        const params = [];
        const conditions = [];

        if (year && year !== 'all') {
            conditions.push('financial_year = ?');
            params.push(year);
        }

        const validPriorities = ['general', 'medium', 'top_priority'];
        if (priority && validPriorities.includes(priority)) {
            conditions.push('priority = ?');
            params.push(priority);
        }

        if (upazila && upazila !== '') {
            conditions.push('upazila = ?');
            params.push(upazila);
        }

        if (method && method !== '') {
            conditions.push('implementation_method = ?');
            params.push(method);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY project_name ASC';

        const [results] = await pool.execute(sql, params);

        return results.map(project => {
            const { lat, lng } = this.parseLatLng(project.lat_lng) || { lat: null, lng: null };
            return {
                id: project.id,
                name: project.project_name,
                upazila: project.upazila,
                lat,
                lng,
                implementation_method: project.implementation_method,
                priority: project.priority,
                progress: project.progress_percentage,
                status: project.current_status,
                allocation_amount: project.allocation_amount,
                financial_year: project.financial_year,
                fund_type: project.fund_type
            };
        });
    },

    parseLatLng(latLngString) {
        if (!latLngString || typeof latLngString !== 'string') return null;
        const [lat, lng] = latLngString.split(',').map(str => parseFloat(str.trim()));
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
    },

    async findSimilarProjects(projectName, upazila, financialYear, fundType, allocationAmount) {
        const stringSimilarity = require('string-similarity');

        // Query for projects with exact match on: upazila, financial_year, fund_type, allocation_amount
        const [results] = await pool.execute(
            `SELECT id, project_name, upazila, financial_year, fund_type, allocation_amount
             FROM projects
             WHERE upazila = ?
               AND financial_year = ?
               AND fund_type = ?
               AND allocation_amount = ?
             ORDER BY created_at DESC`,
            [upazila, financialYear, fundType, allocationAmount || 0]
        );

        if (!results || results.length === 0) {
            return [];
        }

        // Calculate similarity scores for each project name
        const similarities = results.map(project => {
            const similarity = stringSimilarity.compareTwoStrings(
                projectName.toLowerCase().trim(),
                project.project_name.toLowerCase().trim()
            );
            return {
                ...project,
                similarity_score: Math.round(similarity * 100),
                allocation_amount: parseFloat(project.allocation_amount)
            };
        });

        // Filter for 70%+ similarity and get top 5
        const filtered = similarities
            .filter(p => p.similarity_score >= 70)
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, 5);

        return filtered;
    }
};

module.exports = projectsModel;
