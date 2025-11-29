const express = require('express');
const router = express.Router();
const propertyVisitsController = require('../controllers/propertyVisits.controller');

// CRUD routes
router.post('/', propertyVisitsController.createPropertyVisit);
router.get('/', propertyVisitsController.getPropertyVisits);
router.get('/:id', propertyVisitsController.getPropertyVisitById);
router.put('/:id', propertyVisitsController.updatePropertyVisit);
router.delete('/:id', propertyVisitsController.deletePropertyVisit);

module.exports = router;
