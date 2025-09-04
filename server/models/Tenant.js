const db = require('../config/database');

class Tenant {
  constructor(data) {
    this.tenant_id = data.tenant_id;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.updated_at = data.updated_at;
    this.updated_by = data.updated_by;
    this.full_name = data.full_name;
    this.cnic = data.cnic;
    this.mobile_no = data.mobile_no;
    this.phone_no = data.phone_no;
    this.photo = data.photo;
    this.cnic_photo = data.cnic_photo;
    this.is_active = data.is_active;
  }

  // Create a new tenant
  static async create(tenantData, createdBy) {
    try {
      const {
        full_name,
        cnic,
        mobile_no,
        phone_no,
        photo,
        cnic_photo,
        is_active = 1
      } = tenantData;

      // Ensure is_active is properly converted to integer
      const isActiveValue = is_active === true || is_active === 'true' || is_active === 1 ? 1 : 0;

      const sql = `
        INSERT INTO tenants (
          full_name, cnic, mobile_no, phone_no, photo, cnic_photo, 
          is_active, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        full_name,
        cnic,
        mobile_no || null,
        phone_no || null,
        photo || null,
        cnic_photo || null,
        isActiveValue,
        createdBy,
        createdBy
      ];
      
      const result = await db.query(sql, values);
      
      return {
        tenant_id: result.insertId,
        full_name,
        cnic,
        mobile_no,
        phone_no,
        photo,
        cnic_photo,
        is_active: isActiveValue,
        created_by: createdBy,
        updated_by: createdBy
      };
    } catch (error) {
      throw error;
    }
  }

  // Find tenant by ID
  static async findById(tenant_id) {
    try {
      const sql = 'SELECT * FROM tenants WHERE tenant_id = ?';
      const results = await db.query(sql, [tenant_id]);
      return results.length > 0 ? new Tenant(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find tenant by CNIC
  static async findByCnic(cnic) {
    try {
      const sql = 'SELECT * FROM tenants WHERE cnic = ?';
      const results = await db.query(sql, [cnic]);
      return results.length > 0 ? new Tenant(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all tenants with pagination
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        is_active = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      let whereClause = '';
      let values = [];

      // Build where clause
      const conditions = [];
      
      if (search) {
        conditions.push('(full_name LIKE ? OR cnic LIKE ? OR mobile_no LIKE ?)');
        const searchTerm = `%${search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      if (is_active !== null) {
        conditions.push('is_active = ?');
        values.push(is_active);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countSql = `SELECT COUNT(*) as total FROM tenants ${whereClause}`;
      const countResult = await db.query(countSql, values);
      const total = countResult[0].total;

      // Get paginated results
      const sql = `
        SELECT * FROM tenants 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      values.push(limit, offset);
      const results = await db.query(sql, values);
      
      return {
        tenants: results.map(tenant => new Tenant(tenant)),
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

  // Update tenant
  static async update(tenant_id, updateData, updatedBy) {
    try {
      const allowedFields = [
        'full_name', 'cnic', 'mobile_no', 'phone_no', 
        'photo', 'cnic_photo', 'is_active'
      ];
      
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          
          // Convert boolean is_active to integer
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
      values.push(updatedBy, tenant_id);

      const sql = `UPDATE tenants SET ${updates.join(', ')} WHERE tenant_id = ?`;
      
      await db.query(sql, values);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete tenant (soft delete by setting is_active to 0)
  static async delete(tenant_id, updatedBy) {
    try {
      const sql = `
        UPDATE tenants 
        SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE tenant_id = ?
      `;
      await db.query(sql, [updatedBy, tenant_id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Check if CNIC already exists (excluding current tenant for updates)
  static async cnicExists(cnic, excludeTenantId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM tenants WHERE cnic = ?';
      let values = [cnic];

      if (excludeTenantId) {
        sql += ' AND tenant_id != ?';
        values.push(excludeTenantId);
      }

      const results = await db.query(sql, values);
      return results[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get tenant statistics
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_tenants,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_tenants,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_tenants,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
        FROM tenants
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
      tenant_id: this.tenant_id,
      full_name: this.full_name,
      cnic: this.cnic,
      mobile_no: this.mobile_no,
      phone_no: this.phone_no,
      photo: this.photo,
      cnic_photo: this.cnic_photo,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by
    };
  }
}

module.exports = Tenant;
