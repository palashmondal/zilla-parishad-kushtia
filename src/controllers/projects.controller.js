const projectsModel = require('../models/projects.model');

const isProduction = process.env.NODE_ENV === 'production';

const projectsController = {
    async search(req, res) {
        try {
            const results = await projectsModel.search(req.query.q, req.query.year);
            res.json(results);
        } catch (error) {
            console.error('Projects search error:', error);
            res.status(500).json({
                error: 'Search failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const id = req.params.id;
            if (!id || typeof id !== 'string' || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const result = await projectsModel.findById(id.trim());
            if (!result) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(result);
        } catch (error) {
            console.error('Projects fetch error:', error);
            res.status(500).json({
                error: 'Fetch failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getYears(req, res) {
        try {
            const years = await projectsModel.getYears();
            res.json(years);
        } catch (error) {
            console.error('Projects years fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch years',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await projectsModel.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Projects stats error:', error);
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

            const results = await projectsModel.getAll(page, limit, search, year);
            res.json(results);
        } catch (error) {
            console.error('Projects getAll error:', error);
            res.status(500).json({
                error: 'Failed to fetch records',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async create(req, res) {
        try {
            const id = await projectsModel.create(req.body);
            res.status(201).json({ id, message: 'Project created successfully' });
        } catch (error) {
            console.error('Projects create error:', error);
            res.status(500).json({
                error: 'Create failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async update(req, res) {
        try {
            const id = req.params.id;
            if (!id || typeof id !== 'string' || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const updated = await projectsModel.update(id.trim(), req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json({ message: 'Project updated successfully' });
        } catch (error) {
            console.error('Projects update error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id || typeof id !== 'string' || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const deleted = await projectsModel.delete(id.trim());
            if (!deleted) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json({ message: 'Project deleted successfully' });
        } catch (error) {
            console.error('Projects delete error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getProgressLog(req, res) {
        try {
            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }
            const logs = await projectsModel.getProgressLog(id.trim());
            res.json(logs);
        } catch (error) {
            console.error('Projects getProgressLog error:', error);
            res.status(500).json({
                error: 'Failed to fetch progress log',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async addProgress(req, res) {
        try {
            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const { progress_percentage, released_amount, current_status,
                    is_completed, is_delayed, note } = req.body;

            if (progress_percentage === undefined || !current_status) {
                return res.status(400).json({ error: 'অগ্রগতি এবং বর্তমান অবস্থা আবশ্যক' });
            }

            const pct = parseInt(progress_percentage, 10);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                return res.status(400).json({ error: 'অগ্রগতি ০ থেকে ১০০ এর মধ্যে হতে হবে' });
            }

            await projectsModel.addProgressLog(id.trim(), {
                progress_percentage: pct,
                released_amount: parseFloat(released_amount) || 0,
                current_status: current_status.trim(),
                is_completed: is_completed ? 1 : 0,
                is_delayed: is_delayed ? 1 : 0,
                note: note ? note.trim() : null
            }, req.user.id);

            res.json({ message: 'অগ্রগতি সংরক্ষণ করা হয়েছে' });
        } catch (error) {
            console.error('Projects addProgress error:', error);
            res.status(500).json({
                error: 'Progress update failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async addImages(req, res) {
        try {
            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'কোনো ছবি নির্বাচন করা হয়নি' });
            }

            const { photo_type = 'general', caption = '' } = req.body;

            const images = req.files.map(file => ({
                photo_path: `projects/${file.filename}`,
                photo_type,
                caption: caption.trim() || null,
                file_size_bytes: file.size
            }));

            await projectsModel.addImages(id.trim(), images, req.user.id);

            res.json({
                message: 'ছবি আপলোড করা হয়েছে',
                count: images.length
            });
        } catch (error) {
            console.error('Projects addImages error:', error);
            res.status(500).json({
                error: 'Image upload failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = projectsController;
