const db = require('../config/database')

class OwnerPayoutItem {
  static async createMany(items) {
    if (!items || items.length === 0) return 0
    const sql = `
      INSERT INTO owner_payout_items (
        owner_payout_id,
        monthly_bill_id,
        contract_id,
        apartment_id,
        rent_share,
        created_at
      ) VALUES ?
    `
    const values = items.map(i => [
      i.owner_payout_id,
      i.monthly_bill_id,
      i.contract_id,
      i.apartment_id,
      i.rent_share,
      new Date(),
    ])
    const [result] = await db.pool.query(sql, [values])
    return result.affectedRows
  }

  static async findByPayout(owner_payout_id) {
    const sql = `
      SELECT opi.*, a.apartment_no
      FROM owner_payout_items opi
      JOIN apartments a ON a.apartment_id = opi.apartment_id
      WHERE opi.owner_payout_id = ?
      ORDER BY opi.monthly_bill_id ASC
    `
    const [rows] = await db.pool.execute(sql, [owner_payout_id])
    return rows
  }
}

module.exports = OwnerPayoutItem
