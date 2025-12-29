const db = require('../config/database')
const OwnerPayout = require('../models/OwnerPayout')
const OwnerPayoutItem = require('../models/OwnerPayoutItem')

// Generate payouts for a given month (rent-only)
exports.generatePayouts = async (req, res) => {
  try {
    const { month } = req.query
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'month is required in YYYY-MM format' })
    }

    const created_by = req.user.user_id

    // Fetch ALL bills for the month (not just paid ones)
    const billsSql = `
      SELECT mb.monthly_bill_id, mb.contract_id, mb.is_bill_paid
      FROM monthly_bills mb
      WHERE DATE_FORMAT(mb.bill_issue_date, '%Y-%m') = ?
    `
    const [bills] = await db.pool.execute(billsSql, [month])

    if (bills.length === 0) {
      return res.status(200).json({ success: true, message: 'No bills for this month', data: { payouts: [] } })
    }

    // Build rent shares per owner from contract_apartment_charges + apartments.owner_id
    const ownerShares = new Map() // owner_id -> { totalRent, hasPending }
    const payoutItems = []

    for (const bill of bills) {
      const chargesSql = `
        SELECT cac.apartment_id, cac.rent, a.owner_id
        FROM contract_apartment_charges cac
        JOIN apartments a ON a.apartment_id = cac.apartment_id
        WHERE cac.contract_id = ? AND cac.is_active = 1 AND a.owner_id IS NOT NULL
      `
      const [rows] = await db.pool.execute(chargesSql, [bill.contract_id])
      for (const row of rows) {
        const rent = parseFloat(row.rent || 0)
        const ownerId = row.owner_id
        if (!ownerShares.has(ownerId)) {
          ownerShares.set(ownerId, { totalRent: 0, hasPending: false })
        }
        const ownerData = ownerShares.get(ownerId)
        ownerData.totalRent += rent
        // If any bill is unpaid, mark owner payout as having pending bills
        if (!bill.is_bill_paid) {
          ownerData.hasPending = true
        }
        ownerShares.set(ownerId, ownerData)
        payoutItems.push({ 
          monthly_bill_id: bill.monthly_bill_id, 
          contract_id: bill.contract_id, 
          apartment_id: row.apartment_id, 
          owner_id: ownerId, 
          rent_share: rent 
        })
      }
    }

    // Create payouts per owner
    const createdPayouts = []
    for (const [owner_id, ownerData] of ownerShares.entries()) {
      // Status: "pending" if any bill unpaid, "cleared" if all bills paid
      const status = ownerData.hasPending ? 'pending' : 'cleared'
      
      const payout = await OwnerPayout.createPayout({
        owner_id,
        period_month: month,
        total_rent_collected: ownerData.totalRent.toFixed(2),
        payout_amount: ownerData.totalRent.toFixed(2),
        status: status,
        payout_date: null,
        notes: status === 'pending' ? 'Waiting for bill payment' : 'Ready for payout',
        created_by,
      })
      createdPayouts.push({ owner_payout_id: payout.owner_payout_id, owner_id, total_rent_collected: ownerData.totalRent, status })

      // Attach items to this payout
      const itemsForOwner = payoutItems
        .filter(i => i.owner_id === owner_id)
        .map(i => ({ owner_payout_id: payout.owner_payout_id, monthly_bill_id: i.monthly_bill_id, contract_id: i.contract_id, apartment_id: i.apartment_id, rent_share: i.rent_share }))
      await OwnerPayoutItem.createMany(itemsForOwner)
    }

    res.status(201).json({ success: true, message: `Generated ${createdPayouts.length} payouts for ${month}`, data: { payouts: createdPayouts } })
  } catch (error) {
    console.error('Error generating payouts:', error)
    res.status(500).json({ success: false, message: 'Failed to generate payouts', error: error.message })
  }
}

exports.listPayouts = async (req, res) => {
  try {
    const { month } = req.query
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'month is required in YYYY-MM format' })
    }
    const rows = await OwnerPayout.findByMonth(month)
    // Normalize status for legacy/null values
    const payouts = rows.map(r => ({
      ...r,
      status: r.status && r.status.trim() !== '' ? r.status : 'cleared',
      notes: r.notes || (r.status && r.status.trim() === 'pending' ? 'Waiting for bill payment' : 'Ready for payout'),
    }))
    res.json({ success: true, data: { payouts } })
  } catch (error) {
    console.error('Error listing payouts:', error)
    res.status(500).json({ success: false, message: 'Failed to list payouts', error: error.message })
  }
}

exports.getPayoutItems = async (req, res) => {
  try {
    const { id } = req.params
    const items = await OwnerPayoutItem.findByPayout(id)
    res.json({ success: true, data: { items } })
  } catch (error) {
    console.error('Error fetching payout items:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch payout items', error: error.message })
  }
}

exports.markPayoutPaid = async (req, res) => {
  try {
    const { id } = req.params
    const { payout_date = null } = req.body
    const updated_by = req.user.user_id
    const updated = await OwnerPayout.markPaid(id, { payout_date, updated_by })
    res.json({ success: true, message: 'Payout marked as paid', data: { payout: updated } })
  } catch (error) {
    console.error('Error marking payout paid:', error)
    res.status(500).json({ success: false, message: 'Failed to mark payout paid', error: error.message })
  }
}
