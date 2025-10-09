const express = require('express')
const router = express.Router()
const meterController = require('../controllers/meterController')
const { authenticateToken } = require('../middleware/auth')
const {
  createMeterValidation,
  updateMeterValidation,
  meterIdValidation,
  queryValidation,
  handleValidationErrors,
} = require('../middleware/meterValidation')

// All routes require authentication
router.use(authenticateToken)

// Get all meters with pagination and filters
router.get(
  '/',
  queryValidation,
  handleValidationErrors,
  meterController.getAllMeters
)

// Get meter statistics
router.get('/stats', meterController.getMeterStats)

// Get meters by apartment
router.get(
  '/apartment/:apartmentId',
  meterController.getMetersByApartment
)

// Get meter by ID
router.get(
  '/:id',
  meterIdValidation,
  handleValidationErrors,
  meterController.getMeterById
)

// Create a new meter
router.post(
  '/',
  createMeterValidation,
  handleValidationErrors,
  meterController.createMeter
)

// Update meter
router.put(
  '/:id',
  updateMeterValidation,
  handleValidationErrors,
  meterController.updateMeter
)

// Delete meter
router.delete(
  '/:id',
  meterIdValidation,
  handleValidationErrors,
  meterController.deleteMeter
)

module.exports = router

