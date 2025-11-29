const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptions.controller');

// CRUD routes
router.post('/', subscriptionsController.createSubscription);
router.get('/', subscriptionsController.getSubscriptions);
router.get('/:id', subscriptionsController.getSubscriptionById);
router.put('/:id', subscriptionsController.updateSubscription);
router.delete('/:id', subscriptionsController.deleteSubscription);

module.exports = router;
