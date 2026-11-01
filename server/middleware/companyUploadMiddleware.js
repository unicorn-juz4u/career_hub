// server/middleware/companyUploadMiddleware.js
// Multer middleware for company logo and cover image uploads (JPG, PNG, WebP <= 5MB)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directory exists inside public uploads
const companiesUploadDir = path.join(__dirname, '../uploads/companies');
if (!fs.existsSync(companiesUploadDir)) {
  fs.mkdirSync(companiesUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, companiesUploadDir);
  },
  filename: (req, file, cb) => {
    const employerId = req.user?._id || req.user?.id || 'emp';
    const field = file.fieldname; // 'logo' or 'coverImage'
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    cb(null, `company-${field}-${employerId}-${timestamp}-${randomSuffix}${ext}`);
  },
});

// File filter: JPG, JPEG, PNG, WebP only
const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    return cb(null, true);
  }

  const err = new Error('Invalid image format. Only JPG, JPEG, PNG, and WebP files are accepted.');
  err.code = 'INVALID_IMAGE_TYPE';
  return cb(err, false);
};

// Multer upload fields
const uploadCompanyImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Wrapper middleware to handle Multer errors safely
const handleCompanyUpload = (req, res, next) => {
  uploadCompanyImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image file size exceeds the 5 MB limit. Please upload an image under 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Image upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed. Allowed formats: JPG, PNG, WebP.',
      });
    }
    next();
  });
};

module.exports = {
  handleCompanyUpload,
};
