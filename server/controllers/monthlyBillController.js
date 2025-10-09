const MonthlyBill = require('../models/MonthlyBill')

// Generate bills for a specific month
exports.generateBills = async (req, res) => {
  try {
    const {
      month,
      wapda_per_unit_rate,
      generator_per_unit_rate,
      water_per_unit_rate,
      bill_issue_date,
      bill_due_date,
    } = req.body

    const created_by = req.user.user_id

    // Check if bills already exist for this month
    const billsExist = await MonthlyBill.checkBillsExist(month)
    if (billsExist) {
      return res.status(400).json({
        success: false,
        message: `Bills have already been generated for ${month}. Please delete existing bills first.`,
      })
    }

    const result = await MonthlyBill.generateBillsForMonth(
      {
        month,
        wapda_per_unit_rate,
        generator_per_unit_rate,
        water_per_unit_rate,
        bill_issue_date,
        bill_due_date,
      },
      created_by
    )

    res.status(201).json({
      success: true,
      message: `Successfully generated ${result.bills_generated} bills for ${month}`,
      data: result,
    })
  } catch (error) {
    console.error('Error generating bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate bills',
      error: error.message,
    })
  }
}

// Get all bills with pagination and filters
exports.getAllBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      is_paid = '',
      month = '',
      sortBy = 'bill_issue_date',
      sortOrder = 'DESC',
    } = req.query

    const result = await MonthlyBill.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      is_paid,
      month,
      sortBy,
      sortOrder,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message,
    })
  }
}

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params
    const bill = await MonthlyBill.findById(id)

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      })
    }

    res.json({
      success: true,
      data: { bill },
    })
  } catch (error) {
    console.error('Error fetching bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message,
    })
  }
}

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params
    const { additional_charges, bill_due_date, is_bill_paid } = req.body
    const updated_by = req.user.user_id

    // Check if bill exists
    const existingBill = await MonthlyBill.findById(id)
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      })
    }

    const updateData = {
      additional_charges: additional_charges !== undefined ? additional_charges : existingBill.additional_charges,
      bill_due_date: bill_due_date !== undefined ? bill_due_date : existingBill.bill_due_date,
      is_bill_paid: is_bill_paid !== undefined ? is_bill_paid : existingBill.is_bill_paid,
      updated_by,
    }

    const updatedBill = await MonthlyBill.update(id, updateData)

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: { bill: updatedBill },
    })
  } catch (error) {
    console.error('Error updating bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update bill',
      error: error.message,
    })
  }
}

// Mark bill as paid
exports.markBillAsPaid = async (req, res) => {
  try {
    const { id } = req.params
    const updated_by = req.user.user_id

    // Check if bill exists
    const bill = await MonthlyBill.findById(id)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      })
    }

    const updatedBill = await MonthlyBill.markAsPaid(id, updated_by)

    res.json({
      success: true,
      message: 'Bill marked as paid successfully',
      data: { bill: updatedBill },
    })
  } catch (error) {
    console.error('Error marking bill as paid:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark bill as paid',
      error: error.message,
    })
  }
}

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params

    // Check if bill exists
    const bill = await MonthlyBill.findById(id)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      })
    }

    await MonthlyBill.delete(id)

    res.json({
      success: true,
      message: 'Bill deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill',
      error: error.message,
    })
  }
}

// Get bill statistics
exports.getBillStats = async (req, res) => {
  try {
    const stats = await MonthlyBill.getStats()

    res.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error('Error fetching bill stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    })
  }
}

// Check if bills exist for a month
exports.checkBillsExist = async (req, res) => {
  try {
    const { month } = req.query

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month parameter is required',
      })
    }

    const exists = await MonthlyBill.checkBillsExist(month)

    res.json({
      success: true,
      data: { exists },
    })
  } catch (error) {
    console.error('Error checking bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check bills',
      error: error.message,
    })
  }
}

