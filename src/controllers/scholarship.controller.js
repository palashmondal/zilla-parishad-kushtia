const scholarshipModel = require('../models/scholarship.model');

const isProduction = process.env.NODE_ENV === 'production';

const scholarshipController = {
    async search(req, res) {
        try {
            const results = await scholarshipModel.search(req.query.q, req.query.year);
            res.json(results);
        } catch (error) {
            console.error('Scholarship search error:', error);
            res.status(500).json({
                error: 'Search failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const numericId = parseInt(req.params.id, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return res.status(400).json({ error: 'Invalid beneficiary ID' });
            }

            const result = await scholarshipModel.findById(numericId);
            if (!result) {
                return res.status(404).json({ error: 'Scholarship beneficiary not found' });
            }
            res.json(result);
        } catch (error) {
            console.error('Scholarship fetch error:', error);
            res.status(500).json({
                error: 'Fetch failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getYears(req, res) {
        try {
            const years = await scholarshipModel.getYears();
            res.json(years);
        } catch (error) {
            console.error('Scholarship years fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch years',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await scholarshipModel.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Scholarship stats error:', error);
            res.status(500).json({
                error: 'Stats failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
            const search = req.query.search || '';
            const year = req.query.year || '';

            const results = await scholarshipModel.getAll(page, limit, search, year);
            res.json(results);
        } catch (error) {
            console.error('Scholarship getAll error:', error);
            res.status(500).json({
                error: 'Failed to fetch records',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async create(req, res) {
        try {
            const id = await scholarshipModel.create(req.body);
            res.status(201).json({ id, message: 'Record created successfully' });
        } catch (error) {
            console.error('Scholarship create error:', error);
            res.status(500).json({
                error: 'Create failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async update(req, res) {
        try {
            const numericId = parseInt(req.params.id, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return res.status(400).json({ error: 'Invalid beneficiary ID' });
            }

            const updated = await scholarshipModel.update(numericId, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.json({ message: 'Record updated successfully' });
        } catch (error) {
            console.error('Scholarship update error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const numericId = parseInt(req.params.id, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return res.status(400).json({ error: 'Invalid beneficiary ID' });
            }

            const deleted = await scholarshipModel.delete(numericId);
            if (!deleted) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.json({ message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Scholarship delete error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = scholarshipController;
