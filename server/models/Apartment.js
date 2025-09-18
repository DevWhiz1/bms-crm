const db = require('../config/database');

class Apartment {
  constructor(data) {
    this.apartment_id = data.apartment_id;
    this.apartment_no = data.apartment_no;
    this.floor_no = data.floor_no;
  }

  // Create a new apartment
  static async create(apartmentData) {
    try {
      const { apartment_no, floor_no } = apartmentData;

      const sql = `
        INSERT INTO apartments (apartment_no, floor_no) 
        VALUES (?, ?)
      `;
      
      const values = [apartment_no, floor_no];
      
      const result = await db.query(sql, values);
      
      return {
        apartment_id: result.insertId,
        apartment_no,
        floor_no
      };
    } catch (error) {
      throw error;
    }
  }

  // Find apartment by ID
  static async findById(apartment_id) {
    try {
      const sql = 'SELECT * FROM apartments WHERE apartment_id = ?';
      const results = await db.query(sql, [apartment_id]);
      return results.length > 0 ? new Apartment(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all apartments
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 100,
        search = '',
        floor_no = null,
        sortBy = 'floor_no',
        sortOrder = 'ASC'
      } = options;

      const offset = (page - 1) * limit;
      let whereClause = '';
      let values = [];

      // Build where clause
      const conditions = [];
      
      if (search) {
        conditions.push('(apartment_no LIKE ?)');
        const searchTerm = `%${search}%`;
        values.push(searchTerm);
      }

      if (floor_no !== null) {
        conditions.push('floor_no = ?');
        values.push(floor_no);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countSql = `SELECT COUNT(*) as total FROM apartments ${whereClause}`;
      const countResult = await db.query(countSql, values);
      const total = countResult[0].total;

      // Get paginated results
      const sql = `
        SELECT * FROM apartments 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      values.push(limit, offset);
      const results = await db.query(sql, values);
      
      return {
        apartments: results.map(apartment => new Apartment(apartment)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update apartment
  static async update(apartment_id, updateData) {
    try {
      const allowedFields = ['apartment_no', 'floor_no'];
      
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(apartment_id);

      const sql = `UPDATE apartments SET ${updates.join(', ')} WHERE apartment_id = ?`;
      
      await db.query(sql, values);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete apartment
  static async delete(apartment_id) {
    try {
      const sql = 'DELETE FROM apartments WHERE apartment_id = ?';
      await db.query(sql, [apartment_id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get apartments grouped by floor
  static async getByFloor() {
    try {
      const sql = `
        SELECT 
          floor_no,
          GROUP_CONCAT(apartment_no ORDER BY apartment_no ASC) as apartments,
          COUNT(*) as apartment_count
        FROM apartments 
        GROUP BY floor_no 
        ORDER BY floor_no ASC
      `;
      
      const results = await db.query(sql);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Get apartment statistics
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_apartments,
          COUNT(DISTINCT floor_no) as total_floors,
          MIN(floor_no) as min_floor,
          MAX(floor_no) as max_floor
        FROM apartments
      `;
      
      const results = await db.query(sql);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user data without sensitive information
  toJSON() {
    return {
      apartment_id: this.apartment_id,
      apartment_no: this.apartment_no,
      floor_no: this.floor_no
    };
  }
}

module.exports = Apartment;
