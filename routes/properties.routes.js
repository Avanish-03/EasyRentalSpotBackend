const express = require('express');
const router = express.Router();
const propertiesController = require('../controllers/properties.controller');

// CRUD routes
router.post('/', propertiesController.createProperty);
router.get('/', propertiesController.getProperties);
router.get('/:id', propertiesController.getPropertyById);
router.put('/:id', propertiesController.updateProperty);
router.delete('/:id', propertiesController.deleteProperty);

module.exports = router;
