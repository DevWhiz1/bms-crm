const Invoice = require('../models/Invoice')

exports.getInvoiceDetails = async (req, res) => {
  try {
    const { billId } = req.params
    
    if (!billId || isNaN(billId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid bill ID is required'
      })
    }

    const invoiceData = await Invoice.getInvoiceDetailsByBillId(billId)
    
    if (!invoiceData) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    // Format the data for frontend
    const formattedInvoice = {
      // Basic bill info
      billId: invoiceData.monthly_bill_id,
      billIssueDate: invoiceData.bill_issue_date,
      billDueDate: invoiceData.bill_due_date,
      isPaid: !!invoiceData.is_bill_paid,
      
      // Occupant details
      occupant: {
        name: invoiceData.tenant_name || 'N/A',
        mobile: invoiceData.tenant_mobile || 'N/A',
        cnic: invoiceData.tenant_cnic || 'N/A'
      },
      
      // Property details
      property: {
        floor: invoiceData.floor_number || 'N/A',
        apartment: invoiceData.apartment_number || 'N/A',
        floorName: `Floor ${invoiceData.floor_number || 'N/A'}`
      },
      
      // Contract details
      contract: {
        startDate: invoiceData.contract_start_date,
        rent: parseFloat(invoiceData.rent || 0),
        serviceCharges: parseFloat(invoiceData.service_charges || 0)
      },
      
      // Electricity (WAPDA) details
      electricity: {
        meterSerial: invoiceData.wapda_meter_serial || 'N/A',
        readingDate: invoiceData.wapda_reading_date,
        previousReading: parseFloat(invoiceData.wapda_previous_reading || 0),
        currentReading: parseFloat(invoiceData.wapda_current_reading || 0),
        unitsConsumed: parseFloat(invoiceData.wapda_units_consumed || 0),
        ratePerUnit: parseFloat(invoiceData.wapda_per_unit_rate || 0),
        billAmount: parseFloat(invoiceData.wapda_bill || 0)
      },
      
      // Generator details
      generator: {
        meterSerial: invoiceData.generator_meter_serial || 'N/A',
        readingDate: invoiceData.generator_reading_date,
        previousReading: parseFloat(invoiceData.generator_previous_reading || 0),
        currentReading: parseFloat(invoiceData.generator_current_reading || 0),
        unitsConsumed: parseFloat(invoiceData.generator_units_consumed || 0),
        ratePerUnit: parseFloat(invoiceData.generator_per_unit_rate || 0),
        billAmount: parseFloat(invoiceData.generator_bill || 0)
      },
      
      // Water details
      water: {
        meterSerial: invoiceData.water_meter_serial || 'N/A',
        readingDate: invoiceData.water_reading_date,
        previousReading: parseFloat(invoiceData.water_previous_reading || 0),
        currentReading: parseFloat(invoiceData.water_current_reading || 0),
        unitsConsumed: parseFloat(invoiceData.water_units_consumed || 0),
        ratePerUnit: parseFloat(invoiceData.water_per_unit_rate || 0),
        billAmount: parseFloat(invoiceData.water_bill || 0)
      },
      
      // Other charges
      charges: {
        managementCharges: parseFloat(invoiceData.management_charges || 0),
        rent: parseFloat(invoiceData.rent || 0),
        arrears: parseFloat(invoiceData.arrears || 0),
        additionalCharges: parseFloat(invoiceData.additional_charges || 0),
        totalAmount: parseFloat(invoiceData.total_amount || 0)
      },
      
      // Additional info
      createdBy: invoiceData.created_by_name || 'System',
      createdAt: invoiceData.created_at
    }

    res.json({
      success: true,
      data: formattedInvoice
    })
  } catch (error) {
    console.error('Error fetching invoice details:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice details',
      error: error.message
    })
  }
}

exports.generateInvoicePDF = async (req, res) => {
  try {
    const { billId } = req.params
    
    // For now, return success - PDF generation can be implemented later
    res.json({
      success: true,
      message: 'PDF generation endpoint ready',
      data: { billId }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    })
  }
}
