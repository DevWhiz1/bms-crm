const { body, param, query, validationResult } = require('express-validator')

// Validation rules for generating monthly bills
exports.generateBillsValidation = [
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in format YYYY-MM (e.g., 2025-10)'),
  
  body('wapda_per_unit_rate')
    .notEmpty()
    .withMessage('WAPDA per unit rate is required')
    .isNumeric()
    .withMessage('WAPDA rate must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('WAPDA rate cannot be negative')
      }
      return true
    }),
  
  body('generator_per_unit_rate')
    .notEmpty()
    .withMessage('Generator per unit rate is required')
    .isNumeric()
    .withMessage('Generator rate must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Generator rate cannot be negative')
      }
      return true
    }),
  
  body('water_per_unit_rate')
    .notEmpty()
    .withMessage('Water per unit rate is required')
    .isNumeric()
    .withMessage('Water rate must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Water rate cannot be negative')
      }
      return true
    }),
  
  body('bill_issue_date')
    .notEmpty()
    .withMessage('Bill issue date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),
  
  body('bill_due_date')
    .notEmpty()
    .withMessage('Bill due date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.bill_issue_date)) {
        throw new Error('Due date must be after issue date')
      }
      return true
    }),
]

// Validation rules for updating a bill
exports.updateBillValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid bill ID'),
  
  body('additional_charges')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Additional charges must be a number'),
  
  body('bill_due_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),
  
  body('is_bill_paid')
    .optional()
    .isBoolean()
    .withMessage('Payment status must be boolean'),
]

// Validation rules for bill ID parameter
exports.billIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid bill ID'),
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
  
  query('is_paid')
    .optional()
    .isIn(['0', '1', 'true', 'false'])
    .withMessage('Payment status must be 0, 1, true, or false'),
  
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in format YYYY-MM'),
  
  query('sortBy')
    .optional()
    .isIn(['bill_issue_date', 'bill_due_date', 'total_amount', 'tenant_name'])
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

