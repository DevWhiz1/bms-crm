const express = require('express')
const router = express.Router()
const invoiceController = require('../controllers/invoiceController')
const { authenticateToken } = require('../middleware/auth')

// All routes require authentication
router.use(authenticateToken)

// Get detailed invoice data for a specific bill
router.get('/:billId', invoiceController.getInvoiceDetails)

// Generate PDF for invoice (placeholder for future implementation)
router.get('/:billId/pdf', invoiceController.generateInvoicePDF)

module.exports = router
