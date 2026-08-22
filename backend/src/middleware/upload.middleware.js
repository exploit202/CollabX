const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

/**
 * Middleware to handle multipart profile image upload cleanly.
 * Supports form fields: 'image', 'avatar', 'profileImage', or 'file'.
 */
const handleProfileImageUpload = (req, res, next) => {
  const uploadHandler = multerUpload.any();

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds limit of 5 MB.',
            error: {
              code: 'LIMIT_FILE_SIZE',
              message: 'File size exceeds limit of 5 MB.'
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
          error: {
            code: err.code,
            message: err.message
          }
        });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
          error: {
            code: err.code || 'INVALID_FILE_TYPE',
            message: err.message
          }
        });
      }
      return next(err);
    }

    const file = (req.files && req.files.length > 0) ? req.files[0] : req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
        error: {
          code: 'EMPTY_UPLOAD',
          message: 'No image file provided.'
        }
      });
    }

    req.file = file;
    next();
  });
};

module.exports = {
  handleProfileImageUpload
};
