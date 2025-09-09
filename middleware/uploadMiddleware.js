import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage with security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Create secure filename with timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Sanitize filename to prevent path traversal attacks
    const sanitizedOriginalName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .substring(0, 50); // Limit length
    
    cb(null, `image-${timestamp}-${randomSuffix}${ext}`);
  }
});

// Enhanced file filter with security
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Only ${config.ALLOWED_FILE_TYPES.join(', ')} files are allowed!`), false);
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error(`Only ${allowedExtensions.join(', ')} extensions are allowed!`), false);
  }
  
  // Check for potential security issues
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename detected!'), false);
  }
  
  cb(null, true);
};

// Create the multer upload instance with security limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // Use config value
    files: 1, // Only allow 1 file per request
    fieldSize: 1024 * 1024 // 1MB max field size
  }
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file is allowed per request'
      });
    }
    if (error.code === 'LIMIT_FIELD_SIZE') {
      return res.status(400).json({
        error: 'Field too large',
        message: 'Field size must be less than 1MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
};

export default upload;