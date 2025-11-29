const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');

// CRUD routes
router.post('/', bookingsController.createBooking);
router.get('/', bookingsController.getBookings);
router.get('/:id', bookingsController.getBookingById);
router.put('/:id', bookingsController.updateBooking);
router.delete('/:id', bookingsController.deleteBooking);

module.exports = router;
