const db = require('../config/database')

class Invoice {
  static async getInvoiceDetails(billId) {
    try {
      // Get detailed invoice data with all required information
      const query = `
        SELECT 
          mb.*,
          c.contract_id,
          c.contract_start_date,
          c.rent,
          c.service_charges,
          t.full_name as tenant_name,
          t.mobile_no as tenant_mobile,
          t.cnic as tenant_cnic,
          a.apartment_no as apartment_number,
          a.floor_no as floor_number,
          -- WAPDA meter details
          wapda_meter.meter_serial_no as wapda_meter_serial,
          wapda_reading.reading_date as wapda_reading_date,
          wapda_reading.current_units as wapda_current_reading,
          wapda_reading.unit_consumed as wapda_units_consumed,
          wapda_prev_reading.current_units as wapda_previous_reading,
          -- Generator meter details  
          gen_meter.meter_serial_no as generator_meter_serial,
          gen_reading.reading_date as generator_reading_date,
          gen_reading.current_units as generator_current_reading,
          gen_reading.unit_consumed as generator_units_consumed,
          gen_prev_reading.current_units as generator_previous_reading,
          -- Water meter details
          water_meter.meter_serial_no as water_meter_serial,
          water_reading.reading_date as water_reading_date,
          water_reading.current_units as water_current_reading,
          water_reading.unit_consumed as water_units_consumed,
          water_prev_reading.current_units as water_previous_reading,
          -- User info
          u.full_name as created_by_name,
          -- Calculate total amount
          (
            CAST(mb.wapda_bill AS DECIMAL(10,2)) +
            CAST(mb.generator_bill AS DECIMAL(10,2)) +
            CAST(mb.water_bill AS DECIMAL(10,2)) +
            CAST(mb.management_charges AS DECIMAL(10,2)) +
            CAST(mb.rent AS DECIMAL(10,2)) +
            CAST(IFNULL(mb.arrears, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(mb.additional_charges, 0) AS DECIMAL(10,2))
          ) as total_amount
        FROM monthly_bills mb
        INNER JOIN contracts c ON mb.contract_id = c.contract_id
        LEFT JOIN apartments_tenants at ON c.contract_id = at.contract_id AND at.is_active = 1
        LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
        LEFT JOIN apartments a ON at.apartment_id = a.apartment_id
        LEFT JOIN users u ON mb.created_by = u.user_id
        -- WAPDA meter joins
        LEFT JOIN meters wapda_meter ON a.apartment_id = wapda_meter.apartment_id AND wapda_meter.meter_type = 1
        LEFT JOIN meters_readings wapda_reading ON wapda_meter.meter_id = wapda_reading.meter_id 
          AND DATE_FORMAT(wapda_reading.reading_date, '%Y-%m') = DATE_FORMAT(mb.bill_issue_date, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) wapda_prev_reading ON wapda_meter.meter_id = wapda_prev_reading.meter_id
        -- Generator meter joins
        LEFT JOIN meters gen_meter ON a.apartment_id = gen_meter.apartment_id AND gen_meter.meter_type = 2
        LEFT JOIN meters_readings gen_reading ON gen_meter.meter_id = gen_reading.meter_id 
          AND DATE_FORMAT(gen_reading.reading_date, '%Y-%m') = DATE_FORMAT(mb.bill_issue_date, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) gen_prev_reading ON gen_meter.meter_id = gen_prev_reading.meter_id
        -- Water meter joins
        LEFT JOIN meters water_meter ON a.apartment_id = water_meter.apartment_id AND water_meter.meter_type = 3
        LEFT JOIN meters_readings water_reading ON water_meter.meter_id = water_reading.meter_id 
          AND DATE_FORMAT(water_reading.reading_date, '%Y-%m') = DATE_FORMAT(mb.bill_issue_date, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) water_prev_reading ON water_meter.meter_id = water_prev_reading.meter_id
        WHERE mb.monthly_bill_id = ?
        GROUP BY mb.monthly_bill_id
      `
      
      const rows = await db.query(query, [
        billIssueDate, 
        billIssueDate, 
        billIssueDate, 
        billIssueDate,
        billIssueDate,
        billIssueDate,
        billId
      ])
      
      return rows[0] || null
    } catch (error) {
      console.error('Error fetching invoice details:', error)
      throw error
    }
  }

  static async getInvoiceDetailsByBillId(billId) {
    try {
      // First get the bill to get the bill_issue_date
      const billQuery = 'SELECT bill_issue_date FROM monthly_bills WHERE monthly_bill_id = ?'
      const billRows = await db.query(billQuery, [billId])
      
      if (billRows.length === 0) {
        return null
      }
      
      const billIssueDate = billRows[0].bill_issue_date
      
      // Get detailed invoice data with previous readings calculated
      const query = `
        SELECT 
          mb.*,
          c.contract_id,
          c.contract_start_date,
          c.rent,
          c.service_charges,
          t.full_name as tenant_name,
          t.mobile_no as tenant_mobile,
          t.cnic as tenant_cnic,
          a.apartment_no as apartment_number,
          a.floor_no as floor_number,
          u.full_name as created_by_name,
          -- WAPDA meter details
          wapda_meter.meter_serial_no as wapda_meter_serial,
          wapda_reading.reading_date as wapda_reading_date,
          wapda_reading.current_units as wapda_current_reading,
          wapda_reading.unit_consumed as wapda_units_consumed,
          wapda_prev_reading.current_units as wapda_previous_reading,
          -- Generator meter details  
          gen_meter.meter_serial_no as generator_meter_serial,
          gen_reading.reading_date as generator_reading_date,
          gen_reading.current_units as generator_current_reading,
          gen_reading.unit_consumed as generator_units_consumed,
          gen_prev_reading.current_units as generator_previous_reading,
          -- Water meter details
          water_meter.meter_serial_no as water_meter_serial,
          water_reading.reading_date as water_reading_date,
          water_reading.current_units as water_current_reading,
          water_reading.unit_consumed as water_units_consumed,
          water_prev_reading.current_units as water_previous_reading,
          -- Calculate total amount
          (
            CAST(mb.wapda_bill AS DECIMAL(10,2)) +
            CAST(mb.generator_bill AS DECIMAL(10,2)) +
            CAST(mb.water_bill AS DECIMAL(10,2)) +
            CAST(mb.management_charges AS DECIMAL(10,2)) +
            CAST(mb.rent AS DECIMAL(10,2)) +
            CAST(IFNULL(mb.arrears, 0) AS DECIMAL(10,2)) +
            CAST(IFNULL(mb.additional_charges, 0) AS DECIMAL(10,2))
          ) as total_amount
        FROM monthly_bills mb
        INNER JOIN contracts c ON mb.contract_id = c.contract_id
        LEFT JOIN apartments_tenants at ON c.contract_id = at.contract_id AND at.is_active = 1
        LEFT JOIN tenants t ON at.tenant_id = t.tenant_id
        LEFT JOIN apartments a ON at.apartment_id = a.apartment_id
        LEFT JOIN users u ON mb.created_by = u.user_id
        -- WAPDA meter joins
        LEFT JOIN meters wapda_meter ON a.apartment_id = wapda_meter.apartment_id AND wapda_meter.meter_type = 1
        LEFT JOIN meters_readings wapda_reading ON wapda_meter.meter_id = wapda_reading.meter_id 
          AND DATE_FORMAT(wapda_reading.reading_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) wapda_prev_reading ON wapda_meter.meter_id = wapda_prev_reading.meter_id
        -- Generator meter joins
        LEFT JOIN meters gen_meter ON a.apartment_id = gen_meter.apartment_id AND gen_meter.meter_type = 2
        LEFT JOIN meters_readings gen_reading ON gen_meter.meter_id = gen_reading.meter_id 
          AND DATE_FORMAT(gen_reading.reading_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) gen_prev_reading ON gen_meter.meter_id = gen_prev_reading.meter_id
        -- Water meter joins
        LEFT JOIN meters water_meter ON a.apartment_id = water_meter.apartment_id AND water_meter.meter_type = 3
        LEFT JOIN meters_readings water_reading ON water_meter.meter_id = water_reading.meter_id 
          AND DATE_FORMAT(water_reading.reading_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
        LEFT JOIN (
          SELECT mr1.meter_id, mr1.current_units
          FROM meters_readings mr1
          WHERE mr1.reading_date = (
            SELECT MAX(mr2.reading_date)
            FROM meters_readings mr2 
            WHERE mr2.meter_id = mr1.meter_id 
            AND DATE_FORMAT(mr2.reading_date, '%Y-%m') < DATE_FORMAT(?, '%Y-%m')
          )
        ) water_prev_reading ON water_meter.meter_id = water_prev_reading.meter_id
        WHERE mb.monthly_bill_id = ?
        LIMIT 1
      `
      
      const rows = await db.query(query, [
        billIssueDate,
        billIssueDate,
        billIssueDate,
        billIssueDate,
        billIssueDate,
        billIssueDate,
        billId
      ])
      
      return rows[0] || null
    } catch (error) {
      console.error('Error fetching invoice details:', error)
      throw error
    }
  }
}

module.exports = Invoice
