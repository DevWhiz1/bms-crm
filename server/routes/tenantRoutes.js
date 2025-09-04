const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticateToken } = require('../middleware/auth');
const { uploadTenantImages, handleUploadError } = require('../middleware/upload');
const {
  validateTenantCreation,
  validateTenantUpdate,
  validateGetTenant,
  validateGetTenants,
  validateDeleteTenant
} = require('../middleware/tenantValidation');

// All routes require authentication
router.use(authenticateToken);

// Tenant routes
router.post(
  '/',
  uploadTenantImages,
  handleUploadError,
  validateTenantCreation,
  tenantController.createTenant
);

router.get(
  '/',
  validateGetTenants,
  tenantController.getTenants
);

router.get(
  '/stats',
  tenantController.getTenantStats
);

router.get(
  '/:id',
  validateGetTenant,
  tenantController.getTenantById
);

router.put(
  '/:id',
  uploadTenantImages,
  handleUploadError,
  validateTenantUpdate,
  tenantController.updateTenant
);

router.delete(
  '/:id',
  validateDeleteTenant,
  tenantController.deleteTenant
);

module.exports = router;
