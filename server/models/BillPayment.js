const db = require('../config/database')

class BillPayment {
  static async create({ monthly_bill_id, amount_received, received_date, payment_method = null, reference_no = null, notes = null, received_by = null }) {
    const sql = `
      INSERT INTO bill_payments (
        monthly_bill_id,
        amount_received,
        received_date,
        payment_method,
        reference_no,
        notes,
        received_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await db.pool.execute(sql, [
      monthly_bill_id,
      amount_received,
      received_date,
      payment_method,
      reference_no,
      notes,
      received_by,
    ])

    return { bill_payment_id: result.insertId }
  }

  static async findByBill(monthly_bill_id) {
    const sql = `
      SELECT * FROM bill_payments
      WHERE monthly_bill_id = ?
      ORDER BY received_date DESC, created_at DESC
    `
    const [rows] = await db.pool.execute(sql, [monthly_bill_id])
    return rows
  }
}

module.exports = BillPayment
