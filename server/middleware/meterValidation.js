const { body, param, query, validationResult } = require('express-validator')

// Validation rules for creating a meter
exports.createMeterValidation = [
  body('apartment_id')
    .notEmpty()
    .withMessage('Apartment ID is required')
    .isInt({ min: 1 })
    .withMessage('Apartment ID must be a valid positive integer'),
  
  body('meter_serial_no')
    .notEmpty()
    .withMessage('Meter serial number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Meter serial number must be between 1 and 50 characters')
    .trim(),
  
  body('meter_type')
    .notEmpty()
    .withMessage('Meter type is required')
    .isInt({ min: 1, max: 3 })
    .withMessage('Meter type must be 1 (Wapda), 2 (Generator), or 3 (Water)'),
]

// Validation rules for updating a meter
exports.updateMeterValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid meter ID'),
  
  body('apartment_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Apartment ID must be a valid positive integer'),
  
  body('meter_serial_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Meter serial number must be between 1 and 50 characters')
    .trim(),
  
  body('meter_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Meter type must be 1 (Wapda), 2 (Generator), or 3 (Water)'),
]

// Validation rules for meter ID parameter
exports.meterIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid meter ID'),
]

// Validation rules for query parameters
exports.queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('meter_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Meter type must be 1 (Wapda), 2 (Generator), or 3 (Water)'),
  
  query('sortBy')
    .optional()
    .isIn(['created_at', 'meter_serial_no', 'meter_type', 'apartment_no'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
]

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    })
  }
  next()
}

