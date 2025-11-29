const express = require('express');
const router = express.Router();
const adminActionsController = require('../controllers/adminActions.controller');

// CRUD routes
router.post('/', adminActionsController.createAdminAction);
router.get('/', adminActionsController.getAdminActions);
router.get('/:id', adminActionsController.getAdminActionById);
router.put('/:id', adminActionsController.updateAdminAction);
router.delete('/:id', adminActionsController.deleteAdminAction);

module.exports = router;
