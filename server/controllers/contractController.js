const Contract = require('../models/Contract');
const Apartment = require('../models/Apartment');
const ApartmentTenant = require('../models/ApartmentTenant');
const Tenant = require('../models/Tenant');

// Create a new contract with apartment-tenant relationships
const createContract = async (req, res) => {
  try {
    const contractData = req.body;
    const createdBy = req.user.user_id;

    // Convert boolean is_active to integer (0 or 1)
    if (contractData.is_active !== undefined) {
      contractData.is_active = contractData.is_active === true || contractData.is_active === 'true' || contractData.is_active === 1 ? 1 : 0;
    }

    // Validate required fields
    const { rent, service_charges, security_fees, contract_start_date, contract_end_date, tenant_id, apartments } = contractData;

    if (!rent || !service_charges || !security_fees || !contract_start_date || !contract_end_date || !tenant_id || !apartments || !Array.isArray(apartments) || apartments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: rent, service_charges, security_fees, contract_start_date, contract_end_date, tenant_id, and apartments array'
      });
    }

    // Check if tenant exists
    const tenant = await Tenant.findById(tenant_id);
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Validate apartments exist
    for (const apartmentId of apartments) {
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) {
        return res.status(404).json({
          status: 'error',
          message: `Apartment with ID ${apartmentId} not found`
        });
      }
    }

    // Create contract
    const newContract = await Contract.create(contractData, createdBy);

    // Create apartment-tenant relationships
    const apartmentTenantData = apartments.map(apartmentId => ({
      tenant_id: parseInt(tenant_id),
      apartment_id: parseInt(apartmentId),
      contract_id: newContract.contract_id,
      is_active: 1
    }));

    await ApartmentTenant.createMultiple(apartmentTenantData, createdBy);

    // Get the created contract with related data
    const contract = await Contract.findById(newContract.contract_id);
    const contractResponse = contract.toJSON();

    res.status(201).json({
      status: 'success',
      message: 'Contract created successfully',
      data: {
        contract: contractResponse,
        apartments: apartments
      }
    });
  } catch (error) {
    console.error('Create contract error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Contract with this data already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create contract',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all contracts with pagination and filters
const getContracts = async (req, res) => {
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

    const result = await Contract.findAll(options);

    // Get apartment-tenant relationships for each contract
    const contractsWithDetails = await Promise.all(
      result.contracts.map(async (contract) => {
        const contractData = contract.toJSON();
        
        // Get apartment-tenant relationships for this contract
        const apartmentTenants = await ApartmentTenant.findAll({
          contract_id: contract.contract_id,
          is_active: 1,
          page: 1,
          limit: 100
        });

        contractData.apartments = apartmentTenants.apartment_tenants.map(at => ({
          apartment_id: at.apartment_id,
          apartment_no: at.apartment_no,
          floor_no: at.floor_no,
          tenant_name: at.tenant_name,
          tenant_cnic: at.tenant_cnic
        }));

        return contractData;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        contracts: contractsWithDetails,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contracts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get contract by ID with full details
const getContractById = async (req, res) => {
  try {
    const contractId = req.params.id;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found'
      });
    }

    const contractData = contract.toJSON();

    // Get apartment-tenant relationships for this contract
    const apartmentTenants = await ApartmentTenant.findAll({
      contract_id: contractId,
      is_active: 1,
      page: 1,
      limit: 100
    });

    contractData.apartments = apartmentTenants.apartment_tenants.map(at => ({
      apartment_id: at.apartment_id,
      apartment_no: at.apartment_no,
      floor_no: at.floor_no,
      tenant_name: at.tenant_name,
      tenant_cnic: at.tenant_cnic,
      tenant_mobile: at.tenant_mobile
    }));

    // Add tenant information to contract data for editing
    if (apartmentTenants.apartment_tenants.length > 0) {
      const firstTenant = apartmentTenants.apartment_tenants[0];
      contractData.tenant_id = firstTenant.tenant_id;
      contractData.tenant_name = firstTenant.tenant_name;
      contractData.tenant_cnic = firstTenant.tenant_cnic;
      contractData.tenant_mobile = firstTenant.tenant_mobile;
    }

    res.status(200).json({
      status: 'success',
      data: {
        contract: contractData
      }
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contract',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update contract
const updateContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const updateData = req.body;
    const updatedBy = req.user.user_id;

    // Convert boolean is_active to integer (0 or 1)
    if (updateData.is_active !== undefined) {
      updateData.is_active = updateData.is_active === true || updateData.is_active === 'true' || updateData.is_active === 1 ? 1 : 0;
    }

    // Check if contract exists
    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found'
      });
    }

    // Update contract
    await Contract.update(contractId, updateData, updatedBy);

    // If apartments are being updated
    if (updateData.apartments && Array.isArray(updateData.apartments)) {
      // Get existing apartment-tenant relationships to find tenant_id
      const existingRelations = await ApartmentTenant.findAll({
        contract_id: contractId,
        page: 1,
        limit: 100
      });

      // Get tenant_id from existing relationships or from updateData
      let tenantId = updateData.tenant_id;
      if (!tenantId && existingRelations.apartment_tenants.length > 0) {
        tenantId = existingRelations.apartment_tenants[0].tenant_id;
      }

      if (!tenantId) {
        return res.status(400).json({
          status: 'error',
          message: 'Tenant ID is required for apartment updates'
        });
      }

      // Deactivate existing apartment-tenant relationships
      for (const relation of existingRelations.apartment_tenants) {
        await ApartmentTenant.delete(relation.apartment_tenant_id, updatedBy);
      }

      // Create new apartment-tenant relationships
      const apartmentTenantData = updateData.apartments.map(apartmentId => ({
        tenant_id: parseInt(tenantId),
        apartment_id: parseInt(apartmentId),
        contract_id: parseInt(contractId),
        is_active: 1
      }));

      await ApartmentTenant.createMultiple(apartmentTenantData, updatedBy);
    }

    // Get updated contract
    const updatedContract = await Contract.findById(contractId);
    const contractData = updatedContract.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'Contract updated successfully',
      data: {
        contract: contractData
      }
    });
  } catch (error) {
    console.error('Update contract error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Contract with this data already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update contract',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete contract (soft delete)
const deleteContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const updatedBy = req.user.user_id;

    // Check if contract exists
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found'
      });
    }

    // Soft delete contract
    await Contract.delete(contractId, updatedBy);

    // Also deactivate related apartment-tenant relationships
    const apartmentTenants = await ApartmentTenant.findAll({
      contract_id: contractId,
      page: 1,
      limit: 100
    });

    for (const relation of apartmentTenants.apartment_tenants) {
      await ApartmentTenant.delete(relation.apartment_tenant_id, updatedBy);
    }

    res.status(200).json({
      status: 'success',
      message: 'Contract deleted successfully'
    });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete contract',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get contract statistics
const getContractStats = async (req, res) => {
  try {
    const stats = await Contract.getStats();

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get contract stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contract statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all apartments
const getApartments = async (req, res) => {
  try {
    const options = {
      page: 1,
      limit: 1000, // Get all apartments
      search: req.query.search || '',
      floor_no: req.query.floor_no || null,
      sortBy: 'floor_no',
      sortOrder: 'ASC'
    };

    const result = await Apartment.findAll(options);

    res.status(200).json({
      status: 'success',
      data: {
        apartments: result.apartments.map(apartment => apartment.toJSON())
      }
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch apartments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get apartments grouped by floor
const getApartmentsByFloor = async (req, res) => {
  try {
    const apartmentsByFloor = await Apartment.getByFloor();

    res.status(200).json({
      status: 'success',
      data: {
        apartments_by_floor: apartmentsByFloor
      }
    });
  } catch (error) {
    console.error('Get apartments by floor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch apartments by floor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
  getContractStats,
  getApartments,
  getApartmentsByFloor
};
