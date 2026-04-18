const projectsModel = require('../models/projects.model');
const progressStepsModel = require('../models/progressSteps.model');

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

    async getProgressSteps(req, res) {
        try {
            const { method } = req.query;
            if (!method) {
                return res.status(400).json({ error: 'বাস্তবায়ন পদ্ধতি প্রয়োজন' });
            }

            const validMethods = ['cppc', 'tender', 'rfq', 'সিপিপিসি', 'টেন্ডার', 'আরএফকিউ'];
            if (!validMethods.includes(method)) {
                return res.status(400).json({ error: 'অবৈধ বাস্তবায়ন পদ্ধতি' });
            }

            // Map Bengali method names to English
            const methodMap = {
                'সিপিপিসি': 'cppc',
                'টেন্ডার': 'tender',
                'আরএফকিউ': 'rfq'
            };
            const normalizedMethod = methodMap[method] || method.toLowerCase();

            const steps = await progressStepsModel.getStepsByMethod(normalizedMethod);
            res.json(steps);
        } catch (error) {
            console.error('Progress steps fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch progress steps',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getAvailableMemos(req, res) {
        try {
            const { financialYear } = req.params;
            if (!financialYear) {
                return res.status(400).json({ error: 'আর্থিক বছর প্রয়োজন' });
            }
            const memos = await projectsModel.getAvailableMemos(financialYear);
            res.json(memos);
        } catch (error) {
            console.error('Projects memos fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch memos',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async getUpazilas(req, res) {
        try {
            const upazilas = await projectsModel.getUpazilas();
            res.json(upazilas);
        } catch (error) {
            console.error('Projects upazilas fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch upazilas',
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

    async getMapData(req, res) {
        try {
            const year = req.query.year || '';
            const priority = req.query.priority || '';
            const upazila = req.query.upazila || '';
            const implementation_method = req.query.implementation_method || '';

            const results = await projectsModel.getAllForMap(year, priority, upazila, implementation_method);
            res.json(results);
        } catch (error) {
            console.error('Projects map data error:', error);
            res.status(500).json({
                error: 'Failed to fetch map data',
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
            const priority = req.query.priority || '';
            const upazila = req.query.upazila || '';
            const method = req.query.method || '';
            const status = req.query.status || '';

            const results = await projectsModel.getAll(page, limit, search, year, priority, upazila, method, status);
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

    async getDocuments(req, res) {
        try {
            const id = req.params.id;
            if (!id || id.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const documents = await projectsModel.getDocuments(project.id);
            res.json(documents);
        } catch (error) {
            console.error('Projects getDocuments error:', error);
            res.status(500).json({
                error: 'Failed to fetch documents',
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

            const { progress_step_id, released_amount, current_status, progress_percentage,
                    is_completed, is_delayed, note, activity_date } = req.body;

            // If progress_step_id is provided, validate it and get the step
            if (progress_step_id) {
                const step = await progressStepsModel.getStepById(progress_step_id);
                if (!step) {
                    return res.status(400).json({ error: 'অবৈধ অগ্রগতি ধাপ' });
                }
                // Validate step belongs to the project's implementation method
                if (step.implementation_method.toLowerCase() !== project.implementation_method.toLowerCase().replace('টেন্ডার', 'tender').replace('সিপিপিসি', 'cppc').replace('আরএফকিউ', 'rfq')) {
                    return res.status(400).json({ error: 'এই অগ্রগতি ধাপটি প্রকল্পের বাস্তবায়ন পদ্ধতির জন্য উপযুক্ত নয়' });
                }
            } else if (!current_status) {
                return res.status(400).json({ error: 'বর্তমান অবস্থা বা অগ্রগতি ধাপ আবশ্যক' });
            }

            const result = await projectsModel.addProgressLog(project.id, {
                progress_step_id: progress_step_id ? parseInt(progress_step_id, 10) : null,
                released_amount: released_amount !== undefined ? parseFloat(released_amount) : null,
                progress_percentage: progress_percentage !== undefined ? parseInt(progress_percentage, 10) : null,
                current_status: current_status ? current_status.trim() : '',
                is_completed: is_completed ? 1 : 0,
                is_delayed: is_delayed ? 1 : 0,
                note: note ? note.trim() : null,
                activity_date: activity_date || null
            }, req.user.id);

            // Fetch updated project to return released_amount for frontend fund release percentage update
            const updatedProject = await projectsModel.findById(project.id);

            res.json({
                message: 'অগ্রগতি সংরক্ষণ করা হয়েছে',
                progress_percentage: result.progress_percentage,
                progress_step_id: result.progress_step_id,
                released_amount: updatedProject.released_amount,
                current_status: updatedProject.current_status,
                is_completed: updatedProject.is_completed,
                allocation_amount: updatedProject.allocation_amount
            });
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
            console.log('Adding images for project ID:', project.id);
            await projectsModel.addImages(project.id, images, req.user.id);
            console.log('Images added successfully');

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

    async deleteProgressLog(req, res) {
        try {
            const { id, logId } = req.params;
            if (!id || !logId) {
                return res.status(400).json({ error: 'Invalid project or log ID' });
            }

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'প্রকল্পটি পাওয়া যায়নি' });
            }

            // Delete the progress log entry
            const deleted = await projectsModel.deleteProgressLog(parseInt(logId, 10), project.id);
            if (!deleted) {
                return res.status(404).json({ error: 'অগ্রগতি লগটি পাওয়া যায়নি' });
            }

            res.json({ message: 'অগ্রগতি লগ মুছে ফেলা হয়েছে' });
        } catch (error) {
            console.error('Projects deleteProgressLog error:', error);
            res.status(500).json({
                error: 'Delete failed',
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
    },

    async deleteDocument(req, res) {
        try {
            const { id, docId } = req.params;
            if (!id || !docId) {
                return res.status(400).json({ error: 'Invalid project or document ID' });
            }

            const project = await projectsModel.findById(id.trim());
            if (!project) {
                return res.status(404).json({ error: 'প্রকল্পটি পাওয়া যায়নি' });
            }

            const deleted = await projectsModel.deleteDocument(parseInt(docId, 10), project.id);
            if (!deleted) {
                return res.status(404).json({ error: 'ডকুমেন্টটি পাওয়া যায়নি' });
            }

            res.json({ message: 'ডকুমেন্টটি মুছে ফেলা হয়েছে' });
        } catch (error) {
            console.error('Projects deleteDocument error:', error);
            res.status(500).json({
                error: 'Document delete failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async addDocuments(req, res) {
        try {
            console.log('=== addDocuments called ===');
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
                return res.status(400).json({ error: 'কোনো ডকুমেন্ট নির্বাচন করা হয়নি' });
            }

            // Support per-file metadata arrays OR a single value applied to all files.
            // Frontend sends: caption[] arrays (one per file)
            const captions = req.body.caption || [];

            const toArr = v => Array.isArray(v) ? v : [v];
            const captionsArr = toArr(captions);

            const documents = req.files.map((file, i) => ({
                file_path: `documents/${file.filename}`,
                original_name: file.originalname,
                caption: (captionsArr[i] || captionsArr[0] || '').trim() || null,
                file_type: file.originalname.split('.').pop().toLowerCase(),
                file_size_bytes: file.size
            }));

            // Use the integer id for the database insert
            console.log('Adding documents for project ID:', project.id);
            await projectsModel.addDocuments(project.id, documents, req.user.id);
            console.log('Documents added successfully');

            res.json({
                message: 'ডকুমেন্ট আপলোড করা হয়েছে',
                count: documents.length
            });
        } catch (error) {
            console.error('Projects addDocuments error:', error);
            res.status(500).json({
                error: 'Document upload failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    },

    async checkDuplicates(req, res) {
        try {
            const { project_name, upazila, financial_year, fund_type, allocation_amount } = req.body;

            // Validate required fields
            if (!project_name || !upazila || !financial_year || !fund_type) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const duplicates = await projectsModel.findSimilarProjects(
                project_name,
                upazila,
                financial_year,
                fund_type,
                allocation_amount
            );

            res.json({ duplicates: duplicates || [] });
        } catch (error) {
            console.error('Projects checkDuplicates error:', error);
            res.status(500).json({
                error: 'Duplicate check failed',
                message: isProduction ? 'An internal error occurred' : error.message
            });
        }
    }
};

module.exports = projectsController;
