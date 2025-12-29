const db = require('../config/database')

class OwnerPayout {
  static async createPayout({ owner_id, period_month, total_rent_collected, payout_amount, status = 'pending', payout_date = null, notes = null, created_by = null }) {
    const sql = `
      INSERT INTO owner_payouts (
        owner_id,
        period_month,
        total_rent_collected,
        payout_amount,
        status,
        payout_date,
        notes,
        created_at,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `

    const [result] = await db.pool.execute(sql, [
      owner_id,
      period_month,
      total_rent_collected,
      payout_amount,
      status,
      payout_date,
      notes,
      created_by,
    ])

    return { owner_payout_id: result.insertId }
  }

  static async markPaid(owner_payout_id, { payout_date = null, updated_by = null }) {
    const sql = `
      UPDATE owner_payouts
      SET status = 'paid',
          payout_date = ?,
          updated_by = ?,
          updated_at = NOW()
      WHERE owner_payout_id = ?
    `
    await db.pool.execute(sql, [payout_date, updated_by, owner_payout_id])
    return await OwnerPayout.findById(owner_payout_id)
  }

  static async findByMonth(period_month) {
    const sql = `
      SELECT op.*, o.full_name as owner_name
      FROM owner_payouts op
      JOIN owners o ON o.owner_id = op.owner_id
      WHERE op.period_month = ?
      ORDER BY op.owner_id ASC
    `
    const [rows] = await db.pool.execute(sql, [period_month])
    return rows
  }

  static async findById(owner_payout_id) {
    const sql = `
      SELECT * FROM owner_payouts WHERE owner_payout_id = ?
    `
    const [rows] = await db.pool.execute(sql, [owner_payout_id])
    return rows[0]
  }

  static async updateStatusForMonth(period_month) {
    // Check all bills for the month and update payout status accordingly
    const sql = `
      UPDATE owner_payouts op
      SET op.status = 'cleared',
          op.notes = 'All bills paid - Ready for payout',
          op.updated_at = NOW()
      WHERE op.period_month = ?
        AND op.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM owner_payout_items opi
          JOIN monthly_bills mb ON mb.monthly_bill_id = opi.monthly_bill_id
          WHERE opi.owner_payout_id = op.owner_payout_id
            AND mb.is_bill_paid = 0
        )
    `
    const [result] = await db.pool.execute(sql, [period_month])
    return result.affectedRows
  }
}

module.exports = OwnerPayout
