const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Contract creation validation
const validateContractCreation = [
  body('rent')
    .notEmpty()
    .withMessage('Rent is required')
    .isLength({ max: 100 })
    .withMessage('Rent must not exceed 100 characters'),
  
  body('service_charges')
    .notEmpty()
    .withMessage('Service charges are required')
    .isLength({ max: 100 })
    .withMessage('Service charges must not exceed 100 characters'),
  
  body('security_fees')
    .notEmpty()
    .withMessage('Security fees are required')
    .isLength({ max: 100 })
    .withMessage('Security fees must not exceed 100 characters'),
  
  body('contract_start_date')
    .notEmpty()
    .withMessage('Contract start date is required')
    .isISO8601()
    .withMessage('Contract start date must be a valid date'),
  
  body('contract_end_date')
    .notEmpty()
    .withMessage('Contract end date is required')
    .isISO8601()
    .withMessage('Contract end date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.contract_start_date)) {
        throw new Error('Contract end date must be after start date');
      }
      return true;
    }),
  
  body('tenant_id')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer'),
  
  body('apartments')
    .isArray({ min: 1 })
    .withMessage('At least one apartment must be selected')
    .custom((apartments) => {
      if (!apartments.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('All apartment IDs must be positive integers');
      }
      return true;
    }),

  body('apartment_charges')
    .isArray({ min: 1 })
    .withMessage('Apartment charges are required')
    .custom((charges, { req }) => {
      if (!Array.isArray(charges)) {
        throw new Error('Apartment charges must be an array');
      }
      for (const charge of charges) {
        if (!charge.apartment_id || !Number.isInteger(charge.apartment_id)) {
          throw new Error('apartment_id must be a positive integer');
        }
        if (!charge.rent || !charge.service_charges || !charge.security_fees) {
          throw new Error('rent, service_charges, and security_fees are required for each apartment');
        }
      }
      if (req.body.apartments && charges.length !== req.body.apartments.length) {
        throw new Error('Apartment charges count must match selected apartments');
      }
      return true;
    }),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  handleValidationErrors
];

// Contract update validation
const validateContractUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contract ID must be a positive integer'),
  
  body('rent')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Rent must not exceed 100 characters'),
  
  body('service_charges')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Service charges must not exceed 100 characters'),
  
  body('security_fees')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Security fees must not exceed 100 characters'),
  
  body('contract_start_date')
    .optional()
    .isISO8601()
    .withMessage('Contract start date must be a valid date'),
  
  body('contract_end_date')
    .optional()
    .isISO8601()
    .withMessage('Contract end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.contract_start_date && new Date(value) <= new Date(req.body.contract_start_date)) {
        throw new Error('Contract end date must be after start date');
      }
      return true;
    }),
  
  body('tenant_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer'),
  
  body('apartments')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one apartment must be selected')
    .custom((apartments) => {
      if (apartments && !apartments.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('All apartment IDs must be positive integers');
      }
      return true;
    }),

  body('apartment_charges')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Apartment charges must be an array')
    .custom((charges, { req }) => {
      if (!charges) return true;
      for (const charge of charges) {
        if (!charge.apartment_id || !Number.isInteger(charge.apartment_id)) {
          throw new Error('apartment_id must be a positive integer');
        }
        if (!charge.rent || !charge.service_charges || !charge.security_fees) {
          throw new Error('rent, service_charges, and security_fees are required for each apartment');
        }
      }
      if (req.body.apartments && charges.length !== req.body.apartments.length) {
        throw new Error('Apartment charges count must match selected apartments');
      }
      return true;
    }),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  handleValidationErrors
];

// Get contract validation
const validateGetContract = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contract ID must be a positive integer'),
  
  handleValidationErrors
];

// Get contracts validation
const validateGetContracts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'contract_start_date', 'contract_end_date', 'rent'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  handleValidationErrors
];

// Delete contract validation
const validateDeleteContract = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contract ID must be a positive integer'),
  
  handleValidationErrors
];

module.exports = {
  validateContractCreation,
  validateContractUpdate,
  validateGetContract,
  validateGetContracts,
  validateDeleteContract
};
