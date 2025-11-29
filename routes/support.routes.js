const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');

// CRUD routes
router.post('/', supportController.createSupport);
router.get('/', supportController.getSupports);
router.get('/:id', supportController.getSupportById);
router.put('/:id', supportController.updateSupport);
router.delete('/:id', supportController.deleteSupport);

module.exports = router;
