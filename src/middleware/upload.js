const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Project image storage ──────────────────────────────────────
const projectImageStorage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = path.join(__dirname, '../../uploads/projects');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
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

// ── Project documents storage ──────────────────────────────────────
const projectDocumentsStorage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = path.join(__dirname, '../../uploads/documents');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename(req, file, cb) {
        const projectId = (req.params.id || 'unknown').replace(/[^a-zA-Z0-9\-]/g, '');
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `proj-${projectId}-${Date.now()}${ext}`;
        cb(null, safeName);
    }
});

const projectDocumentFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('শুধুমাত্র PDF, Word, Excel, ছবি বা টেক্সট ফাইল আপলোড করা যাবে।'), false);
    }
};

const uploadProjectDocuments = multer({
    storage: projectDocumentsStorage,
    fileFilter: projectDocumentFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 10                    // up to 10 files per request
    }
});

// ── Approval Memos document storage ──────────────────────────────────────
const approvalMemosStorage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = path.join(__dirname, '../../uploads/approval-memos');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename(req, file, cb) {
        const memoId = (req.params.id || 'new').replace(/[^a-zA-Z0-9\-]/g, '');
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `memo-${memoId}-${Date.now()}${ext}`;
        cb(null, safeName);
    }
});

const documentFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('শুধুমাত্র PDF বা Word ডকুমেন্ট আপলোড করা যাবে।'), false);
    }
};

const uploadApprovalMemoDocument = multer({
    storage: approvalMemosStorage,
    fileFilter: documentFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5 MB max
    }
});

module.exports = { uploadProjectImages, uploadProjectDocuments, uploadApprovalMemoDocument };
