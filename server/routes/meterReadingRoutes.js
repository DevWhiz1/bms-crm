const express = require('express')
const router = express.Router()
const meterReadingController = require('../controllers/meterReadingController')
const { authenticateToken } = require('../middleware/auth')
const {
  createReadingValidation,
  updateReadingValidation,
  readingIdValidation,
  meterIdValidation,
  apartmentIdValidation,
  queryValidation,
  handleValidationErrors,
} = require('../middleware/meterReadingValidation')

// All routes require authentication
router.use(authenticateToken)

// Get all meter readings with pagination and filters
router.get(
  '/',
  queryValidation,
  handleValidationErrors,
  meterReadingController.getAllReadings
)

// Get meter reading statistics
router.get('/stats', meterReadingController.getReadingStats)

// Get consumption by meter type
router.get('/consumption-by-type', meterReadingController.getConsumptionByType)

// Check previous reading
router.get('/check-previous', meterReadingController.checkPreviousReading)

// Get readings by meter
router.get(
  '/meter/:meterId',
  meterIdValidation,
  handleValidationErrors,
  meterReadingController.getReadingsByMeter
)

// Get readings by apartment
router.get(
  '/apartment/:apartmentId',
  apartmentIdValidation,
  handleValidationErrors,
  meterReadingController.getReadingsByApartment
)

// Get reading by ID
router.get(
  '/:id',
  readingIdValidation,
  handleValidationErrors,
  meterReadingController.getReadingById
)

// Create a new meter reading
router.post(
  '/',
  createReadingValidation,
  handleValidationErrors,
  meterReadingController.createReading
)

// Update meter reading
router.put(
  '/:id',
  updateReadingValidation,
  handleValidationErrors,
  meterReadingController.updateReading
)

// Delete meter reading
router.delete(
  '/:id',
  readingIdValidation,
  handleValidationErrors,
  meterReadingController.deleteReading
)

module.exports = router

