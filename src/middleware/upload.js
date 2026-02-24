const multer = require('multer');
const path = require('path');

// ── Shared per-request file counter (resets each request) ─────
// Multer calls filename() once per file sequentially, so a simple
// closure counter on req gives collision-free indexes.
function getFileIndex(req) {
    if (!req._uploadIndex) req._uploadIndex = 0;
    return ++req._uploadIndex;
}

// Multer receives multipart filenames encoded as Latin-1 (ISO-8859-1).
// Re-encode the raw bytes as UTF-8 to get the real Unicode name, then
// extract the ASCII extension safely (extensions are always ASCII).
function safeExt(originalname) {
    const realName = Buffer.from(originalname, 'latin1').toString('utf8');
    return path.extname(realName).toLowerCase();
}

// ── Project image storage ──────────────────────────────────────
const projectImageStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/projects'));
    },
    filename(req, file, cb) {
        const projectId = (req.params.id || 'unknown').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
        const ext = safeExt(file.originalname);
        const ts  = Date.now();
        const idx = getFileIndex(req);
        cb(null, `proj-${projectId}-${ts}-${idx}${ext}`);
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

// ── Project document storage ───────────────────────────────────
const projectDocStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/project-docs'));
    },
    filename(req, file, cb) {
        const projectId = (req.params.id || 'unknown').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
        const ext = safeExt(file.originalname);
        const ts  = Date.now();
        const idx = getFileIndex(req);
        cb(null, `doc-${projectId}-${ts}-${idx}${ext}`);
    }
});

const docFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg', 'image/jpg', 'image/png',
        'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('শুধুমাত্র PDF, Word, Excel, ছবি বা TXT ফাইল আপলোড করা যাবে।'), false);
    }
};

const uploadProjectDocuments = multer({
    storage: projectDocStorage,
    fileFilter: docFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 10
    }
});

module.exports = { uploadProjectImages, uploadProjectDocuments };
