const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const ownerPayoutController = require('../controllers/ownerPayoutController')

// All routes require authentication
router.use(authenticateToken)

// Generate payouts for a month
router.post('/generate', ownerPayoutController.generatePayouts)

// List payouts for a month
router.get('/', ownerPayoutController.listPayouts)

// Get items of a payout
router.get('/:id/items', ownerPayoutController.getPayoutItems)

// Mark payout as paid
router.patch('/:id/mark-paid', ownerPayoutController.markPayoutPaid)

module.exports = router
