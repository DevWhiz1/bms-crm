const db = require('../config/database');

class Contract {
  constructor(data) {
    this.contract_id = data.contract_id;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.updated_at = data.updated_at;
    this.updated_by = data.updated_by;
    this.rent = data.rent;
    this.service_charges = data.service_charges;
    this.security_fees = data.security_fees;
    this.contract_start_date = data.contract_start_date;
    this.contract_end_date = data.contract_end_date;
    this.is_active = data.is_active;
    this.tenant_name = data.tenant_name;
    this.tenant_cnic = data.tenant_cnic;
    this.tenant_mobile = data.tenant_mobile;
  }

  // Create a new contract
  static async create(contractData, createdBy) {
    try {
      const {
        rent,
        service_charges,
        security_fees,
        contract_start_date,
        contract_end_date,
        is_active = 1
      } = contractData;

      // Ensure is_active is properly converted to integer
      const isActiveValue = is_active === true || is_active === 'true' || is_active === 1 ? 1 : 0;

      const sql = `
        INSERT INTO contracts (
          rent, service_charges, security_fees, contract_start_date, 
          contract_end_date, is_active, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        rent,
        service_charges,
        security_fees,
        contract_start_date,
        contract_end_date,
        isActiveValue,
        createdBy,
        createdBy
      ];
      
      const result = await db.query(sql, values);
      
      return {
        contract_id: result.insertId,
        rent,
        service_charges,
        security_fees,
        contract_start_date,
        contract_end_date,
        is_active: isActiveValue,
        created_by: createdBy,
        updated_by: createdBy
      };
    } catch (error) {
      throw error;
    }
  }

  // Find contract by ID
  static async findById(contract_id) {
    try {
      const sql = 'SELECT * FROM contracts WHERE contract_id = ?';
      const results = await db.query(sql, [contract_id]);
      return results.length > 0 ? new Contract(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all contracts with pagination
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
        conditions.push('(c.rent LIKE ? OR c.service_charges LIKE ? OR c.security_fees LIKE ?)');
        const searchTerm = `%${search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      if (is_active !== null) {
        conditions.push('c.is_active = ?');
        values.push(is_active);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countSql = `SELECT COUNT(DISTINCT c.contract_id) as total FROM contracts c ${whereClause.replace('contracts', 'c')}`;
      const countResult = await db.query(countSql, values);
      const total = countResult[0].total;

      // Get paginated results with tenant information
      const sql = `
        SELECT 
          c.*,
          t.full_name as tenant_name,
          t.cnic as tenant_cnic,
          t.mobile_no as tenant_mobile
        FROM contracts c
        LEFT JOIN apartments_tenants at ON c.contract_id = at.contract_id AND at.is_active = 1
        LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
        ${whereClause.replace('contracts', 'c')}
        GROUP BY c.contract_id
        ORDER BY c.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      values.push(limit, offset);
      const results = await db.query(sql, values);
      
      return {
        contracts: results.map(contract => new Contract(contract)),
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

  // Update contract
  static async update(contract_id, updateData, updatedBy) {
    try {
      const allowedFields = [
        'rent', 'service_charges', 'security_fees', 
        'contract_start_date', 'contract_end_date', 'is_active'
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
      values.push(updatedBy, contract_id);

      const sql = `UPDATE contracts SET ${updates.join(', ')} WHERE contract_id = ?`;
      
      await db.query(sql, values);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete contract (soft delete by setting is_active to 0)
  static async delete(contract_id, updatedBy) {
    try {
      const sql = `
        UPDATE contracts 
        SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE contract_id = ?
      `;
      await db.query(sql, [updatedBy, contract_id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get contract statistics
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_contracts,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_contracts,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_contracts,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
        FROM contracts
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
      contract_id: this.contract_id,
      rent: this.rent,
      service_charges: this.service_charges,
      security_fees: this.security_fees,
      contract_start_date: this.contract_start_date,
      contract_end_date: this.contract_end_date,
      is_active: this.is_active,
      tenant_name: this.tenant_name,
      tenant_cnic: this.tenant_cnic,
      tenant_mobile: this.tenant_mobile,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by
    };
  }
}

module.exports = Contract;
