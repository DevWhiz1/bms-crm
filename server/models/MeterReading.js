const db = require('../config/database')

class MeterReading {
  // Create a new meter reading
  static async create(readingData) {
    const {
      meter_id,
      reading_date,
      current_units,
      previous_month_reading = null,
      created_by,
    } = readingData

    try {
      // Get the previous reading for this meter
      const previousReading = await MeterReading.getPreviousReading(meter_id, reading_date)

      let unitConsumed = 0
      let previousUnits = 0

      if (previousReading) {
        // Use previous reading's current_units
        previousUnits = parseFloat(previousReading.current_units)
        unitConsumed = parseFloat(current_units) - previousUnits
      } else if (previous_month_reading !== null) {
        // First time entry with manual previous reading
        previousUnits = parseFloat(previous_month_reading)
        unitConsumed = parseFloat(current_units) - previousUnits
      } else {
        // No previous reading and no manual entry - set consumed to 0
        unitConsumed = parseFloat(current_units)
      }

      const query = `
        INSERT INTO meters_readings 
        (meter_id, reading_date, current_units, unit_consumed, created_by)
        VALUES (?, ?, ?, ?, ?)
      `

      const [result] = await db.pool.execute(query, [
        meter_id,
        reading_date,
        current_units,
        unitConsumed,
        created_by,
      ])

      return {
        meter_reading_id: result.insertId,
        meter_id,
        reading_date,
        current_units,
        unit_consumed: unitConsumed,
        previous_units: previousUnits,
        created_by,
      }
    } catch (error) {
      throw error
    }
  }

  // Get previous reading for a meter before a specific date
  static async getPreviousReading(meterId, readingDate) {
    const query = `
      SELECT *
      FROM meters_readings
      WHERE meter_id = ?
        AND reading_date < ?
      ORDER BY reading_date DESC
      LIMIT 1
    `

    const [readings] = await db.pool.execute(query, [meterId, readingDate])
    return readings[0] || null
  }

  // Check if previous reading exists
  static async hasPreviousReading(meterId, readingDate) {
    const previousReading = await MeterReading.getPreviousReading(meterId, readingDate)
    return !!previousReading
  }

  // Get all meter readings with pagination and filters
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      meter_id = '',
      apartment_id = '',
      meter_type = '',
      sortBy = 'reading_date',
      sortOrder = 'DESC',
    } = filters

    const offset = (page - 1) * limit
    let query = `
      SELECT 
        mr.*,
        m.meter_serial_no,
        m.meter_type,
        a.apartment_no,
        a.floor_no,
        u.full_name as created_by_name
      FROM meters_readings mr
      INNER JOIN meters m ON mr.meter_id = m.meter_id
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      WHERE 1=1
    `
    const params = []

    // Search filter
    if (search) {
      query += ` AND (m.meter_serial_no LIKE ? OR a.apartment_no LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    // Meter filter
    if (meter_id) {
      query += ` AND mr.meter_id = ?`
      params.push(meter_id)
    }

    // Apartment filter
    if (apartment_id) {
      query += ` AND m.apartment_id = ?`
      params.push(apartment_id)
    }

    // Meter type filter
    if (meter_type) {
      query += ` AND m.meter_type = ?`
      params.push(meter_type)
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT.*FROM/s,
      'SELECT COUNT(DISTINCT mr.meter_reading_id) as total FROM'
    )
    const [countResult] = await db.pool.execute(countQuery, params)
    const total = countResult[0].total

    // Add sorting and pagination
    const validSortColumns = ['reading_date', 'current_units', 'unit_consumed', 'meter_serial_no', 'apartment_no']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'reading_date'
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`
    params.push(parseInt(limit), parseInt(offset))

    const [readings] = await db.pool.execute(query, params)

    return {
      readings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Get reading by ID
  static async findById(readingId) {
    const query = `
      SELECT 
        mr.*,
        m.meter_serial_no,
        m.meter_type,
        a.apartment_no,
        a.floor_no,
        u.full_name as created_by_name
      FROM meters_readings mr
      INNER JOIN meters m ON mr.meter_id = m.meter_id
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      WHERE mr.meter_reading_id = ?
    `

    const [readings] = await db.pool.execute(query, [readingId])
    return readings[0]
  }

  // Update meter reading
  static async update(readingId, readingData) {
    const { reading_date, current_units, updated_by } = readingData

    // Get existing reading
    const existingReading = await MeterReading.findById(readingId)
    if (!existingReading) {
      throw new Error('Reading not found')
    }

    // Recalculate unit consumed
    const previousReading = await MeterReading.getPreviousReading(
      existingReading.meter_id,
      reading_date
    )

    let unitConsumed = 0
    if (previousReading) {
      unitConsumed = parseFloat(current_units) - parseFloat(previousReading.current_units)
    } else {
      unitConsumed = parseFloat(current_units)
    }

    const query = `
      UPDATE meters_readings
      SET reading_date = ?,
          current_units = ?,
          unit_consumed = ?,
          updated_by = ?
      WHERE meter_reading_id = ?
    `

    try {
      await db.pool.execute(query, [
        reading_date,
        current_units,
        unitConsumed,
        updated_by,
        readingId,
      ])

      return await MeterReading.findById(readingId)
    } catch (error) {
      throw error
    }
  }

  // Delete meter reading
  static async delete(readingId) {
    const query = 'DELETE FROM meters_readings WHERE meter_reading_id = ?'
    const [result] = await db.pool.execute(query, [readingId])
    return result.affectedRows > 0
  }

  // Get readings by meter
  static async findByMeter(meterId, limit = 12) {
    const query = `
      SELECT 
        mr.*,
        m.meter_serial_no,
        m.meter_type,
        u.full_name as created_by_name
      FROM meters_readings mr
      INNER JOIN meters m ON mr.meter_id = m.meter_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      WHERE mr.meter_id = ?
      ORDER BY mr.reading_date DESC
      LIMIT ?
    `

    const [readings] = await db.pool.execute(query, [meterId, limit])
    return readings
  }

  // Get readings by apartment
  static async findByApartment(apartmentId) {
    const query = `
      SELECT 
        mr.*,
        m.meter_serial_no,
        m.meter_type,
        a.apartment_no,
        a.floor_no,
        u.full_name as created_by_name
      FROM meters_readings mr
      INNER JOIN meters m ON mr.meter_id = m.meter_id
      LEFT JOIN apartments a ON m.apartment_id = a.apartment_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      WHERE m.apartment_id = ?
      ORDER BY mr.reading_date DESC, m.meter_type ASC
    `

    const [readings] = await db.pool.execute(query, [apartmentId])
    return readings
  }

  // Get meter reading statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_readings,
        COUNT(DISTINCT meter_id) as meters_with_readings,
        SUM(CAST(unit_consumed AS DECIMAL(10,2))) as total_units_consumed,
        COUNT(DISTINCT DATE_FORMAT(reading_date, '%Y-%m')) as months_recorded
      FROM meters_readings
    `

    const [stats] = await db.pool.execute(query)
    return stats[0]
  }

  // Get consumption summary by meter type
  static async getConsumptionByType(startDate = null, endDate = null) {
    let query = `
      SELECT 
        m.meter_type,
        COUNT(mr.meter_reading_id) as reading_count,
        SUM(CAST(mr.unit_consumed AS DECIMAL(10,2))) as total_consumed,
        AVG(CAST(mr.unit_consumed AS DECIMAL(10,2))) as avg_consumed
      FROM meters_readings mr
      INNER JOIN meters m ON mr.meter_id = m.meter_id
      WHERE 1=1
    `
    const params = []

    if (startDate) {
      query += ` AND mr.reading_date >= ?`
      params.push(startDate)
    }

    if (endDate) {
      query += ` AND mr.reading_date <= ?`
      params.push(endDate)
    }

    query += ` GROUP BY m.meter_type`

    const [results] = await db.pool.execute(query, params)
    return results
  }
}

module.exports = MeterReading

