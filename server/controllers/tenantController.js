const Tenant = require('../models/Tenant');
const { deleteFile, getFileUrl } = require('../middleware/upload');

// Create a new tenant
const createTenant = async (req, res) => {
  try {
    const tenantData = req.body;
    const createdBy = req.user.user_id;

    // Convert boolean is_active to integer (0 or 1)
    if (tenantData.is_active !== undefined) {
      tenantData.is_active = tenantData.is_active === true || tenantData.is_active === 'true' || tenantData.is_active === 1 ? 1 : 0;
    }

    // Check if CNIC already exists
    const cnicExists = await Tenant.cnicExists(tenantData.cnic);
    if (cnicExists) {
      // Clean up uploaded files if CNIC already exists
      if (req.files) {
        if (req.files.photo) {
          deleteFile(req.files.photo[0].path);
        }
        if (req.files.cnic_photo) {
          deleteFile(req.files.cnic_photo[0].path);
        }
      }
      
      return res.status(409).json({
        status: 'error',
        message: 'Tenant with this CNIC already exists'
      });
    }

    // Add file paths to tenant data
    if (req.files) {
      if (req.files.photo) {
        tenantData.photo = req.files.photo[0].path;
      }
      if (req.files.cnic_photo) {
        tenantData.cnic_photo = req.files.cnic_photo[0].path;
      }
    }

    // Create tenant
    const newTenant = await Tenant.create(tenantData, createdBy);

    // Get the created tenant with file URLs
    const tenant = await Tenant.findById(newTenant.tenant_id);
    const tenantResponse = tenant.toJSON();
    
    // Add file URLs
    tenantResponse.photo_url = getFileUrl(tenant.photo, req);
    tenantResponse.cnic_photo_url = getFileUrl(tenant.cnic_photo, req);

    res.status(201).json({
      status: 'success',
      message: 'Tenant created successfully',
      data: {
        tenant: tenantResponse
      }
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.photo) {
        deleteFile(req.files.photo[0].path);
      }
      if (req.files.cnic_photo) {
        deleteFile(req.files.cnic_photo[0].path);
      }
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Tenant with this CNIC already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create tenant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all tenants with pagination and filters
const getTenants = async (req, res) => {
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

    const result = await Tenant.findAll(options);

    // Add file URLs to each tenant
    const tenantsWithUrls = result.tenants.map(tenant => {
      const tenantData = tenant.toJSON();
      tenantData.photo_url = getFileUrl(tenant.photo, req);
      tenantData.cnic_photo_url = getFileUrl(tenant.cnic_photo, req);
      return tenantData;
    });

    res.status(200).json({
      status: 'success',
      data: {
        tenants: tenantsWithUrls,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tenants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get tenant by ID
const getTenantById = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    const tenantData = tenant.toJSON();
    tenantData.photo_url = getFileUrl(tenant.photo, req);
    tenantData.cnic_photo_url = getFileUrl(tenant.cnic_photo, req);

    res.status(200).json({
      status: 'success',
      data: {
        tenant: tenantData
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tenant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const updateData = req.body;
    const updatedBy = req.user.user_id;

    // Convert boolean is_active to integer (0 or 1)
    if (updateData.is_active !== undefined) {
      updateData.is_active = updateData.is_active === true || updateData.is_active === 'true' || updateData.is_active === 1 ? 1 : 0;
    }

    // Check if tenant exists
    const existingTenant = await Tenant.findById(tenantId);
    if (!existingTenant) {
      // Clean up uploaded files if tenant doesn't exist
      if (req.files) {
        if (req.files.photo) {
          deleteFile(req.files.photo[0].path);
        }
        if (req.files.cnic_photo) {
          deleteFile(req.files.cnic_photo[0].path);
        }
      }
      
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Check if CNIC is being updated and if it already exists
    if (updateData.cnic && updateData.cnic !== existingTenant.cnic) {
      const cnicExists = await Tenant.cnicExists(updateData.cnic, tenantId);
      if (cnicExists) {
        // Clean up uploaded files if CNIC already exists
        if (req.files) {
          if (req.files.photo) {
            deleteFile(req.files.photo[0].path);
          }
          if (req.files.cnic_photo) {
            deleteFile(req.files.cnic_photo[0].path);
          }
        }
        
        return res.status(409).json({
          status: 'error',
          message: 'Tenant with this CNIC already exists'
        });
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.photo) {
        // Delete old photo if exists
        if (existingTenant.photo) {
          deleteFile(existingTenant.photo);
        }
        updateData.photo = req.files.photo[0].path;
      }
      if (req.files.cnic_photo) {
        // Delete old CNIC photo if exists
        if (existingTenant.cnic_photo) {
          deleteFile(existingTenant.cnic_photo);
        }
        updateData.cnic_photo = req.files.cnic_photo[0].path;
      }
    }

    // Update tenant
    await Tenant.update(tenantId, updateData, updatedBy);

    // Get updated tenant
    const updatedTenant = await Tenant.findById(tenantId);
    const tenantData = updatedTenant.toJSON();
    tenantData.photo_url = getFileUrl(updatedTenant.photo, req);
    tenantData.cnic_photo_url = getFileUrl(updatedTenant.cnic_photo, req);

    res.status(200).json({
      status: 'success',
      message: 'Tenant updated successfully',
      data: {
        tenant: tenantData
      }
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.photo) {
        deleteFile(req.files.photo[0].path);
      }
      if (req.files.cnic_photo) {
        deleteFile(req.files.cnic_photo[0].path);
      }
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Tenant with this CNIC already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update tenant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete tenant (soft delete)
const deleteTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const updatedBy = req.user.user_id;

    // Check if tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Soft delete tenant
    await Tenant.delete(tenantId, updatedBy);

    res.status(200).json({
      status: 'success',
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete tenant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get tenant statistics
const getTenantStats = async (req, res) => {
  try {
    const stats = await Tenant.getStats();

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tenant statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantStats
};
