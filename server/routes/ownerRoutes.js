const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken } = require('../middleware/auth');
const { uploadOwnerImages, handleUploadError } = require('../middleware/upload');
const {
  validateOwnerCreation,
  validateOwnerUpdate,
  validateGetOwner,
  validateGetOwners,
  validateDeleteOwner,
  validateAssignApartment,
  validateUnassignApartment,
  validateGetAvailableApartments
} = require('../middleware/ownerValidation');

// All routes require authentication
router.use(authenticateToken);

router.post(
  '/',
  uploadOwnerImages,
  handleUploadError,
  validateOwnerCreation,
  ownerController.createOwner
);

router.get(
  '/',
  validateGetOwners,
  ownerController.getOwners
);

router.get(
  '/stats',
  ownerController.getOwnerStats
);

router.get(
  '/available-apartments',
  validateGetAvailableApartments,
  ownerController.getAvailableApartments
);

router.post(
  '/:id/assign-apartment',
  validateAssignApartment,
  ownerController.assignApartmentToOwner
);

router.post(
  '/:id/unassign-apartment',
  validateUnassignApartment,
  ownerController.unassignApartmentFromOwner
);

router.get(
  '/:id',
  validateGetOwner,
  ownerController.getOwnerById
);

router.put(
  '/:id',
  uploadOwnerImages,
  handleUploadError,
  validateOwnerUpdate,
  ownerController.updateOwner
);

router.delete(
  '/:id',
  validateDeleteOwner,
  ownerController.deleteOwner
);

module.exports = router;

