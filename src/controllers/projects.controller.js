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

            // First, fetch the project to get its integer id
            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Filter out fields that should not be updated
            const { id: _, project_id: __, created_at, updated_at, created_by, ...updateData } = req.body;

            const updated = await projectsModel.update(project.id, updateData);
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

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const deleted = await projectsModel.delete(project.id);
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

    async getImages(req, res) {
        try {
            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const images = await projectsModel.getImages(project.id);
            res.json(images);
        } catch (error) {
            console.error('Projects getImages error:', error);
            res.status(500).json({
                error: 'Failed to fetch images',
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

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const logs = await projectsModel.getProgressLog(project.id);
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

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'প্রকল্পটি পাওয়া যায়নি' });
            }

            const { released_amount, current_status,
                    is_completed, is_delayed, note } = req.body;

            if (!current_status) {
                return res.status(400).json({ error: 'বর্তমান অবস্থা আবশ্যক' });
            }

            const calculatedPct = await projectsModel.addProgressLog(project.id, {
                released_amount: released_amount !== undefined ? parseFloat(released_amount) : null,
                current_status: current_status.trim(),
                is_completed: is_completed ? 1 : 0,
                is_delayed: is_delayed ? 1 : 0,
                note: note ? note.trim() : null
            }, req.user.id);

            res.json({ message: 'অগ্রগতি সংরক্ষণ করা হয়েছে', progress_percentage: calculatedPct });
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
            console.log('=== addImages called ===');
            console.log('req.params.id:', req.params.id);
            console.log('req.files:', req.files);
            console.log('req.body:', req.body);

            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            // First, fetch the project to get its integer id
            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'প্রকল্পটি পাওয়া যায়নি' });
            }

            console.log('Project found, integer id:', project.id);

            if (!req.files || req.files.length === 0) {
                console.log('No files in request');
                return res.status(400).json({ error: 'কোনো ছবি নির্বাচন করা হয়নি' });
            }

            // Support per-file metadata arrays OR a single value applied to all files.
            // Frontend sends: photo_type[] and caption[] arrays (one per file)
            // or a single photo_type / caption string for batch upload.
            const photoTypes  = req.body.photo_type  || [];
            const captions    = req.body.caption      || [];

            const toArr = v => Array.isArray(v) ? v : [v];
            const typesArr    = toArr(photoTypes);
            const captionsArr = toArr(captions);

            const images = req.files.map((file, i) => ({
                photo_path:       `projects/${file.filename}`,
                photo_type:       typesArr[i]    || typesArr[0]    || 'general',
                caption:          (captionsArr[i] || captionsArr[0] || '').trim() || null,
                file_size_bytes:  file.size
            }));

            // Use the integer id for the database insert
            await projectsModel.addImages(project.id, images, req.user.id);

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
    },

    async deleteImage(req, res) {
        try {
            const { id, imageId } = req.params;
            if (!id || !imageId) {
                return res.status(400).json({ error: 'Invalid project or image ID' });
            }

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'প্রকল্পটি পাওয়া যায়নি' });
            }

            const deleted = await projectsModel.deleteImage(parseInt(imageId, 10), project.id);
            if (!deleted) {
                return res.status(404).json({ error: 'ছবিটি পাওয়া যায়নি' });
            }

            res.json({ message: 'ছবিটি মুছে ফেলা হয়েছে' });
        } catch (error) {
            console.error('Projects deleteImage error:', error);
            res.status(500).json({
                error: 'Image delete failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = projectsController;
