const approvalMemosModel = require('../models/approval-memos.model');
const pool = require('../../config/database');

const isProduction = process.env.NODE_ENV === 'production';

// Look up actual DB id by username+role to avoid stale JWT ids across deploys
async function resolveUserId(jwtUser) {
    if (!jwtUser?.username) return null;
    try {
        const [[row]] = await pool.execute(
            'SELECT id FROM admin_users WHERE username = ? AND role = ? LIMIT 1',
            [jwtUser.username, jwtUser.role]
        );
        return row?.id || null;
    } catch {
        return null;
    }
}

const approvalMemosController = {
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
            const search = req.query.search || '';
            const year = req.query.year || '';
            const financialYear = req.query.financialYear || '';

            const results = await approvalMemosModel.getAll(page, limit, search, year, financialYear);
            res.json(results);
        } catch (error) {
            console.error('Approval memos getAll error:', error);
            res.status(500).json({
                error: 'Failed to fetch records',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Invalid memo ID' });
            }

            const result = await approvalMemosModel.findById(id);
            if (!result) {
                return res.status(404).json({ error: 'Memo not found' });
            }
            res.json(result);
        } catch (error) {
            console.error('Approval memos getById error:', error);
            res.status(500).json({
                error: 'Fetch failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async create(req, res) {
        try {
            const { memo_type, memo_date, memo_number, total_projects, meeting_month, meeting_date } = req.body;

            // Validate memo_type
            if (!memo_type || !['ministry', 'monthly'].includes(memo_type)) {
                return res.status(400).json({ error: 'Invalid or missing memo type. Must be "ministry" or "monthly"' });
            }

            // Validate based on memo type
            if (memo_type === 'ministry') {
                if (!memo_date || memo_date === '' || !memo_number || memo_number === '') {
                    return res.status(400).json({ error: 'Missing required fields for ministry memo: memo_date, memo_number' });
                }
            } else if (memo_type === 'monthly') {
                if (!meeting_month || meeting_month === '' || !meeting_date || meeting_date === '') {
                    return res.status(400).json({ error: 'Missing required fields for monthly memo: meeting_month, meeting_date' });
                }
            }

            const createData = {
                memo_type,
                total_projects: parseInt(total_projects, 10) || 0,
                remarks: req.body.remarks || null,
                document_file: req.file ? `/uploads/approval-memos/${req.file.filename}` : null,
                created_by: await resolveUserId(req.user)
            };

            // Add type-specific fields
            if (memo_type === 'ministry') {
                createData.memo_date = memo_date;
                createData.memo_number = memo_number;
                createData.financial_year = req.body.financial_year || null;
            } else if (memo_type === 'monthly') {
                createData.meeting_month = meeting_month;
                createData.meeting_date = meeting_date;
                createData.memo_date = null;
                createData.memo_number = null;
                createData.financial_year = req.body.financial_year || null;
            }

            const id = await approvalMemosModel.create(createData);

            res.status(201).json({
                id,
                message: 'Memo created successfully'
            });
        } catch (error) {
            console.error('Approval memos create error:', error);
            console.error('Stack:', error.stack);

            // Handle duplicate memo_number
            if (error.code === 'ER_DUP_ENTRY' && error.message.includes('memo_number')) {
                return res.status(400).json({
                    error: 'Duplicate memo number',
                    message: 'এই স্মারক নম্বরটি ইতিমধ্যে বিদ্যমান। একটি ভিন্ন নম্বর ব্যবহার করুন।'
                });
            }

            res.status(500).json({
                error: 'Creation failed',
                message: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const id = req.params.id;
            const { memo_type, memo_date, memo_number, meeting_month, meeting_date } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Invalid memo ID' });
            }

            const memo = await approvalMemosModel.findById(id);
            if (!memo) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            // Validate memo_type if provided
            if (memo_type && !['ministry', 'monthly'].includes(memo_type)) {
                return res.status(400).json({ error: 'Invalid memo type. Must be "ministry" or "monthly"' });
            }

            // Determine which type to validate against (provided type or existing type)
            const typeToValidate = memo_type || memo.memo_type || 'ministry';

            // Validate based on memo type — only validate if fields are being updated (not just file upload)
            if (typeToValidate === 'ministry') {
                if (memo_date !== undefined || memo_number !== undefined) {
                    if (!memo_date || memo_date === '' || !memo_number || memo_number === '') {
                        return res.status(400).json({ error: 'Missing required fields for ministry memo: memo_date, memo_number' });
                    }
                }
            } else if (typeToValidate === 'monthly') {
                if (meeting_month !== undefined || meeting_date !== undefined) {
                    if (!meeting_month || meeting_month === '' || !meeting_date || meeting_date === '') {
                        return res.status(400).json({ error: 'Missing required fields for monthly memo: meeting_month, meeting_date' });
                    }
                }
            }

            const updateData = { ...req.body };
            if (req.file) {
                updateData.document_file = `/uploads/approval-memos/${req.file.filename}`;
            }

            // For monthly memos, ensure memo_date and memo_number are NULL, not empty strings
            if (typeToValidate === 'monthly') {
                updateData.memo_date = null;
                updateData.memo_number = null;
            }

            const updated = await approvalMemosModel.update(id, updateData);
            if (!updated) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            res.json({ message: 'Memo updated successfully' });
        } catch (error) {
            console.error('Approval memos update error:', error);

            // Handle duplicate memo_number
            if (error.code === 'ER_DUP_ENTRY' && error.message.includes('memo_number')) {
                return res.status(400).json({
                    error: 'Duplicate memo number',
                    message: 'এই স্মারক নম্বরটি ইতিমধ্যে বিদ্যমান। একটি ভিন্ন নম্বর ব্যবহার করুন।'
                });
            }

            res.status(500).json({
                error: 'Update failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Invalid memo ID' });
            }

            const memo = await approvalMemosModel.findById(id);
            if (!memo) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            // Check if memo has linked projects
            const linkedProjects = await approvalMemosModel.getProjectsByMemoId(id);
            if (linkedProjects && linkedProjects.length > 0) {
                return res.status(409).json({
                    error: 'Cannot delete memo with linked projects',
                    message: `এই স্মারকটি ${linkedProjects.length}টি প্রকল্পের সাথে সংযুক্ত। প্রথমে প্রকল্পগুলি মুছে ফেলুন বা সংযোগ বিচ্ছিন্ন করুন।`,
                    linkedProjectCount: linkedProjects.length
                });
            }

            const deleted = await approvalMemosModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            res.json({ message: 'Memo deleted successfully' });
        } catch (error) {
            console.error('Approval memos delete error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getYears(req, res) {
        try {
            const years = await approvalMemosModel.getYears();
            res.json(years);
        } catch (error) {
            console.error('Approval memos getYears error:', error);
            res.status(500).json({
                error: 'Failed to fetch years',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getProjectsByMemoId(req, res) {
        try {
            const memoId = req.params.id;
            if (!memoId) {
                return res.status(400).json({ error: 'Invalid memo ID' });
            }

            const memo = await approvalMemosModel.findById(memoId);
            if (!memo) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            const projects = await approvalMemosModel.getProjectsByMemoId(memoId);
            res.json({
                memoId,
                memoNumber: memo.memo_number,
                memoDate: memo.memo_type === 'monthly' ? memo.meeting_date : memo.memo_date,
                financial_year: memo.financial_year,
                memo_type: memo.memo_type,
                meeting_month: memo.meeting_month,
                projects,
                total: memo.total_projects || 0,
                actual_projects: projects.length
            });
        } catch (error) {
            console.error('Approval memos getProjectsByMemoId error:', error);
            res.status(500).json({
                error: 'Failed to fetch projects',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = approvalMemosController;
