const db = require('../config/database')

class Meter {
  // Create a new meter
  static async create(meterData) {
    const { apartment_id, meter_serial_no, meter_type } = meterData

    const query = `
      INSERT INTO meters (apartment_id, meter_serial_no, meter_type)
      VALUES (?, ?, ?)
    `

    try {
      const [result] = await db.pool.execute(query, [
        apartment_id,
        meter_serial_no,
        meter_type,
      ])

      return {
        meter_id: result.insertId,
        ...meterData,
      }
    } catch (error) {
      throw error
    }
  }

  // Get all meters with pagination and filters
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      meter_type = '',
      apartment_id = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = filters

    const offset = (page - 1) * limit
    let query = `
      SELECT 
        m.*,
        a.apartment_no,
        a.floor_no
      FROM meters m
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      WHERE 1=1
    `
    const params = []

    // Search filter
    if (search) {
      query += ` AND (m.meter_serial_no LIKE ? OR a.apartment_no LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    // Meter type filter
    if (meter_type) {
      query += ` AND m.meter_type = ?`
      params.push(meter_type)
    }

    // Apartment filter
    if (apartment_id) {
      query += ` AND m.apartment_id = ?`
      params.push(apartment_id)
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT.*FROM/s,
      'SELECT COUNT(DISTINCT m.meter_id) as total FROM'
    )
    const [countResult] = await db.pool.execute(countQuery, params)
    const total = countResult[0].total

    // Add sorting and pagination
    const validSortColumns = ['created_at', 'meter_serial_no', 'meter_type', 'apartment_no']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`
    params.push(parseInt(limit), parseInt(offset))

    const [meters] = await db.pool.execute(query, params)

    return {
      meters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Get meter by ID
  static async findById(meterId) {
    const query = `
      SELECT 
        m.*,
        a.apartment_no,
        a.floor_no
      FROM meters m
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      WHERE m.meter_id = ?
    `

    const [meters] = await db.pool.execute(query, [meterId])
    return meters[0]
  }

  // Update meter
  static async update(meterId, meterData) {
    const { apartment_id, meter_serial_no, meter_type } = meterData

    const query = `
      UPDATE meters
      SET apartment_id = ?,
          meter_serial_no = ?,
          meter_type = ?
      WHERE meter_id = ?
    `

    try {
      await db.pool.execute(query, [
        apartment_id,
        meter_serial_no,
        meter_type,
        meterId,
      ])

      return await Meter.findById(meterId)
    } catch (error) {
      throw error
    }
  }

  // Delete meter
  static async delete(meterId) {
    const query = 'DELETE FROM meters WHERE meter_id = ?'
    const [result] = await db.pool.execute(query, [meterId])
    return result.affectedRows > 0
  }

  // Get meters by apartment
  static async findByApartment(apartmentId) {
    const query = `
      SELECT 
        m.*,
        a.apartment_no,
        a.floor_no
      FROM meters m
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      WHERE m.apartment_id = ?
      ORDER BY m.meter_type ASC
    `

    const [meters] = await db.pool.execute(query, [apartmentId])
    return meters
  }

  // Get meter statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_meters,
        SUM(CASE WHEN meter_type = 1 THEN 1 ELSE 0 END) as wapda_meters,
        SUM(CASE WHEN meter_type = 2 THEN 1 ELSE 0 END) as generator_meters,
        SUM(CASE WHEN meter_type = 3 THEN 1 ELSE 0 END) as water_meters
      FROM meters
    `

    const [stats] = await db.pool.execute(query)
    return stats[0]
  }
}

module.exports = Meter

