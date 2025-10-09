const { body, param, query, validationResult } = require('express-validator')

// Validation rules for creating a meter reading
exports.createReadingValidation = [
  body('meter_id')
    .notEmpty()
    .withMessage('Meter ID is required')
    .isInt({ min: 1 })
    .withMessage('Meter ID must be a valid positive integer'),
  
  body('reading_date')
    .notEmpty()
    .withMessage('Reading date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),
  
  body('current_units')
    .notEmpty()
    .withMessage('Current units reading is required')
    .isNumeric()
    .withMessage('Current units must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Current units cannot be negative')
      }
      return true
    }),
  
  body('previous_month_reading')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Previous month reading must be a number')
    .custom((value) => {
      if (value !== null && parseFloat(value) < 0) {
        throw new Error('Previous month reading cannot be negative')
      }
      return true
    }),
]

// Validation rules for updating a meter reading
exports.updateReadingValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid reading ID'),
  
  body('reading_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),
  
  body('current_units')
    .optional()
    .isNumeric()
    .withMessage('Current units must be a number')
    .custom((value) => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Current units cannot be negative')
      }
      return true
    }),
]

// Validation rules for reading ID parameter
exports.readingIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid reading ID'),
]

// Validation rules for meter ID parameter
exports.meterIdValidation = [
  param('meterId')
    .isInt({ min: 1 })
    .withMessage('Invalid meter ID'),
]

// Validation rules for apartment ID parameter
exports.apartmentIdValidation = [
  param('apartmentId')
    .isInt({ min: 1 })
    .withMessage('Invalid apartment ID'),
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
    .isIn(['reading_date', 'current_units', 'unit_consumed', 'meter_serial_no', 'apartment_no'])
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

