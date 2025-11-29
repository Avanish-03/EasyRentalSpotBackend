const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// CRUD routes
router.post('/', reportsController.createReport);
router.get('/', reportsController.getReports);
router.get('/:id', reportsController.getReportById);
router.put('/:id', reportsController.updateReport);
router.delete('/:id', reportsController.deleteReport);

module.exports = router;
