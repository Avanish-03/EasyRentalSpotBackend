const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');

// CRUD routes
router.post('/', documentsController.createDocument);
router.get('/', documentsController.getDocuments);
router.get('/:id', documentsController.getDocumentById);
router.put('/:id', documentsController.updateDocument);
router.delete('/:id', documentsController.deleteDocument);

module.exports = router;
