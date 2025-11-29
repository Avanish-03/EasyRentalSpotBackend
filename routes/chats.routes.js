const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chats.controller');

// CRUD routes
router.post('/', chatsController.createChat);
router.get('/', chatsController.getChats);
router.get('/:id', chatsController.getChatById);
router.put('/:id', chatsController.updateChat);
router.delete('/:id', chatsController.deleteChat);

module.exports = router;
