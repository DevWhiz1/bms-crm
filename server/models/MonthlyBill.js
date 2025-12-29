const db = require('../config/database')
const ContractApartmentCharge = require('./ContractApartmentCharge')

class MonthlyBill {
  // Generate bills for all active contracts for a specific month
  static async generateBillsForMonth(billData, createdBy) {
    const {
      month, // Format: "2025-10"
      wapda_per_unit_rate,
      generator_per_unit_rate,
      water_per_unit_rate,
      bill_issue_date,
      bill_due_date,
    } = billData

    try {
      // Get all active contracts
      const contractsQuery = `
        SELECT 
          c.contract_id,
          c.rent,
          c.service_charges
        FROM contracts c
        WHERE c.is_active = 1
      `

      const [contracts] = await db.pool.execute(contractsQuery)
      const generatedBills = []

      // Generate bill for each contract
      for (const contract of contracts) {
        // Get apartments for this contract
        const apartmentsQuery = `
          SELECT 
            at.apartment_id,
            a.apartment_no,
            a.floor_no
          FROM apartments_tenants at
          INNER JOIN apartments a ON at.apartment_id = a.apartment_id
          WHERE at.contract_id = ? AND at.is_active = 1
        `
        
        const [apartments] = await db.pool.execute(apartmentsQuery, [contract.contract_id])
        
        // Calculate consumption for all apartments in this contract
        let totalWapdaUnits = 0
        let totalGeneratorUnits = 0
        let totalWaterUnits = 0

        for (const apartment of apartments) {
          // Get latest readings for each meter type in the specified month
          const readingsQuery = `
            SELECT 
              m.meter_type,
              mr.unit_consumed,
              mr.reading_date
            FROM meters_readings mr
            INNER JOIN meters m ON mr.meter_id = m.meter_id
            WHERE m.apartment_id = ?
              AND DATE_FORMAT(mr.reading_date, '%Y-%m') = ?
            ORDER BY mr.reading_date DESC
          `

          const [readings] = await db.pool.execute(readingsQuery, [
            apartment.apartment_id,
            month,
          ])

          // Get the latest reading for each meter type
          const wapdaReading = readings.find(r => r.meter_type === 1)
          const generatorReading = readings.find(r => r.meter_type === 2)
          const waterReading = readings.find(r => r.meter_type === 3)

          totalWapdaUnits += wapdaReading ? parseFloat(wapdaReading.unit_consumed) : 0
          totalGeneratorUnits += generatorReading ? parseFloat(generatorReading.unit_consumed) : 0
          totalWaterUnits += waterReading ? parseFloat(waterReading.unit_consumed) : 0
        }

        // Calculate bills
        const wapdaBill = totalWapdaUnits * parseFloat(wapda_per_unit_rate)
        const generatorBill = totalGeneratorUnits * parseFloat(generator_per_unit_rate)
        const waterBill = totalWaterUnits * parseFloat(water_per_unit_rate)

        // Calculate arrears from previous unpaid bills
        const arrearsQuery = `
          SELECT SUM(
            CAST(wapda_bill AS DECIMAL(10,2)) +
            CAST(generator_bill AS DECIMAL(10,2)) +
            CAST(water_bill AS DECIMAL(10,2)) +
            CAST(management_charges AS DECIMAL(10,2)) +
            CAST(rent AS DECIMAL(10,2)) +
            CAST(IFNULL(security_fees, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(arrears, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(additional_charges, 0) AS DECIMAL(10,2))
          ) as total_arrears
          FROM monthly_bills
          WHERE contract_id = ?
            AND is_bill_paid = 0
            AND DATE_FORMAT(bill_issue_date, '%Y-%m') < ?
        `

        const [arrearsResult] = await db.pool.execute(arrearsQuery, [
          contract.contract_id,
          month,
        ])

        const arrears = parseFloat(arrearsResult[0]?.total_arrears ?? 0) || 0

        // Sum per-apartment charges
        const apartmentCharges = await ContractApartmentCharge.findByContract(contract.contract_id)
        const totals = apartmentCharges.reduce(
          (acc, row) => {
            acc.rent += parseFloat(row.rent || 0)
            acc.service_charges += parseFloat(row.service_charges || 0)
            acc.security_fees += parseFloat(row.security_fees || 0)
            return acc
          },
          { rent: 0, service_charges: 0, security_fees: 0 }
        )

        // First bill includes security fees once
        const [billCountRows] = await db.pool.execute(
          'SELECT COUNT(*) as cnt FROM monthly_bills WHERE contract_id = ?',
          [contract.contract_id]
        )
        const includeSecurity = (billCountRows[0]?.cnt || 0) === 0
        const securityToBill = includeSecurity ? totals.security_fees : 0

        // Insert bill
        const insertQuery = `
          INSERT INTO monthly_bills (
            contract_id,
            wapda_unit_consumed,
            wapda_per_unit_rate,
            wapda_bill,
            generator_unit_consumed,
            generator_per_unit_rate,
            generator_bill,
            water_unit_consumed,
            water_per_unit_rate,
            water_bill,
            management_charges,
            rent,
            security_fees,
            arrears,
            additional_charges,
            bill_issue_date,
            bill_due_date,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const [result] = await db.pool.execute(insertQuery, [
          contract.contract_id,
          totalWapdaUnits.toFixed(2),
          wapda_per_unit_rate,
          wapdaBill.toFixed(2),
          totalGeneratorUnits.toFixed(2),
          generator_per_unit_rate,
          generatorBill.toFixed(2),
          totalWaterUnits.toFixed(2),
          water_per_unit_rate,
          waterBill.toFixed(2),
          totals.service_charges.toFixed(2),
          totals.rent.toFixed(2),
          securityToBill.toFixed(2),
          arrears.toFixed(2),
          0, // additional_charges
          bill_issue_date,
          bill_due_date,
          createdBy,
        ])

        generatedBills.push({
          monthly_bill_id: result.insertId,
          contract_id: contract.contract_id,
          total_amount: (
            wapdaBill +
            generatorBill +
            waterBill +
            parseFloat(totals.service_charges) +
            parseFloat(totals.rent) +
            parseFloat(securityToBill) +
            parseFloat(arrears)
          ).toFixed(2),
        })
      }

      return {
        success: true,
        bills_generated: generatedBills.length,
        bills: generatedBills,
      }
    } catch (error) {
      throw error
    }
  }

  // Get all bills with pagination and filters
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      is_paid = '',
      month = '',
      sortBy = 'bill_issue_date',
      sortOrder = 'DESC',
    } = filters

    const offset = (page - 1) * limit
    let query = `
      SELECT 
        mb.*,
        c.contract_id,
        t.full_name as tenant_name,
        t.cnic as tenant_cnic,
        (
          CAST(mb.wapda_bill AS DECIMAL(10,2)) +
          CAST(mb.generator_bill AS DECIMAL(10,2)) +
          CAST(mb.water_bill AS DECIMAL(10,2)) +
          CAST(mb.management_charges AS DECIMAL(10,2)) +
          CAST(mb.rent AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.security_fees, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.arrears, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.additional_charges, 0) AS DECIMAL(10,2))
        ) as total_amount,
        u.full_name as created_by_name
      FROM monthly_bills mb
      INNER JOIN contracts c ON mb.contract_id = c.contract_id
      LEFT JOIN apartments_tenants at ON c.contract_id = at.contract_id AND at.is_active = 1
      LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
      LEFT JOIN users u ON mb.created_by = u.user_id
      WHERE 1=1
    `
    const params = []

    // Search filter
    if (search) {
      query += ` AND (t.full_name LIKE ? OR t.cnic LIKE ? OR c.contract_id LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    // Payment status filter
    if (is_paid !== '') {
      query += ` AND mb.is_bill_paid = ?`
      params.push(is_paid)
    }

    // Month filter
    if (month) {
      query += ` AND DATE_FORMAT(mb.bill_issue_date, '%Y-%m') = ?`
      params.push(month)
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT.*FROM/s,
      'SELECT COUNT(DISTINCT mb.monthly_bill_id) as total FROM'
    )
    const [countResult] = await db.pool.execute(countQuery, params)
    const total = countResult[0].total

    // Add GROUP BY to avoid duplicate rows
    query += ` GROUP BY mb.monthly_bill_id`

    // Add sorting and pagination
    const validSortColumns = ['bill_issue_date', 'bill_due_date', 'total_amount', 'tenant_name']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'bill_issue_date'
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`
    params.push(parseInt(limit), parseInt(offset))

    const [bills] = await db.pool.execute(query, params)

    return {
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Get bill by ID
  static async findById(billId) {
    const query = `
      SELECT 
        mb.*,
        c.contract_id,
        t.full_name as tenant_name,
        t.cnic as tenant_cnic,
        t.mobile_no as tenant_mobile,
        (
          CAST(mb.wapda_bill AS DECIMAL(10,2)) +
          CAST(mb.generator_bill AS DECIMAL(10,2)) +
          CAST(mb.water_bill AS DECIMAL(10,2)) +
          CAST(mb.management_charges AS DECIMAL(10,2)) +
          CAST(mb.rent AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.security_fees, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.arrears, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(mb.additional_charges, 0) AS DECIMAL(10,2))
        ) as total_amount,
        u.full_name as created_by_name
      FROM monthly_bills mb
      INNER JOIN contracts c ON mb.contract_id = c.contract_id
      LEFT JOIN apartments_tenants at ON c.contract_id = at.contract_id AND at.is_active = 1
      LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
      LEFT JOIN users u ON mb.created_by = u.user_id
      WHERE mb.monthly_bill_id = ?
      GROUP BY mb.monthly_bill_id
    `

    const [bills] = await db.pool.execute(query, [billId])
    return bills[0]
  }

  // Update bill
  static async update(billId, billData) {
    const {
      additional_charges,
      bill_due_date,
      is_bill_paid,
      updated_by,
    } = billData

    const query = `
      UPDATE monthly_bills
      SET additional_charges = ?,
          bill_due_date = ?,
          is_bill_paid = ?,
          updated_by = ?
      WHERE monthly_bill_id = ?
    `

    await db.pool.execute(query, [
      additional_charges,
      bill_due_date,
      is_bill_paid,
      updated_by,
      billId,
    ])

    return await MonthlyBill.findById(billId)
  }

  // Add a payment and update aggregates/status
  static async addPayment(billId, payment, updatedBy) {
    const { amount_received, received_date, payment_method = null, reference_no = null, notes = null, received_by = null } = payment

    // Insert payment
    const insertSql = `
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
    await db.pool.execute(insertSql, [
      billId,
      amount_received,
      received_date,
      payment_method,
      reference_no,
      notes,
      received_by,
    ])

    // Compute new aggregate
    const sumSql = `
      SELECT SUM(amount_received) AS total_received
      FROM bill_payments WHERE monthly_bill_id = ?
    `
    const [sumRows] = await db.pool.execute(sumSql, [billId])
    const totalReceived = parseFloat(sumRows[0]?.total_received || 0)

    // Get bill to compare against total amount
    const bill = await MonthlyBill.findById(billId)
    const totalAmount = parseFloat(bill.total_amount)

    const isFullyPaid = totalReceived >= totalAmount
    const paymentStatus = isFullyPaid ? 'paid' : (totalReceived > 0 ? 'partial' : 'unpaid')

    const updateSql = `
      UPDATE monthly_bills
      SET amount_received = ?,
          payment_status = ?,
          is_bill_paid = ?,
          paid_at = CASE WHEN ? = 'paid' THEN NOW() ELSE paid_at END,
          updated_by = ?
      WHERE monthly_bill_id = ?
    `
    await db.pool.execute(updateSql, [
      totalReceived.toFixed(2),
      paymentStatus,
      isFullyPaid ? 1 : 0,
      paymentStatus,
      updatedBy,
      billId,
    ])

    return await MonthlyBill.findById(billId)
  }

  // Mark bill as paid
  static async markAsPaid(billId, updatedBy) {
    const query = `
      UPDATE monthly_bills
      SET is_bill_paid = 1,
          updated_by = ?
      WHERE monthly_bill_id = ?
    `

    await db.pool.execute(query, [updatedBy, billId])
    return await MonthlyBill.findById(billId)
  }

  // Delete bill
  static async delete(billId) {
    const query = 'DELETE FROM monthly_bills WHERE monthly_bill_id = ?'
    const [result] = await db.pool.execute(query, [billId])
    return result.affectedRows > 0
  }

  // Get bill statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_bills,
        SUM(CASE WHEN is_bill_paid = 1 THEN 1 ELSE 0 END) as paid_bills,
        SUM(CASE WHEN is_bill_paid = 0 THEN 1 ELSE 0 END) as unpaid_bills,
        SUM(
          CAST(wapda_bill AS DECIMAL(10,2)) +
          CAST(generator_bill AS DECIMAL(10,2)) +
          CAST(water_bill AS DECIMAL(10,2)) +
          CAST(management_charges AS DECIMAL(10,2)) +
          CAST(rent AS DECIMAL(10,2)) +
          CAST(IFNULL(security_fees, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(arrears, 0) AS DECIMAL(10,2)) +
          CAST(IFNULL(additional_charges, 0) AS DECIMAL(10,2))
        ) as total_revenue,
        SUM(
          CASE WHEN is_bill_paid = 0 THEN
            CAST(wapda_bill AS DECIMAL(10,2)) +
            CAST(generator_bill AS DECIMAL(10,2)) +
            CAST(water_bill AS DECIMAL(10,2)) +
            CAST(management_charges AS DECIMAL(10,2)) +
            CAST(rent AS DECIMAL(10,2)) +
            CAST(IFNULL(security_fees, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(arrears, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(additional_charges, 0) AS DECIMAL(10,2))
          ELSE 0 END
        ) as pending_amount
      FROM monthly_bills
    `

    const [stats] = await db.pool.execute(query)
    return stats[0]
  }

  // Check if bills already generated for a month
  static async checkBillsExist(month) {
    const query = `
      SELECT COUNT(*) as count
      FROM monthly_bills
      WHERE DATE_FORMAT(bill_issue_date, '%Y-%m') = ?
    `

    const [result] = await db.pool.execute(query, [month])
    return result[0].count > 0
  }
}

module.exports = MonthlyBill

