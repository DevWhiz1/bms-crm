const Meter = require('../models/Meter')

// Create a new meter
exports.createMeter = async (req, res) => {
  try {
    const { apartment_id, meter_serial_no, meter_type } = req.body

    const meter = await Meter.create({
      apartment_id,
      meter_serial_no,
      meter_type,
    })

    res.status(201).json({
      success: true,
      message: 'Meter created successfully',
      data: { meter },
    })
  } catch (error) {
    console.error('Error creating meter:', error)
    
    // Handle duplicate meter serial number
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Meter serial number already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create meter',
      error: error.message,
    })
  }
}

// Get all meters with pagination and filters
exports.getAllMeters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      meter_type = '',
      apartment_id = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query

    const result = await Meter.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      meter_type,
      apartment_id,
      sortBy,
      sortOrder,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching meters:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meters',
      error: error.message,
    })
  }
}

// Get meter by ID
exports.getMeterById = async (req, res) => {
  try {
    const { id } = req.params
    const meter = await Meter.findById(id)

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Meter not found',
      })
    }

    res.json({
      success: true,
      data: { meter },
    })
  } catch (error) {
    console.error('Error fetching meter:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meter',
      error: error.message,
    })
  }
}

// Update meter
exports.updateMeter = async (req, res) => {
  try {
    const { id } = req.params
    const { apartment_id, meter_serial_no, meter_type } = req.body

    // Check if meter exists
    const existingMeter = await Meter.findById(id)
    if (!existingMeter) {
      return res.status(404).json({
        success: false,
        message: 'Meter not found',
      })
    }

    // Update meter with only provided fields
    const updateData = {
      apartment_id: apartment_id !== undefined ? apartment_id : existingMeter.apartment_id,
      meter_serial_no: meter_serial_no !== undefined ? meter_serial_no : existingMeter.meter_serial_no,
      meter_type: meter_type !== undefined ? meter_type : existingMeter.meter_type,
    }

    const updatedMeter = await Meter.update(id, updateData)

    res.json({
      success: true,
      message: 'Meter updated successfully',
      data: { meter: updatedMeter },
    })
  } catch (error) {
    console.error('Error updating meter:', error)
    
    // Handle duplicate meter serial number
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Meter serial number already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update meter',
      error: error.message,
    })
  }
}

// Delete meter
exports.deleteMeter = async (req, res) => {
  try {
    const { id } = req.params

    // Check if meter exists
    const meter = await Meter.findById(id)
    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Meter not found',
      })
    }

    await Meter.delete(id)

    res.json({
      success: true,
      message: 'Meter deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting meter:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete meter',
      error: error.message,
    })
  }
}

// Get meters by apartment
exports.getMetersByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params
    const meters = await Meter.findByApartment(apartmentId)

    res.json({
      success: true,
      data: { meters },
    })
  } catch (error) {
    console.error('Error fetching meters by apartment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meters',
      error: error.message,
    })
  }
}

// Get meter statistics
exports.getMeterStats = async (req, res) => {
  try {
    const stats = await Meter.getStats()

    res.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error('Error fetching meter stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    })
  }
}

