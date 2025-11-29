const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');

// CRUD routes
router.post('/', paymentsController.createPayment);
router.get('/', paymentsController.getPayments);
router.get('/:id', paymentsController.getPaymentById);
router.put('/:id', paymentsController.updatePayment);
router.delete('/:id', paymentsController.deletePayment);

module.exports = router;
