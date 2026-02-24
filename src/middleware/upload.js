const multer = require('multer');
const path = require('path');

// ── Project image storage ──────────────────────────────────────
const projectImageStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/projects'));
    },
    filename(req, file, cb) {
        const projectId = (req.params.id || 'unknown').replace(/[^a-zA-Z0-9\-]/g, '');
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `proj-${projectId}-${Date.now()}${ext}`;
        cb(null, safeName);
    }
});

const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('শুধুমাত্র JPEG, PNG বা WebP ছবি আপলোড করা যাবে।'), false);
    }
};

const uploadProjectImages = multer({
    storage: projectImageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
        files: 10                   // up to 10 files per request
    }
});

module.exports = { uploadProjectImages };
