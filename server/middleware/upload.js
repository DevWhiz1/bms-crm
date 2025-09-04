const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  photos: 'uploads/tenants/photos',
  cnicPhotos: 'uploads/tenants/cnic-photos'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    if (file.fieldname === 'photo') {
      uploadPath = uploadDirs.photos;
    } else if (file.fieldname === 'cnic_photo') {
      uploadPath = uploadDirs.cnicPhotos;
    } else {
      return cb(new Error('Invalid field name'), false);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename by removing special characters and spaces
    const sanitizedName = name
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Maximum 2 files (photo and cnic_photo)
  },
  fileFilter: fileFilter
});

// Middleware for tenant image uploads
const uploadTenantImages = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cnic_photo', maxCount: 1 }
]);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files uploaded.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

  next(error);
};

// Helper function to delete file
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
  return false;
};

// Helper function to get file URL
const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

module.exports = {
  uploadTenantImages,
  handleUploadError,
  deleteFile,
  getFileUrl
};
