const db = require('../config/database');

class Owner {
  constructor(data) {
    this.owner_id = data.owner_id;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.updated_at = data.updated_at;
    this.updated_by = data.updated_by;
    this.full_name = data.full_name;
    this.cnic = data.cnic;
    this.phone_no = data.phone_no;
    this.photo = data.photo;
    this.cnic_photo = data.cnic_photo;
    this.is_active = data.is_active;
    this.apartments_count = data.apartments_count || 0;
  }

  static async create(ownerData, createdBy) {
    const {
      full_name,
      cnic,
      phone_no,
      photo,
      cnic_photo,
      is_active = 1
    } = ownerData;

    const isActiveValue = is_active === true || is_active === 'true' || is_active === 1 ? 1 : 0;

    const sql = `
      INSERT INTO owners (
        full_name, cnic, phone_no, photo, cnic_photo,
        is_active, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      full_name,
      cnic,
      phone_no || null,
      photo || null,
      cnic_photo || null,
      isActiveValue,
      createdBy,
      createdBy
    ];

    const result = await db.query(sql, values);

    return {
      owner_id: result.insertId,
      full_name,
      cnic,
      phone_no,
      photo,
      cnic_photo,
      is_active: isActiveValue,
      created_by: createdBy,
      updated_by: createdBy
    };
  }

  static async findById(owner_id) {
    const sql = 'SELECT * FROM owners WHERE owner_id = ?';
    const results = await db.query(sql, [owner_id]);
    return results.length > 0 ? new Owner(results[0]) : null;
  }

  static async findByCnic(cnic) {
    const sql = 'SELECT * FROM owners WHERE cnic = ?';
    const results = await db.query(sql, [cnic]);
    return results.length > 0 ? new Owner(results[0]) : null;
  }

  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      is_active = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const values = [];
    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push('(full_name LIKE ? OR cnic LIKE ? OR phone_no LIKE ?)');
      values.push(searchTerm, searchTerm, searchTerm);
    }

    if (is_active !== null) {
      conditions.push('is_active = ?');
      values.push(is_active);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM owners ${whereClause}`;
    const countResult = await db.query(countSql, values);
    const total = countResult[0].total;

    const sql = `
      SELECT o.*, COUNT(a.apartment_id) as apartments_count
      FROM owners o
      LEFT JOIN apartments a ON a.owner_id = o.owner_id
      ${whereClause}
      GROUP BY o.owner_id
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    values.push(limit, offset);
    const results = await db.query(sql, values);

    return {
      owners: results.map(record => new Owner(record)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(owner_id, updateData, updatedBy) {
    const allowedFields = ['full_name', 'cnic', 'phone_no', 'photo', 'cnic_photo', 'is_active'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        if (key === 'is_active') {
          values.push(value === true || value === 'true' || value === 1 ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_by = ?', 'updated_at = CURRENT_TIMESTAMP');
    values.push(updatedBy, owner_id);

    const sql = `UPDATE owners SET ${updates.join(', ')} WHERE owner_id = ?`;
    await db.query(sql, values);
    return true;
  }

  static async delete(owner_id, updatedBy) {
    const sql = `
      UPDATE owners
      SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE owner_id = ?
    `;
    await db.query(sql, [updatedBy, owner_id]);
    return true;
  }

  static async cnicExists(cnic, excludeOwnerId = null) {
    let sql = 'SELECT COUNT(*) as count FROM owners WHERE cnic = ?';
    const values = [cnic];

    if (excludeOwnerId) {
      sql += ' AND owner_id != ?';
      values.push(excludeOwnerId);
    }

    const result = await db.query(sql, values);
    return result[0].count > 0;
  }

  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total_owners,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_owners,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_owners
      FROM owners
    `;

    const results = await db.query(sql);
    return results[0];
  }

  toJSON() {
    return {
      owner_id: this.owner_id,
      full_name: this.full_name,
      cnic: this.cnic,
      phone_no: this.phone_no,
      photo: this.photo,
      cnic_photo: this.cnic_photo,
      is_active: this.is_active,
      created_at: this.created_at,
      created_by: this.created_by,
      updated_at: this.updated_at,
      updated_by: this.updated_by,
      apartments_count: this.apartments_count
    };
  }
}

module.exports = Owner;

