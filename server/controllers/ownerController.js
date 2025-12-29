const Owner = require('../models/Owner');
const Apartment = require('../models/Apartment');
const ApartmentOwner = require('../models/ApartmentOwner');
const db = require('../config/database');
const { deleteFile, getFileUrl } = require('../middleware/upload');

// Create a new owner
const createOwner = async (req, res) => {
  try {
    const ownerData = req.body;
    const createdBy = req.user.user_id;

    if (ownerData.is_active !== undefined) {
      ownerData.is_active = ownerData.is_active === true || ownerData.is_active === 'true' || ownerData.is_active === 1 ? 1 : 0;
    }

    const cnicExists = await Owner.cnicExists(ownerData.cnic);
    if (cnicExists) {
      if (req.files) {
        if (req.files.photo) deleteFile(req.files.photo[0].path);
        if (req.files.cnic_photo) deleteFile(req.files.cnic_photo[0].path);
      }
      return res.status(409).json({
        status: 'error',
        message: 'Owner with this CNIC already exists'
      });
    }

    if (req.files) {
      if (req.files.photo) ownerData.photo = req.files.photo[0].path;
      if (req.files.cnic_photo) ownerData.cnic_photo = req.files.cnic_photo[0].path;
    }

    const newOwner = await Owner.create(ownerData, createdBy);
    const owner = await Owner.findById(newOwner.owner_id);
    const ownerResponse = owner.toJSON();
    ownerResponse.photo_url = getFileUrl(owner.photo, req);
    ownerResponse.cnic_photo_url = getFileUrl(owner.cnic_photo, req);

    res.status(201).json({
      status: 'success',
      message: 'Owner created successfully',
      data: { owner: ownerResponse }
    });
  } catch (error) {
    console.error('Create owner error:', error);
    if (req.files) {
      if (req.files.photo) deleteFile(req.files.photo[0].path);
      if (req.files.cnic_photo) deleteFile(req.files.cnic_photo[0].path);
    }
    const isDuplicate = error.code === 'ER_DUP_ENTRY';
    res.status(isDuplicate ? 409 : 500).json({
      status: 'error',
      message: isDuplicate ? 'Owner with this CNIC already exists' : 'Failed to create owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get owners list
const getOwners = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      is_active: req.query.is_active !== undefined ?
        (req.query.is_active === 'true' || req.query.is_active === '1') : null,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Owner.findAll(options);
    const owners = result.owners.map(owner => {
      const ownerData = owner.toJSON();
      ownerData.photo_url = getFileUrl(owner.photo, req);
      ownerData.cnic_photo_url = getFileUrl(owner.cnic_photo, req);
      return ownerData;
    });

    res.status(200).json({
      status: 'success',
      data: {
        owners,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch owners',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get owner by ID
const getOwnerById = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    const ownerData = owner.toJSON();
    ownerData.photo_url = getFileUrl(owner.photo, req);
    ownerData.cnic_photo_url = getFileUrl(owner.cnic_photo, req);

    // Fetch apartments owned by this owner
    const apartments = await Apartment.findAll({ owner_id: ownerId, limit: 200 });
    ownerData.apartments = apartments.apartments.map(apartment => apartment.toJSON());

    res.status(200).json({
      status: 'success',
      data: { owner: ownerData }
    });
  } catch (error) {
    console.error('Get owner error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update owner
const updateOwner = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const updateData = req.body;
    const updatedBy = req.user.user_id;

    if (updateData.is_active !== undefined) {
      updateData.is_active = updateData.is_active === true || updateData.is_active === 'true' || updateData.is_active === 1 ? 1 : 0;
    }

    const existingOwner = await Owner.findById(ownerId);
    if (!existingOwner) {
      if (req.files) {
        if (req.files.photo) deleteFile(req.files.photo[0].path);
        if (req.files.cnic_photo) deleteFile(req.files.cnic_photo[0].path);
      }
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    if (updateData.cnic && updateData.cnic !== existingOwner.cnic) {
      const cnicExists = await Owner.cnicExists(updateData.cnic, ownerId);
      if (cnicExists) {
        if (req.files) {
          if (req.files.photo) deleteFile(req.files.photo[0].path);
          if (req.files.cnic_photo) deleteFile(req.files.cnic_photo[0].path);
        }
        return res.status(409).json({
          status: 'error',
          message: 'Owner with this CNIC already exists'
        });
      }
    }

    if (req.files) {
      if (req.files.photo) {
        if (existingOwner.photo) deleteFile(existingOwner.photo);
        updateData.photo = req.files.photo[0].path;
      }
      if (req.files.cnic_photo) {
        if (existingOwner.cnic_photo) deleteFile(existingOwner.cnic_photo);
        updateData.cnic_photo = req.files.cnic_photo[0].path;
      }
    }

    await Owner.update(ownerId, updateData, updatedBy);
    const owner = await Owner.findById(ownerId);
    const ownerData = owner.toJSON();
    ownerData.photo_url = getFileUrl(owner.photo, req);
    ownerData.cnic_photo_url = getFileUrl(owner.cnic_photo, req);

    res.status(200).json({
      status: 'success',
      message: 'Owner updated successfully',
      data: { owner: ownerData }
    });
  } catch (error) {
    console.error('Update owner error:', error);
    if (req.files) {
      if (req.files.photo) deleteFile(req.files.photo[0].path);
      if (req.files.cnic_photo) deleteFile(req.files.cnic_photo[0].path);
    }

    const isDuplicate = error.code === 'ER_DUP_ENTRY';
    res.status(isDuplicate ? 409 : 500).json({
      status: 'error',
      message: isDuplicate ? 'Owner with this CNIC already exists' : 'Failed to update owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete owner (soft delete)
const deleteOwner = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const updatedBy = req.user.user_id;

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    await Owner.delete(ownerId, updatedBy);

    res.status(200).json({
      status: 'success',
      message: 'Owner deleted successfully'
    });
  } catch (error) {
    console.error('Delete owner error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Owner statistics
const getOwnerStats = async (req, res) => {
  try {
    const stats = await Owner.getStats();
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Get owner stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch owner statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// List apartments without an owner
const getAvailableApartments = async (req, res) => {
  try {
    const options = {
      search: req.query.search || '',
      floor_no: req.query.floor_no !== undefined ? parseInt(req.query.floor_no, 10) : null,
      limit: parseInt(req.query.limit, 10) || 50
    };

    const apartments = await Apartment.findAvailable(options);
    res.status(200).json({
      status: 'success',
      data: { apartments: apartments.map(apartment => apartment.toJSON()) }
    });
  } catch (error) {
    console.error('Get available apartments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available apartments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Assign an apartment to an owner
const assignApartmentToOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const { apartment_id } = req.body;
  const userId = req.user.user_id;

  try {
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [apartmentRows] = await connection.query(
        'SELECT apartment_id, owner_id, apartment_no, floor_no FROM apartments WHERE apartment_id = ? FOR UPDATE',
        [apartment_id]
      );

      if (apartmentRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      const apartmentRow = apartmentRows[0];

      if (apartmentRow.owner_id && apartmentRow.owner_id !== ownerId) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          status: 'error',
          message: 'Apartment is already assigned to another owner'
        });
      }

      // Mark any previous relationships inactive
      await connection.query(
        'UPDATE apartments_owners SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE apartment_id = ?',
        [userId, apartment_id]
      );

      // Update apartment owner
      await connection.query(
        'UPDATE apartments SET owner_id = ? WHERE apartment_id = ?',
        [ownerId, apartment_id]
      );

      // Create relationship history
      await connection.query(
        'INSERT INTO apartments_owners (owner_id, apartment_id, is_active, created_by, updated_by) VALUES (?, ?, 1, ?, ?)',
        [ownerId, apartment_id, userId, userId]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({
        status: 'success',
        message: 'Apartment assigned to owner successfully',
        data: {
          apartment_owner: {
            owner_id: ownerId,
            apartment_id,
            apartment_no: apartmentRow.apartment_no,
            floor_no: apartmentRow.floor_no
          }
        }
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      } finally {
        connection.release();
      }
      console.error('Assign apartment transaction error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to assign apartment to owner',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  } catch (error) {
    console.error('Assign apartment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign apartment to owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Unassign an apartment from an owner
const unassignApartmentFromOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const { apartment_id } = req.body;
  const userId = req.user.user_id;

  try {
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [apartmentRows] = await connection.query(
        'SELECT apartment_id, owner_id, apartment_no, floor_no FROM apartments WHERE apartment_id = ? FOR UPDATE',
        [apartment_id]
      );

      if (apartmentRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      const apartmentRow = apartmentRows[0];

      if (!apartmentRow.owner_id || apartmentRow.owner_id !== ownerId) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          status: 'error',
          message: 'Apartment is not assigned to this owner'
        });
      }

      await connection.query(
        'UPDATE apartments_owners SET is_active = 0, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE apartment_id = ?',
        [userId, apartment_id]
      );

      await connection.query(
        'UPDATE apartments SET owner_id = NULL WHERE apartment_id = ?',
        [apartment_id]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({
        status: 'success',
        message: 'Apartment unassigned from owner successfully',
        data: {
          apartment_id,
          owner_id: ownerId
        }
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      } finally {
        connection.release();
      }
      console.error('Unassign apartment transaction error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to unassign apartment from owner',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  } catch (error) {
    console.error('Unassign apartment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unassign apartment from owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
  getOwnerStats,
  getAvailableApartments,
  assignApartmentToOwner,
  unassignApartmentFromOwner
};

