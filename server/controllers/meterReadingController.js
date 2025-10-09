const MeterReading = require('../models/MeterReading')

// Create a new meter reading
exports.createReading = async (req, res) => {
  try {
    const { meter_id, reading_date, current_units, previous_month_reading } = req.body
    const created_by = req.user.user_id

    const reading = await MeterReading.create({
      meter_id,
      reading_date,
      current_units,
      previous_month_reading,
      created_by,
    })

    res.status(201).json({
      success: true,
      message: 'Meter reading created successfully',
      data: { reading },
    })
  } catch (error) {
    console.error('Error creating meter reading:', error)
    
    // Handle duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A reading for this meter on this date already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create meter reading',
      error: error.message,
    })
  }
}

// Get all meter readings with pagination and filters
exports.getAllReadings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      meter_id = '',
      apartment_id = '',
      meter_type = '',
      sortBy = 'reading_date',
      sortOrder = 'DESC',
    } = req.query

    const result = await MeterReading.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      meter_id,
      apartment_id,
      meter_type,
      sortBy,
      sortOrder,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching meter readings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meter readings',
      error: error.message,
    })
  }
}

// Get reading by ID
exports.getReadingById = async (req, res) => {
  try {
    const { id } = req.params
    const reading = await MeterReading.findById(id)

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Meter reading not found',
      })
    }

    res.json({
      success: true,
      data: { reading },
    })
  } catch (error) {
    console.error('Error fetching meter reading:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meter reading',
      error: error.message,
    })
  }
}

// Update meter reading
exports.updateReading = async (req, res) => {
  try {
    const { id } = req.params
    const { reading_date, current_units } = req.body
    const updated_by = req.user.user_id

    // Check if reading exists
    const existingReading = await MeterReading.findById(id)
    if (!existingReading) {
      return res.status(404).json({
        success: false,
        message: 'Meter reading not found',
      })
    }

    // Update reading with only provided fields
    const updateData = {
      reading_date: reading_date !== undefined ? reading_date : existingReading.reading_date,
      current_units: current_units !== undefined ? current_units : existingReading.current_units,
      updated_by,
    }

    const updatedReading = await MeterReading.update(id, updateData)

    res.json({
      success: true,
      message: 'Meter reading updated successfully',
      data: { reading: updatedReading },
    })
  } catch (error) {
    console.error('Error updating meter reading:', error)
    
    // Handle duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A reading for this meter on this date already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update meter reading',
      error: error.message,
    })
  }
}

// Delete meter reading
exports.deleteReading = async (req, res) => {
  try {
    const { id } = req.params

    // Check if reading exists
    const reading = await MeterReading.findById(id)
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Meter reading not found',
      })
    }

    await MeterReading.delete(id)

    res.json({
      success: true,
      message: 'Meter reading deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting meter reading:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete meter reading',
      error: error.message,
    })
  }
}

// Get readings by meter
exports.getReadingsByMeter = async (req, res) => {
  try {
    const { meterId } = req.params
    const limit = req.query.limit ? parseInt(req.query.limit) : 12
    
    const readings = await MeterReading.findByMeter(meterId, limit)

    res.json({
      success: true,
      data: { readings },
    })
  } catch (error) {
    console.error('Error fetching readings by meter:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch readings',
      error: error.message,
    })
  }
}

// Get readings by apartment
exports.getReadingsByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params
    const readings = await MeterReading.findByApartment(apartmentId)

    res.json({
      success: true,
      data: { readings },
    })
  } catch (error) {
    console.error('Error fetching readings by apartment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch readings',
      error: error.message,
    })
  }
}

// Check if previous reading exists
exports.checkPreviousReading = async (req, res) => {
  try {
    const { meter_id, reading_date } = req.query

    if (!meter_id || !reading_date) {
      return res.status(400).json({
        success: false,
        message: 'meter_id and reading_date are required',
      })
    }

    const hasPrevious = await MeterReading.hasPreviousReading(meter_id, reading_date)
    const previousReading = await MeterReading.getPreviousReading(meter_id, reading_date)

    res.json({
      success: true,
      data: {
        has_previous: hasPrevious,
        previous_reading: previousReading,
      },
    })
  } catch (error) {
    console.error('Error checking previous reading:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check previous reading',
      error: error.message,
    })
  }
}

// Get meter reading statistics
exports.getReadingStats = async (req, res) => {
  try {
    const stats = await MeterReading.getStats()

    res.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error('Error fetching reading stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    })
  }
}

// Get consumption by meter type
exports.getConsumptionByType = async (req, res) => {
  try {
    const { start_date, end_date } = req.query
    const consumption = await MeterReading.getConsumptionByType(start_date, end_date)

    res.json({
      success: true,
      data: { consumption },
    })
  } catch (error) {
    console.error('Error fetching consumption by type:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption data',
      error: error.message,
    })
  }
}

