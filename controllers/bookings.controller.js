const Booking = require('../models/Booking');

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, userId, startDate, endDate, status } = req.body;

    const booking = new Booking({
      propertyId,
      userId,
      startDate,
      endDate,
      status
    });

    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('propertyId', 'title')
      .populate('userId', 'fullName email');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'title')
      .populate('userId', 'fullName email');
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Booking
exports.updateBooking = async (req, res) => {
  try {
    const updates = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking updated", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
