const db = require('../config/database');

class ApartmentOwner {
  constructor(data) {
    this.apartment_owner_id = data.apartment_owner_id;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.updated_at = data.updated_at;
    this.updated_by = data.updated_by;
    this.owner_id = data.owner_id;
    this.apartment_id = data.apartment_id;
    this.is_active = data.is_active;
  }

  static async create(apartmentOwnerData, createdBy) {
    const {
      owner_id,
      apartment_id,
      is_active = 1
    } = apartmentOwnerData;

    const isActiveValue = is_active === true || is_active === 'true' || is_active === 1 ? 1 : 0;

    const sql = `
      INSERT INTO apartments_owners (
        owner_id, apartment_id, is_active, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      owner_id,
      apartment_id,
      isActiveValue,
      createdBy,
      createdBy
    ];

    const result = await db.query(sql, values);

    return {
      apartment_owner_id: result.insertId,
      owner_id,
      apartment_id,
      is_active: isActiveValue,
      created_by: createdBy,
      updated_by: createdBy
    };
  }

  static async deactivateByApartment(apartment_id, updatedBy) {
    const sql = `
      UPDATE apartments_owners
      SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE apartment_id = ?
    `;
    await db.query(sql, [updatedBy, apartment_id]);
    return true;
  }

  static async findActiveByApartment(apartment_id) {
    const sql = `
      SELECT * FROM apartments_owners
      WHERE apartment_id = ? AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const results = await db.query(sql, [apartment_id]);
    return results.length > 0 ? new ApartmentOwner(results[0]) : null;
  }
}

module.exports = ApartmentOwner;


