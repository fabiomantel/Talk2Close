const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
fs.ensureDirSync(uploadDir);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_AUDIO_TYPES?.split(',') || [
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'audio/mp4'
  ];

  console.log('🔍 File upload debug:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    allowedTypes: allowedTypes
  });

  console.log('🔍 File upload debug:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    allowedTypes: allowedTypes
  });

  // Check if it's an audio file by extension or mimetype
  const isAudioByExtension = /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.originalname);
  const isAudioByMimeType = allowedTypes.includes(file.mimetype);
  
  if (isAudioByMimeType || isAudioByExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024, // 500MB default (increased from 10MB)
    files: 1 // Only allow 1 file at a time
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File too large. Maximum size is 500MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: true,
        message: 'Too many files. Only one file allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: true,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: true,
      message: error.message
    });
  }

  next(error);
};

// Clean up uploaded files on error
const cleanupOnError = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.file) {
      fs.remove(req.file.path).catch(err => {
        console.error('Error cleaning up file:', err);
      });
    }
  });
  next();
};

module.exports = {
  upload,
  handleUploadError,
  cleanupOnError
}; 