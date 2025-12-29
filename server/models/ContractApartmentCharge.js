const db = require('../config/database')

class ContractApartmentCharge {
  constructor(data) {
    this.contract_apartment_charge_id = data.contract_apartment_charge_id
    this.contract_id = data.contract_id
    this.apartment_id = data.apartment_id
    this.rent = data.rent
    this.service_charges = data.service_charges
    this.security_fees = data.security_fees
    this.is_active = data.is_active
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.created_by = data.created_by
    this.updated_by = data.updated_by
  }

  static async createMany(charges, userId) {
    if (!Array.isArray(charges) || charges.length === 0) return []

    const values = charges.map((c) => [
      c.contract_id,
      c.apartment_id,
      c.rent,
      c.service_charges,
      c.security_fees,
      1,
      userId,
      userId,
    ])

    const sql = `
      INSERT INTO contract_apartment_charges
        (contract_id, apartment_id, rent, service_charges, security_fees, is_active, created_by, updated_by)
      VALUES ?
    `

    const [result] = await db.pool.query(sql, [values])
    return result
  }

  static async deactivateByContract(contractId, userId) {
    const sql = `
      UPDATE contract_apartment_charges
      SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE contract_id = ?
    `
    await db.pool.execute(sql, [userId, contractId])
  }

  static async findByContract(contractId, { onlyActive = true } = {}) {
    const sql = `
      SELECT *
      FROM contract_apartment_charges
      WHERE contract_id = ?
      ${onlyActive ? 'AND is_active = 1' : ''}
    `
    const [rows] = await db.pool.execute(sql, [contractId])
    return rows.map((row) => new ContractApartmentCharge(row))
  }
}

module.exports = ContractApartmentCharge

