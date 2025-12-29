const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateCNIC = (value) => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  if (!cnicRegex.test(value)) {
    throw new Error('CNIC must be in format XXXXX-XXXXXXX-X');
  }
  return true;
};

const validatePhoneNumber = (value) => {
  if (!value) return true;
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
    throw new Error('Please enter a valid Pakistani phone number');
  }
  return true;
};

const validateOwnerCreation = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  body('cnic')
    .trim()
    .notEmpty()
    .withMessage('CNIC is required')
    .custom(validateCNIC),
  body('phone_no')
    .optional()
    .trim()
    .custom(validatePhoneNumber),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  handleValidationErrors
];

const validateOwnerUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  body('cnic')
    .optional()
    .trim()
    .custom(validateCNIC),
  body('phone_no')
    .optional()
    .trim()
    .custom(validatePhoneNumber),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  handleValidationErrors
];

const validateGetOwner = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  handleValidationErrors
];

const validateGetOwners = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  query('is_active')
    .optional()
    .isIn(['0', '1', 'true', 'false'])
    .withMessage('is_active must be 0, 1, true, or false'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'full_name', 'cnic'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  handleValidationErrors
];

const validateDeleteOwner = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  handleValidationErrors
];

const validateAssignApartment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  body('apartment_id')
    .isInt({ min: 1 })
    .withMessage('apartment_id is required and must be a positive integer'),
  handleValidationErrors
];

const validateUnassignApartment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  body('apartment_id')
    .isInt({ min: 1 })
    .withMessage('apartment_id is required and must be a positive integer'),
  handleValidationErrors
];

const validateGetAvailableApartments = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Search term must not exceed 50 characters'),
  query('floor_no')
    .optional()
    .isInt({ min: 0 })
    .withMessage('floor_no must be a number'),
  handleValidationErrors
];

module.exports = {
  validateOwnerCreation,
  validateOwnerUpdate,
  validateGetOwner,
  validateGetOwners,
  validateDeleteOwner,
  validateAssignApartment,
  validateUnassignApartment,
  validateGetAvailableApartments,
  handleValidationErrors
};

