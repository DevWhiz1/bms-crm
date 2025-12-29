const db = require('../config/database');

class ApartmentTenant {
  constructor(data) {
    this.apartment_tenant_id = data.apartment_tenant_id;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.updated_at = data.updated_at;
    this.updated_by = data.updated_by;
    this.tenant_id = data.tenant_id;
    this.apartment_id = data.apartment_id;
    this.contract_id = data.contract_id;
    this.is_active = data.is_active;
  }

  // Create a new apartment-tenant relationship
  static async create(apartmentTenantData, createdBy) {
    try {
      const {
        tenant_id,
        apartment_id,
        contract_id,
        is_active = 1
      } = apartmentTenantData;

      // Ensure is_active is properly converted to integer
      const isActiveValue = is_active === true || is_active === 'true' || is_active === 1 ? 1 : 0;

      const sql = `
        INSERT INTO apartments_tenants (
          tenant_id, apartment_id, contract_id, is_active, 
          created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        tenant_id,
        apartment_id,
        contract_id,
        isActiveValue,
        createdBy,
        createdBy
      ];
      
      const result = await db.query(sql, values);
      
      return {
        apartment_tenant_id: result.insertId,
        tenant_id,
        apartment_id,
        contract_id,
        is_active: isActiveValue,
        created_by: createdBy,
        updated_by: createdBy
      };
    } catch (error) {
      throw error;
    }
  }

  // Create multiple apartment-tenant relationships
  static async createMultiple(apartmentTenantDataArray, createdBy) {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        const results = [];
        
        for (const data of apartmentTenantDataArray) {
          const result = await ApartmentTenant.create(data, createdBy);
          results.push(result);
        }

        await connection.commit();
        return results;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  // Check if an apartment is currently linked to an active contract
  static async isApartmentAvailable(apartment_id) {
    const sql = `
      SELECT COUNT(*) as active_count
      FROM apartments_tenants at
      JOIN contracts c ON c.contract_id = at.contract_id
      WHERE at.apartment_id = ?
        AND at.is_active = 1
        AND c.is_active = 1
        AND CURDATE() BETWEEN c.contract_start_date AND c.contract_end_date
    `;

    const [rows] = await db.pool.execute(sql, [apartment_id]);
    return (rows[0]?.active_count || 0) === 0;
  }

  // Find apartment-tenant relationship by ID
  static async findById(apartment_tenant_id) {
    try {
      const sql = 'SELECT * FROM apartments_tenants WHERE apartment_tenant_id = ?';
      const results = await db.query(sql, [apartment_tenant_id]);
      return results.length > 0 ? new ApartmentTenant(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all apartment-tenant relationships with pagination
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        is_active = null,
        tenant_id = null,
        apartment_id = null,
        contract_id = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      let whereClause = '';
      let values = [];

      // Build where clause
      const conditions = [];
      
      if (search) {
        conditions.push(`(
          EXISTS (SELECT 1 FROM tenants t WHERE t.tenant_id = apartments_tenants.tenant_id AND t.full_name LIKE ?) OR
          EXISTS (SELECT 1 FROM apartments a WHERE a.apartment_id = apartments_tenants.apartment_id AND a.apartment_no LIKE ?)
        )`);
        const searchTerm = `%${search}%`;
        values.push(searchTerm, searchTerm);
      }

      if (is_active !== null) {
        conditions.push('at.is_active = ?');
        values.push(is_active);
      }

      if (tenant_id !== null) {
        conditions.push('at.tenant_id = ?');
        values.push(tenant_id);
      }

      if (apartment_id !== null) {
        conditions.push('at.apartment_id = ?');
        values.push(apartment_id);
      }

      if (contract_id !== null) {
        conditions.push('at.contract_id = ?');
        values.push(contract_id);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countSql = `SELECT COUNT(*) as total FROM apartments_tenants at ${whereClause}`;
      const countResult = await db.query(countSql, values);
      const total = countResult[0].total;

      // Get paginated results with related data
      const sql = `
        SELECT 
          at.*,
          t.full_name as tenant_name,
          t.cnic as tenant_cnic,
          t.mobile_no as tenant_mobile,
          a.apartment_no,
          a.floor_no,
          c.rent,
          c.service_charges,
          c.security_fees,
          c.contract_start_date,
          c.contract_end_date
        FROM apartments_tenants at
        LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
        LEFT JOIN apartments a ON at.apartment_id = a.apartment_id
        LEFT JOIN contracts c ON at.contract_id = c.contract_id
        ${whereClause}
        ORDER BY at.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      values.push(limit, offset);
      const results = await db.query(sql, values);
      
      return {
        apartment_tenants: results.map(record => ({
          apartment_tenant_id: record.apartment_tenant_id,
          tenant_id: record.tenant_id,
          apartment_id: record.apartment_id,
          contract_id: record.contract_id,
          is_active: record.is_active,
          created_at: record.created_at,
          updated_at: record.updated_at,
          created_by: record.created_by,
          updated_by: record.updated_by,
          tenant_name: record.tenant_name,
          tenant_cnic: record.tenant_cnic,
          tenant_mobile: record.tenant_mobile,
          apartment_no: record.apartment_no,
          floor_no: record.floor_no,
          rent: record.rent,
          service_charges: record.service_charges,
          security_fees: record.security_fees,
          contract_start_date: record.contract_start_date,
          contract_end_date: record.contract_end_date
        })),
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

  // Update apartment-tenant relationship
  static async update(apartment_tenant_id, updateData, updatedBy) {
    try {
      const allowedFields = ['tenant_id', 'apartment_id', 'contract_id', 'is_active'];
      
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
      values.push(updatedBy, apartment_tenant_id);

      const sql = `UPDATE apartments_tenants SET ${updates.join(', ')} WHERE apartment_tenant_id = ?`;
      
      await db.query(sql, values);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete apartment-tenant relationship (soft delete by setting is_active to 0)
  static async delete(apartment_tenant_id, updatedBy) {
    try {
      const sql = `
        UPDATE apartments_tenants 
        SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE apartment_tenant_id = ?
      `;
      await db.query(sql, [updatedBy, apartment_tenant_id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get apartment-tenant statistics
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_relationships,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_relationships,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_relationships,
          COUNT(DISTINCT tenant_id) as unique_tenants,
          COUNT(DISTINCT apartment_id) as unique_apartments,
          COUNT(DISTINCT contract_id) as unique_contracts
        FROM apartments_tenants
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
      apartment_tenant_id: this.apartment_tenant_id,
      tenant_id: this.tenant_id,
      apartment_id: this.apartment_id,
      contract_id: this.contract_id,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by
    };
  }
}

module.exports = ApartmentTenant;
