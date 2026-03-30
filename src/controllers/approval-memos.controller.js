const approvalMemosModel = require('../models/approval-memos.model');

const isProduction = process.env.NODE_ENV === 'production';

const approvalMemosController = {
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
            const search = req.query.search || '';
            const year = req.query.year || '';

            const results = await approvalMemosModel.getAll(page, limit, search, year);
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
            const { memo_date, memo_number, total_projects } = req.body;

            if (!memo_date || !memo_number) {
                return res.status(400).json({ error: 'Missing required fields: memo_date, memo_number' });
            }

            const id = await approvalMemosModel.create({
                memo_date,
                memo_number,
                total_projects: parseInt(total_projects, 10) || 0,
                remarks: req.body.remarks || null,
                created_by: req.user?.id || null
            });

            res.status(201).json({
                id,
                message: 'Memo created successfully'
            });
        } catch (error) {
            console.error('Approval memos create error:', error);
            res.status(500).json({
                error: 'Creation failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async update(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Invalid memo ID' });
            }

            const memo = await approvalMemosModel.findById(id);
            if (!memo) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            const updated = await approvalMemosModel.update(id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Memo not found' });
            }

            res.json({ message: 'Memo updated successfully' });
        } catch (error) {
            console.error('Approval memos update error:', error);
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
    }
};

module.exports = approvalMemosController;
