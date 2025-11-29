const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

// CRUD routes
router.post('/', notificationsController.createNotification);
router.get('/', notificationsController.getNotifications);
router.get('/:id', notificationsController.getNotificationById);
router.put('/:id', notificationsController.updateNotification);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
