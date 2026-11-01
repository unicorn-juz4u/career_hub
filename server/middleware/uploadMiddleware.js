// server/middleware/uploadMiddleware.js
// Multer middleware for secure, protected resume uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure secure directory exists (NOT served statically to prevent unrestricted public access)
const secureResumesDir = path.join(__dirname, '../secure_uploads/resumes');
if (!fs.existsSync(secureResumesDir)) {
  fs.mkdirSync(secureResumesDir, { recursive: true });
}

// Storage configuration with sanitized unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, secureResumesDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || req.user?.id || 'applicant';
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    // Enforce safe filename format
    const safeName = `resume-${userId}-${timestamp}-${randomSuffix}.pdf`;
    cb(null, safeName);
  },
});

// File filter: Strictly PDF only
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext === '.pdf' && mime === 'application/pdf') {
    return cb(null, true);
  }

  const error = new Error('Invalid file format. Only PDF documents (.pdf) are accepted.');
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

// Configure Multer limits (5MB max)
const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
}).single('resume');

// Wrapper middleware to gracefully handle Multer errors with clean JSON responses
const handleResumeUpload = (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Resume file size exceeds the 5 MB limit. Please upload a smaller PDF.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Only PDF documents are allowed.',
      });
    }
    next();
  });
};

module.exports = {
  handleResumeUpload,
  secureResumesDir,
};
