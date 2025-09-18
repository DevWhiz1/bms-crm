const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateContractCreation,
  validateContractUpdate,
  validateGetContract,
  validateGetContracts,
  validateDeleteContract
} = require('../middleware/contractValidation');

// All routes require authentication
router.use(authenticateToken);

// Contract routes
router.post(
  '/',
  validateContractCreation,
  contractController.createContract
);

router.get(
  '/',
  validateGetContracts,
  contractController.getContracts
);

router.get(
  '/stats',
  contractController.getContractStats
);

router.get(
  '/apartments',
  contractController.getApartments
);

router.get(
  '/apartments/by-floor',
  contractController.getApartmentsByFloor
);

router.get(
  '/:id',
  validateGetContract,
  contractController.getContractById
);

router.put(
  '/:id',
  validateContractUpdate,
  contractController.updateContract
);

router.delete(
  '/:id',
  validateDeleteContract,
  contractController.deleteContract
);

module.exports = router;
