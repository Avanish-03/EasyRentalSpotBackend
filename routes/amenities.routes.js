const express = require('express');
const router = express.Router();
const amenitiesController = require('../controllers/amenities.controller');

// CRUD routes
router.post('/', amenitiesController.createAmenity);
router.get('/', amenitiesController.getAmenities);
router.get('/:id', amenitiesController.getAmenityById);
router.put('/:id', amenitiesController.updateAmenity);
router.delete('/:id', amenitiesController.deleteAmenity);

module.exports = router;
