const express = require('express')
const router = express.Router()
const monthlyBillController = require('../controllers/monthlyBillController')
const { authenticateToken } = require('../middleware/auth')
const {
  generateBillsValidation,
  updateBillValidation,
  billIdValidation,
  queryValidation,
  handleValidationErrors,
} = require('../middleware/monthlyBillValidation')

// All routes require authentication
router.use(authenticateToken)

// Get all bills with pagination and filters
router.get(
  '/',
  queryValidation,
  handleValidationErrors,
  monthlyBillController.getAllBills
)

// Get bill statistics
router.get('/stats', monthlyBillController.getBillStats)

// Check if bills exist for a month
router.get('/check-exists', monthlyBillController.checkBillsExist)

// Get bill by ID
router.get(
  '/:id',
  billIdValidation,
  handleValidationErrors,
  monthlyBillController.getBillById
)

// Generate bills for a month
router.post(
  '/generate',
  generateBillsValidation,
  handleValidationErrors,
  monthlyBillController.generateBills
)

// Update bill
router.put(
  '/:id',
  updateBillValidation,
  handleValidationErrors,
  monthlyBillController.updateBill
)

// Mark bill as paid
router.patch(
  '/:id/mark-paid',
  billIdValidation,
  handleValidationErrors,
  monthlyBillController.markBillAsPaid
)

// Record a payment for a bill
router.post(
  '/:id/payments',
  billIdValidation,
  handleValidationErrors,
  monthlyBillController.addPayment
)

// List payments for a bill
router.get(
  '/:id/payments',
  billIdValidation,
  handleValidationErrors,
  monthlyBillController.getPayments
)

// Delete bill
router.delete(
  '/:id',
  billIdValidation,
  handleValidationErrors,
  monthlyBillController.deleteBill
)

module.exports = router

